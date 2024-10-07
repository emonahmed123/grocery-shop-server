import { Types } from 'mongoose';
import { TReview } from './review.interface';
import { Review } from './review.model';

const getReviewsFromDB = async (id: string) => {
  const reviews = await Review.find(
    { productId: new Types.ObjectId(id) },
    { productId: 0 },
  );
  return reviews;
};

const createReviewIntoDB = async (payload: TReview) => {
  const result = await Review.create(payload);
  return result;
};

export const ReviewServices = {
  getReviewsFromDB,
  createReviewIntoDB,
};
