/* eslint-disable @typescript-eslint/no-explicit-any */

import { JwtPayload } from 'jsonwebtoken';

import { Booking } from './booking.model';

import { TBooking } from './booking.interface';

const createBookingIntoDb = async (payload: TBooking) => {
  const reslut = await Booking.create(payload);

  return reslut;
};

const getAllBookingIntoDb = async () => {
  const reslut = await Booking.find().populate({
    path: 'userId',
    select: 'name ',
  });
  return reslut;
};

const getMyBookingIntoDb = async (user: JwtPayload) => {
  const result = await Booking.find({ userId: user }).populate({
    path: 'products',
    select: 'name image',
  });

  return result;
};

const deleteBookingIntoDb = async (id: string) => {
  try {
    const result = await Booking.findByIdAndUpdate(id, { status: 'delivered' });

    return result;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const BookingService = {
  createBookingIntoDb,
  getAllBookingIntoDb,
  getMyBookingIntoDb,
  deleteBookingIntoDb,
};
