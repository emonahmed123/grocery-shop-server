import { model, Schema } from 'mongoose';
import { TCategory, TCategoryImage, TSubCategory } from './category.interface';

const categoryImageSchema = new Schema<TCategoryImage>(
  {
    thumbnail: { type: String, required: [true, 'Thumbnail is required'] },
    original: { type: String, required: [true, 'Original image is required'] },
  },
  { _id: false },
);

const subCategorySchema = new Schema<TSubCategory>(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      trim: true,
      lowercase: true,
    },
  },
  { _id: false },
);

const categorySchema = new Schema<TCategory>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    image: { type: categoryImageSchema, required: [true, 'Image is required'] },
    icon: { type: String },
    children: { type: [subCategorySchema], default: [] },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Category = model<TCategory>('Category', categorySchema);
