import { Types } from 'mongoose';

export type TReview = {
  productId: Types.ObjectId;
  /** older reviews were saved without the user */
  userId?: Types.ObjectId;
  userName: string;
  /** 1 to 5 stars; older reviews have none */
  rating?: number;
  review: string;
};

export type TCreateReviewPayload = {
  productId: string;
  rating: number;
  review: string;
};
