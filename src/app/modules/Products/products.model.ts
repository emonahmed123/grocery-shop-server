import { model, Schema } from 'mongoose';
import { TOffer, TProduct } from './products.interface';

const offerSchema = new Schema<TOffer>(
  {
    offerType: {
      type: String,
      enum: ['discount', 'freeshipping'],
      required: true,
    },
    value: { type: Number, required: true },
    validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { _id: false },
);

const productschema = new Schema<TProduct>(
  {
    name: {
      type: String,
      required: true,
      min: [3, 'Must be at least 3, got {VALUE}'],
      message: '{VALUE} is required',
    },
    description: {
      type: String,
      required: true,
      min: [5, 'Must be at least 3, got {VALUE}'],
      message: '{VALUE} is required',
    },
    category: { type: String, required: true, message: 'Category Required' },
    price: { type: Number, required: true },
    isAvailable: { type: Boolean, default: true },
    inStock: { type: Number, default: 0 },
    image: { type: String, required: true },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isDeleted: { type: Boolean, default: false },
    offer: [offerSchema],
  },
  { timestamps: true },
);

export const Product = model<TProduct>('Product', productschema);
