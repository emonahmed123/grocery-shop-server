import { model, Schema } from 'mongoose';
import {
  TBooking,
  TDeliveryInstructions,
  TOrderItem,
  TShippingAddress,
} from './booking.interface';
import {
  BOOKING_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} from './booking.constant';

const orderItemSchema = new Schema<TOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    unit: { type: String, required: true },
    variation: { type: String },
    price: { type: Number, required: true, min: 0 },
    isFlashSale: { type: Boolean, default: false },
    flashSaleId: { type: Schema.Types.ObjectId, ref: 'FlashSale' },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const shippingAddressSchema = new Schema<TShippingAddress>(
  {
    district: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const deliveryInstructionsSchema = new Schema<TDeliveryInstructions>(
  {
    note: { type: String, trim: true },
    leaveAtDoor: { type: Boolean, default: false },
  },
  { _id: false },
);

const bookingSchema = new Schema<TBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items: TOrderItem[]) => items.length > 0,
        message: 'Booking must have at least one item',
      },
    },
    shippingAddress: { type: shippingAddressSchema, required: true },
    deliveryInstructions: { type: deliveryInstructionsSchema },
    subTotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHOD,
      default: 'cash-on-delivery',
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUS,
      default: 'unpaid',
    },
    transactionId: { type: String },
    status: {
      type: String,
      enum: BOOKING_STATUS,
      default: 'pending',
    },
  },
  { timestamps: true },
);

export const Booking = model<TBooking>('Booking', bookingSchema);
