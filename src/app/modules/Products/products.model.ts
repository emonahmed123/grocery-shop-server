import { model, Schema } from 'mongoose';
import { TFlashSale, TProduct, TVariation } from './products.interface';
import { getCurrentPrice } from './products.utils';

const flashSaleSchema = new Schema<TFlashSale>(
  {
    discountPercentage: { type: Number, required: true, min: 1, max: 99 },
    startAt: { type: Date, required: true },
    endAt: {
      type: Date,
      required: true,
      validate: {
        validator: function (this: TFlashSale, endAt: Date) {
          return !this.startAt || endAt > this.startAt;
        },
        message: 'Flash sale must end after it starts',
      },
    },
    quantityLimit: { type: Number, min: 1 },
    soldCount: { type: Number, default: 0, min: 0 },
    saleId: { type: Schema.Types.ObjectId, ref: 'FlashSale' },
  },
  { _id: false },
);

const variationSchema = new Schema<TVariation>(
  {
    name: { type: String, required: true, trim: true },
    values: { type: [String], required: true },
  },
  { _id: false },
);

const productschema = new Schema<TProduct>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    image: { type: String, required: [true, 'Image is required'] },
    unit: { type: String, required: [true, 'Unit is required'], trim: true },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    salePrice: { type: Number, min: 0 },
    maxPrice: { type: Number, min: 0 },
    description: { type: String, trim: true },
    gallery: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    variations: { type: variationSchema },
    category: { type: String, trim: true },
    isAvailable: { type: Boolean, default: true },
    inStock: { type: Number, default: 0 },
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
    flashSale: { type: flashSaleSchema },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// what the customer pays right now, worked out on every read so an ended
// flash sale never shows its old price
productschema.virtual('currentPrice').get(function () {
  if (this.price === undefined) return undefined;
  return getCurrentPrice(this).price;
});

productschema.virtual('isOnFlashSale').get(function () {
  if (this.price === undefined) return undefined;
  return getCurrentPrice(this).isFlashSale;
});

export const Product = model<TProduct>('Product', productschema);
