import httpStatus from 'http-status';
import { FilterQuery, Types } from 'mongoose';
import AppError from '../../error/AppError';
import { Booking } from '../Booking/booking.model';
import { TProduct } from '../Products/products.interface';
import { Product } from '../Products/products.model';
import { roundPrice } from '../Products/products.utils';
import { FLASH_SALE_STATES } from './flashSale.constant';
import {
  TFlashSaleRecord,
  TFlashSaleState,
} from './flashSale.interface';
import { FlashSale } from './flashSale.model';

type TProductWithSale = Pick<TProduct, 'name' | 'image' | 'price' | 'flashSale'> & {
  _id: Types.ObjectId;
};

type TFlashSaleSettings = {
  discountPercentage: number;
  startAt: Date;
  endAt: Date;
  quantityLimit?: number;
};

// same order of checks as the store uses for the price
export const getFlashSaleState = (
  record: Pick<
    TFlashSaleRecord,
    'status' | 'startAt' | 'endAt' | 'quantityLimit' | 'soldCount'
  >,
  now = new Date(),
): TFlashSaleState => {
  if (record.status !== 'active') return record.status;
  if (now < record.startAt) return 'scheduled';
  if (now >= record.endAt) return 'ended';
  if (record.quantityLimit && record.soldCount >= record.quantityLimit) {
    return 'sold-out';
  }
  return 'live';
};

/**
 * A sale set before history was kept has no record. One is made from what the
 * product still holds, and linked to it, so it is never lost.
 */
export const ensureFlashSaleRecord = async (
  product: TProductWithSale,
): Promise<Types.ObjectId | undefined> => {
  const sale = product.flashSale;
  if (!sale) return undefined;
  if (sale.saleId) return sale.saleId;

  const record = await FlashSale.create({
    product: product._id,
    productName: product.name,
    productImage: product.image,
    regularPrice: product.price,
    discountPercentage: sale.discountPercentage,
    startAt: sale.startAt,
    endAt: sale.endAt,
    quantityLimit: sale.quantityLimit,
    soldCount: sale.soldCount,
    isLegacy: true,
  });

  // only link it if no other request linked a record in the meantime
  const linked = await Product.updateOne(
    {
      _id: product._id,
      'flashSale.startAt': sale.startAt,
      'flashSale.saleId': { $exists: false },
    },
    { $set: { 'flashSale.saleId': record._id } },
  );

  if (!linked.modifiedCount) {
    await FlashSale.deleteOne({ _id: record._id });
    const fresh = await Product.findById(product._id).select('flashSale');
    sale.saleId = fresh?.flashSale?.saleId;
    return sale.saleId;
  }

  sale.saleId = record._id;
  return record._id;
};

/** links every running sale that has no record yet, e.g. before the history page loads */
const ensureAllFlashSaleRecords = async () => {
  const products = await Product.find({
    flashSale: { $exists: true },
    'flashSale.saleId': { $exists: false },
  }).select('name image price flashSale');

  for (const product of products) {
    await ensureFlashSaleRecord(product);
  }
};

/**
 * Called before a product's sale is removed or replaced. A sale that already
 * ended or sold out keeps that state; one stopped early is marked with why.
 */
export const closeFlashSale = async (
  product: TProductWithSale,
  reason: 'removed' | 'replaced',
  now = new Date(),
) => {
  const sale = product.flashSale;
  if (!sale) return;

  const saleId = await ensureFlashSaleRecord(product);
  if (!saleId) return;

  const record = await FlashSale.findById(saleId);
  if (!record) return;

  const state = getFlashSaleState(record, now);
  if (state === 'scheduled' || state === 'live') {
    await FlashSale.updateOne(
      { _id: saleId, status: 'active' },
      { status: reason, closedAt: now },
    );
  }
};

/** makes the record for a new sale; the product then points to it */
export const createFlashSaleRecord = async (
  product: TProductWithSale,
  settings: TFlashSaleSettings,
) => {
  const record = await FlashSale.create({
    product: product._id,
    productName: product.name,
    productImage: product.image,
    regularPrice: product.price,
    ...settings,
    soldCount: 0,
  });
  return record._id;
};

/** keeps the record's sold count in step with the product's */
export const changeFlashSaleSold = async (
  saleId: Types.ObjectId | string,
  quantity: number,
) => {
  if (quantity >= 0) {
    await FlashSale.updateOne({ _id: saleId }, { $inc: { soldCount: quantity } });
    return;
  }
  await FlashSale.updateOne(
    { _id: saleId, soldCount: { $gte: -quantity } },
    { $inc: { soldCount: quantity } },
  );
};

