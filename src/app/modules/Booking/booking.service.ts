import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import { Product } from '../Products/products.model';
import { getCurrentPrice, roundPrice } from '../Products/products.utils';
import { USER_ROLE } from '../user/user.canstance';
import { DELIVERY_FEES } from './booking.constant';
import {
  TBookingStatus,
  TCreateBookingPayload,
  TOrderItem,
} from './booking.interface';
import { Booking } from './booking.model';

// the order a booking moves forward in; cancelled is handled on its own
const STATUS_FLOW: TBookingStatus[] = [
  'pending',
  'confirmed',
  'shipped',
  'delivered',
];

const getDeliveryFee = (district: string) =>
  district.trim().toLowerCase() === 'dhaka'
    ? DELIVERY_FEES.insideDhaka
    : DELIVERY_FEES.outsideDhaka;

type TStockLine = {
  product: Types.ObjectId | string;
  quantity: number;
  isFlashSale?: boolean;
};

// gives back the stock (and flash sale units) that were taken for an order
const restoreStock = async (items: TStockLine[]) => {
  await Promise.all(
    items.map(async (item) => {
      await Product.updateOne(
        { _id: item.product },
        { $inc: { inStock: item.quantity } },
      );

      if (item.isFlashSale) {
        await Product.updateOne(
          { _id: item.product, 'flashSale.soldCount': { $gte: item.quantity } },
          { $inc: { 'flashSale.soldCount': -item.quantity } },
        );
      }
    }),
  );
};

const createBookingIntoDb = async (
  payload: TCreateBookingPayload,
  userId: string,
) => {
  const now = new Date();
  const productIds = [...new Set(payload.items.map((item) => item.product))];
  const products = await Product.find({
    _id: { $in: productIds },
    isDeleted: false,
  });
  const productMap = new Map(
    products.map((product) => [product._id.toString(), product]),
  );

  payload.items.forEach((item) => {
    const product = productMap.get(item.product);

    if (!product) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        `Product ${item.product} is not found`,
      );
    }
    if (!product.isAvailable) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `${product.name} is not available`,
      );
    }
    if (
      item.variation &&
      !product.variations?.values.includes(item.variation)
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `${item.variation} is not a valid option for ${product.name}`,
      );
    }
  });

  // one product can come twice with different variations,
  // so stock and flash sale limits are checked per product
  const quantityByProduct = new Map<string, number>();
  payload.items.forEach((item) => {
    quantityByProduct.set(
      item.product,
      (quantityByProduct.get(item.product) || 0) + item.quantity,
    );
  });

  // price always comes from the database, never the client
  const priceByProduct = new Map(
    [...quantityByProduct].map(([productId, quantity]) => [
      productId,
      getCurrentPrice(productMap.get(productId)!, quantity, now),
    ]),
  );

  const items: TOrderItem[] = payload.items.map((item) => {
    const product = productMap.get(item.product)!;
    const { price, isFlashSale } = priceByProduct.get(item.product)!;

    return {
      product: product._id,
      name: product.name,
      image: product.image,
      unit: product.unit,
      variation: item.variation,
      price,
      isFlashSale,
      quantity: item.quantity,
    };
  });

  // take the stock; if any product runs short, give back what was taken
  const reserved: TStockLine[] = [];
  for (const [productId, quantity] of quantityByProduct) {
    const product = productMap.get(productId)!;
    const { isFlashSale } = priceByProduct.get(productId)!;

    const filter: Record<string, unknown> = {
      _id: productId,
      inStock: { $gte: quantity },
    };
    const increment: Record<string, number> = { inStock: -quantity };

    // the flash price is only kept if the same sale still has room
    if (isFlashSale) {
      const flashSale = product.flashSale!;
      filter['flashSale.discountPercentage'] = flashSale.discountPercentage;
      filter['flashSale.startAt'] = { $lte: now };
      filter['flashSale.endAt'] = { $gt: now };
      if (flashSale.quantityLimit) {
        filter['flashSale.soldCount'] = {
          $lte: flashSale.quantityLimit - quantity,
        };
      }
      increment['flashSale.soldCount'] = quantity;
    }

    const updated = await Product.findOneAndUpdate(filter, {
      $inc: increment,
    });

    if (!updated) {
      await restoreStock(reserved);

      const latest = await Product.findById(productId).select('inStock');
      throw new AppError(
        httpStatus.BAD_REQUEST,
        !latest || latest.inStock < quantity
          ? `${product.name} does not have enough stock`
          : `The flash sale for ${product.name} has changed, please try again`,
      );
    }
    reserved.push({ product: productId, quantity, isFlashSale });
  }

  const subTotal = roundPrice(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  );
  const deliveryFee = getDeliveryFee(payload.shippingAddress.district);
  const totalAmount = roundPrice(subTotal + deliveryFee);

  try {
    const result = await Booking.create({
      userId,
      items,
      shippingAddress: payload.shippingAddress,
      deliveryInstructions: payload.deliveryInstructions,
      paymentMethod: payload.paymentMethod,
      subTotal,
      deliveryFee,
      totalAmount,
    });

    return result;
  } catch (err) {
    await restoreStock(reserved);
    throw err;
  }
};

