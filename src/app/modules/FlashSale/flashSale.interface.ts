import { Types } from 'mongoose';
import { FLASH_SALE_RECORD_STATUS, FLASH_SALE_STATES } from './flashSale.constant';

/** removed and replaced are set when the admin stops a sale early */
export type TFlashSaleRecordStatus = (typeof FLASH_SALE_RECORD_STATUS)[number];

/** what the dashboard shows, worked out from the record and the time */
export type TFlashSaleState = (typeof FLASH_SALE_STATES)[number];

// one flash sale on one product, kept after the sale is over
export type TFlashSaleRecord = {
  product: Types.ObjectId;
  /** copies from when the sale started, so the history reads right later */
  productName: string;
  productImage?: string;
  regularPrice: number;
  discountPercentage: number;
  startAt: Date;
  endAt: Date;
  quantityLimit?: number;
  /** units sold at the flash price; goes down again when an order is cancelled */
  soldCount: number;
  status: TFlashSaleRecordStatus;
  /** when the admin removed or replaced it */
  closedAt?: Date;
  /** made from a sale that started before history was kept; its earlier orders are not linked */
  isLegacy: boolean;
};