const PAGE_LIMIT = { default: 10, max: 100 };

const isState = (value: unknown): value is TFlashSaleState =>
  typeof value === 'string' &&
  (FLASH_SALE_STATES as readonly string[]).includes(value);

// the database version of getFlashSaleState, for filtering
const stateFilter = (
  state: TFlashSaleState,
  now: Date,
): FilterQuery<TFlashSaleRecord> => {
  const running = { status: 'active', startAt: { $lte: now }, endAt: { $gt: now } };

  switch (state) {
    case 'removed':
    case 'replaced':
      return { status: state };
    case 'scheduled':
      return { status: 'active', startAt: { $gt: now } };
    case 'ended':
      return { status: 'active', endAt: { $lte: now } };
    case 'sold-out':
      return {
        ...running,
        quantityLimit: { $gte: 1 },
        $expr: { $gte: ['$soldCount', '$quantityLimit'] },
      };
    case 'live':
      return {
        ...running,
        $or: [
          { quantityLimit: null },
          { $expr: { $lt: ['$soldCount', '$quantityLimit'] } },
        ],
      };
  }
};

/** every flash sale, newest first, with what each one earned */
const getFlashSaleHistoryFromDb = async (query: Record<string, unknown>) => {
  await ensureAllFlashSaleRecords();

  const now = new Date();
  const page = Math.max(1, Math.floor(Number(query.page)) || 1);
  const limit = Math.min(
    PAGE_LIMIT.max,
    Math.max(1, Math.floor(Number(query.limit)) || PAGE_LIMIT.default),
  );

  // only known options become filters
  const filter: FilterQuery<TFlashSaleRecord> = isState(query.state)
    ? stateFilter(query.state, now)
    : {};
  if (query.product !== undefined) {
    if (typeof query.product !== 'string' || !Types.ObjectId.isValid(query.product)) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid product id');
    }
    filter.product = new Types.ObjectId(query.product);
  }

  const [records, total] = await Promise.all([
    FlashSale.find(filter)
      .sort({ startAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    FlashSale.countDocuments(filter),
  ]);

  // revenue comes from the orders linked to each sale, cancelled ones left out
  const ids = records.map((record) => record._id);
  const earnings = await Booking.aggregate<{
    _id: Types.ObjectId;
    revenue: number;
    orderCount: number;
  }>([
    { $match: { status: { $ne: 'cancelled' }, 'items.flashSaleId': { $in: ids } } },
    { $unwind: '$items' },
    { $match: { 'items.flashSaleId': { $in: ids } } },
    {
      $group: {
        _id: '$items.flashSaleId',
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        orders: { $addToSet: '$_id' },
      },
    },
    { $project: { revenue: 1, orderCount: { $size: '$orders' } } },
  ]);
  const earningsById = new Map(
    earnings.map((item) => [item._id.toString(), item]),
  );

  const result = records.map((record) => {
    const earned = earningsById.get(record._id.toString());
    return {
      ...record,
      state: getFlashSaleState(record, now),
      revenue: roundPrice(earned?.revenue ?? 0),
      orderCount: earned?.orderCount ?? 0,
    };
  });

  return {
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
    result,
  };
};

/**
 * Everything one product ever sold at a flash price, from its orders. This
 * also counts orders from before history was kept.
 */
const getProductFlashSaleSummaryFromDb = async (productId: string) => {
  if (!Types.ObjectId.isValid(productId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid product id');
  }
  const product = new Types.ObjectId(productId);

  const [summary] = await Booking.aggregate<{
    unitsSold: number;
    revenue: number;
    orderCount: number;
  }>([
    {
      $match: {
        status: { $ne: 'cancelled' },
        items: { $elemMatch: { product, isFlashSale: true } },
      },
    },
    { $unwind: '$items' },
    { $match: { 'items.product': product, 'items.isFlashSale': true } },
    {
      $group: {
        _id: null,
        unitsSold: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        orders: { $addToSet: '$_id' },
      },
    },
    { $project: { _id: 0, unitsSold: 1, revenue: 1, orderCount: { $size: '$orders' } } },
  ]);

  const saleCount = await FlashSale.countDocuments({ product });

  return {
    saleCount,
    unitsSold: summary?.unitsSold ?? 0,
    revenue: roundPrice(summary?.revenue ?? 0),
    orderCount: summary?.orderCount ?? 0,
  };
};

export const FlashSaleServices = {
  getFlashSaleHistoryFromDb,
  getProductFlashSaleSummaryFromDb,
};
