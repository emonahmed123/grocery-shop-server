import { model, Schema } from 'mongoose';
import { TProduct } from './products.interface';

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
    pricePerHour: {
      type: Number,
      required: true,
      message: '{VALUE} is required',
    },
    location: { type: String, required: true },
    image: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Product = model<TProduct>('Product', productschema);
