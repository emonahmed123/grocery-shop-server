import httpStatus from 'http-status';
import { Types } from 'mongoose';
import AppError from '../../error/AppError';
import { Booking } from '../Booking/booking.model';
import { Product } from '../Products/products.model';
import { User } from '../user/user.model';
import { TCreateReviewPayload } from './review.interface';
import { Review } from './review.model';

const toObjectId = (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid product id');
  }
  return new Types.ObjectId(id);
};

// only a customer who got the product (a delivered order) can review it
const hasBought = async (userId: string, productId: Types.ObjectId) =>
  Boolean(
    await Booking.exists({
      userId: new Types.ObjectId(userId),
      status: 'delivered',
      'items.product': productId,
    }),
  );

// the product keeps its average so lists can show and sort by it
const updateProductRating = async (productId: Types.ObjectId) => {
  const [stats] = await Review.aggregate([
    { $match: { productId, rating: { $gte: 1 } } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  await Product.updateOne(
    { _id: productId },
    {
      averageRating: stats ? Math.round(stats.averageRating * 10) / 10 : 0,
      ratingCount: stats?.ratingCount ?? 0,
    },
  );
};

const getReviewsFromDB = async (id: string) => {
  const reviews = await Review.find(
    { productId: toObjectId(id) },
    { productId: 0, __v: 0 },
  )
    .sort('-createdAt')
    .limit(100);
  return reviews;
};

const getReviewEligibilityFromDB = async (
  productId: string,
  userId: string,
) => {
  const product = toObjectId(productId);
  const [purchased, reviewed] = await Promise.all([
    hasBought(userId, product),
    Review.exists({ productId: product, userId: new Types.ObjectId(userId) }),
  ]);

  return {
    hasPurchased: purchased,
    hasReviewed: Boolean(reviewed),
    canReview: purchased && !reviewed,
  };
};

const createReviewIntoDB = async (
  payload: TCreateReviewPayload,
  userId: string,
) => {
  const productId = toObjectId(payload.productId);

  const product = await Product.exists({ _id: productId, isDeleted: false });
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'This product is not found');
  }

  if (!(await hasBought(userId, productId))) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You can review a product after an order with it has been delivered to you',
    );
  }

  if (await Review.exists({ productId, userId: new Types.ObjectId(userId) })) {
    throw new AppError(
      httpStatus.CONFLICT,
      'You have already reviewed this product',
    );
  }

  const user = await User.findById(userId).select('name').lean();
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found');
  }

  // the name comes from the account, never from the request
  const result = await Review.create({
    productId,
    userId,
    userName: user.name,
    rating: payload.rating,
    review: payload.review,
  });

  await updateProductRating(productId);

  return result;
};

export const ReviewServices = {
  getReviewsFromDB,
  getReviewEligibilityFromDB,
  createReviewIntoDB,
};
