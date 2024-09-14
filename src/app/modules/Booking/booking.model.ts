import { model } from 'mongoose';
import { Schema } from 'mongoose';
import { TBooking } from './booking.interface';
const bookingSchema = new Schema<TBooking>(
  {
    name: {
      type: String,
      required: true,
    },
    products: {
      type:[ Schema.Types.ObjectId],
      ref: 'Product',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'delivered'],
      default: 'pending',
    },
  },
  { timestamps: true },
);

export const Booking = model('Booking', bookingSchema);
