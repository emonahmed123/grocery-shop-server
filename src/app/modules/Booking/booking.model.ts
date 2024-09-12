import { model } from 'mongoose';
import { Schema } from 'mongoose';

const bookingSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    isBooked: {
      type: String,
      enum: ['confirmed', 'unconfirmed', 'canceled'],
      default: 'unconfirmed',
    },
  },
  { timestamps: true },
);

export const Booking = model('Booking', bookingSchema);
