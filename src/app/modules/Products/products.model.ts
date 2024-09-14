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
    category: { type: String, required: true, message: 'Category Required' },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Product = model<TProduct>('Product', productschema);