const getAllBookingIntoDb = async (query: Record<string, unknown>) => {
  const bookingQuery = new QueryBuilder(Booking.find(), query)
    .search(['items.name', 'shippingAddress.phone', 'shippingAddress.district'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await bookingQuery.modelQuery.populate({
    path: 'userId',
    select: 'name email',
  });
  const meta = await bookingQuery.countTotal();

  return {
    meta,
    result,
  };
};

const getSingleBookingFromDb = async (id: string, user: JwtPayload) => {
  const result = await Booking.findById(id);

  // a user can only see their own booking
  if (
    !result ||
    (user.role !== USER_ROLE.admin && result.userId.toString() !== user.userId)
  ) {
    throw new AppError(httpStatus.NOT_FOUND, 'This booking is not found');
  }

  return result.populate({ path: 'userId', select: 'name email' });
};

const TotalSaleIntoDb = async () => {
  const [Pending, result] = await Promise.all([
    Booking.countDocuments({ status: 'pending' }),
    Booking.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, totalAmount: { $sum: '$totalAmount' } } },
    ]),
  ]);

  return { Pending, totalAmount: result[0]?.totalAmount || 0 };
};

const getMyBookingIntoDb = async (userId: string) => {
  const result = await Booking.find({ userId }).sort('-createdAt');

  return result;
};

const getBookingByUserIntoDb = async (userId: string) => {
  const [myTotalBooking, pending, result] = await Promise.all([
    Booking.countDocuments({ userId, status: 'delivered' }),
    Booking.countDocuments({ userId, status: 'pending' }),
    Booking.aggregate([
      {
        $match: { userId: new Types.ObjectId(userId), status: 'delivered' },
      },
      { $group: { _id: null, totalAmount: { $sum: '$totalAmount' } } },
    ]),
  ]);

  return { myTotalBooking, totalAmount: result[0]?.totalAmount || 0, pending };
};

const cancelBookingIntoDb = async (id: string, user: JwtPayload) => {
  const booking = await Booking.findById(id);
  const isAdmin = user.role === USER_ROLE.admin;

  if (!booking || (!isAdmin && booking.userId.toString() !== user.userId)) {
    throw new AppError(httpStatus.NOT_FOUND, 'This booking is not found');
  }

  // a customer can cancel only before the shop confirms the order
  const cancellableStatus: TBookingStatus[] = isAdmin
    ? ['pending', 'confirmed', 'shipped']
    : ['pending'];

  if (!cancellableStatus.includes(booking.status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `This booking can not be cancelled, it is ${booking.status}`,
    );
  }

  // the status check stops two requests from cancelling (and restocking) twice
  const result = await Booking.findOneAndUpdate(
    { _id: id, status: booking.status },
    { status: 'cancelled' },
    { new: true },
  );

  if (!result) {
    throw new AppError(
      httpStatus.CONFLICT,
      'This booking was changed, please try again',
    );
  }

  await restoreStock(booking.items);

  return result;
};

const updateBookingStatusIntoDb = async (
  id: string,
  status: TBookingStatus,
  user: JwtPayload,
) => {
  if (status === 'cancelled') {
    return cancelBookingIntoDb(id, user);
  }

  const booking = await Booking.findById(id);

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, 'This booking is not found');
  }

  if (booking.status === 'cancelled' || booking.status === 'delivered') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `This booking is already ${booking.status}`,
    );
  }

  if (STATUS_FLOW.indexOf(status) <= STATUS_FLOW.indexOf(booking.status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Status can not go from ${booking.status} to ${status}`,
    );
  }

  const updateData: Record<string, unknown> = { status };

  // cash is collected on delivery
  if (status === 'delivered' && booking.paymentMethod === 'cash-on-delivery') {
    updateData.paymentStatus = 'paid';
  }

  const result = await Booking.findOneAndUpdate(
    { _id: id, status: booking.status },
    updateData,
    { new: true, runValidators: true },
  );

  if (!result) {
    throw new AppError(
      httpStatus.CONFLICT,
      'This booking was changed, please try again',
    );
  }

  return result;
};

export const BookingService = {
  createBookingIntoDb,
  getAllBookingIntoDb,
  getSingleBookingFromDb,
  getMyBookingIntoDb,
  cancelBookingIntoDb,
  updateBookingStatusIntoDb,
  TotalSaleIntoDb,
  getBookingByUserIntoDb,
};
