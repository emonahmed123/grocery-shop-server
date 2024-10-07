import { model, Schema } from 'mongoose';
import { TReview } from './review.interface';

const reviewSchema = new Schema<TReview>({
  userName: {
    type: String,
    required: true,
  },
  review: {
    type: String,
    required: true,
  },
  productId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
});

export const Review = model<TReview>('Review', reviewSchema);
