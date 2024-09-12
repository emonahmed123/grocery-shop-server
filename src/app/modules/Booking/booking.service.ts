/* eslint-disable @typescript-eslint/no-explicit-any */

import { JwtPayload } from 'jsonwebtoken';

import { Booking } from './booking.model';
import mongoose from 'mongoose';

const createBookingIntoDb = async () => {};

const getAllBookingIntoDb = async () => {
  const reslut = await Booking.find({ isBooked: 'confirmed' });

  return reslut;
};

const getMyBookingIntoDb = async (user: JwtPayload) => {
  const result = await Booking.find({ user: user, isBooked: 'confirmed' });

  return result;
};

const deleteBookingIntoDb = async (id: string) => {
  const session = await mongoose.startSession();
  try {
    // start transaction
    session.startTransaction();

    const result = await Booking.findByIdAndUpdate(
      id,
      { isBooked: 'canceled' },
      { session },
    ).populate('facility');

    await session.commitTransaction();
    await session.endSession();

    return result;
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(error);
  }
};

export const BookingService = {
  createBookingIntoDb,
  getAllBookingIntoDb,
  getMyBookingIntoDb,
  deleteBookingIntoDb,
};
