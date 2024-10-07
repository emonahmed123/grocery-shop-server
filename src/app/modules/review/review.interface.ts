import { Types } from 'mongoose';

export type TReview = {
  userName: string;
  review: string;
  productId: Types.ObjectId;
};
