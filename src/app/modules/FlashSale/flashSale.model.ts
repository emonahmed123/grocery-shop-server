import { model, Schema } from 'mongoose';
import { FLASH_SALE_RECORD_STATUS } from './flashSale.constant';
import { TFlashSaleRecord } from './flashSale.interface';

const flashSaleRecordSchema = new Schema<TFlashSaleRecord>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    productImage: { type: String },
    regularPrice: { type: Number, required: true, min: 0 },
    discountPercentage: { type: Number, required: true, min: 1, max: 99 },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    quantityLimit: { type: Number, min: 1 },
    soldCount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: FLASH_SALE_RECORD_STATUS,
      default: 'active',
    },
    closedAt: { type: Date },
    isLegacy: { type: Boolean, default: false },
  },
  { timestamps: true },
);

flashSaleRecordSchema.index({ product: 1, startAt: -1 });
flashSaleRecordSchema.index({ startAt: -1 });

export const FlashSale = model<TFlashSaleRecord>(
  'FlashSale',
  flashSaleRecordSchema,
);
