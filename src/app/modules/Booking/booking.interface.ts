import { Types } from 'mongoose';
import {
  BOOKING_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} from './booking.constant';

export type TBookingStatus = (typeof BOOKING_STATUS)[number];
export type TPaymentMethod = (typeof PAYMENT_METHOD)[number];
export type TPaymentStatus = (typeof PAYMENT_STATUS)[number];

// a copy of the product at the time of the order, so later price or name
// changes do not change old orders
export type TOrderItem = {
  product: Types.ObjectId;
  name: string;
  image: string;
  unit: string;
  variation?: string;
  price: number;
  /** True when `price` is a flash sale price. */
  isFlashSale: boolean;
  quantity: number;
};

export type TShippingAddress = {
  district: string;
  address: string;
  phone: string;
};

export type TDeliveryInstructions = {
  note?: string;
  leaveAtDoor: boolean;
};

export type TBooking = {
  userId: Types.ObjectId;
  items: TOrderItem[];
  shippingAddress: TShippingAddress;
  deliveryInstructions?: TDeliveryInstructions;
  subTotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  paymentMethod: TPaymentMethod;
  paymentStatus: TPaymentStatus;
  transactionId?: string;
  status: TBookingStatus;
};

// what the client sends; prices and totals are worked out on the server
export type TCreateBookingPayload = {
  items: {
    product: string;
    quantity: number;
    variation?: string;
  }[];
  shippingAddress: TShippingAddress;
  deliveryInstructions?: TDeliveryInstructions;
  paymentMethod?: TPaymentMethod;
};
