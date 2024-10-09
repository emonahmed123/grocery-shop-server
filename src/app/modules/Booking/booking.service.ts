/* eslint-disable @typescript-eslint/no-explicit-any */

import { JwtPayload } from 'jsonwebtoken';

import { Booking } from './booking.model';

import { TBooking } from './booking.interface';
import { Types } from 'mongoose';

const createBookingIntoDb = async (payload: TBooking) => {
  const reslut = await Booking.create(payload);

  return reslut;
};

const getAllBookingIntoDb = async () => {
  const reslut = await Booking.find().populate({
    path: 'userId',
    select: 'name',
  });
  return reslut;
};
const TotalSaleIntoDb = async () => {
  const Pending = await Booking.find({ status: 'pending' }).countDocuments();

  console.log(Pending);

  const result = await Booking.aggregate([
    { $match: { status: 'delivered' } },
    { $group: { _id: null, totalAmount: { $sum: '$totalAmount' } } },
  ]);
  return { Pending, totalAmount: result[0].totalAmount };
};
const getMyBookingIntoDb = async (user: JwtPayload) => {
  const result = await Booking.find({ userId: user }).populate({
    path: 'products',
    select: 'name image',
  });

  return result;
};

const getBookingByUserIntoDb = async (user: JwtPayload) => {
  const myTotalBooking = await Booking.find(
    { userId: user },

    { status: 'delivered' },
  ).countDocuments();
  const pending = await Booking.find({
    userId: user,
    status: 'pending',
  }).countDocuments();

  const result = await Booking.aggregate([
    { $match: { userId: new Types.ObjectId(user), status: 'delivered' } },
    { $group: { _id: null, totalAmount: { $sum: '$totalAmount' } } },
  ]);
  console.log(result, myTotalBooking);

  return { myTotalBooking, totalAmount: result[0]?.totalAmount || 0, pending };
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
  TotalSaleIntoDb,
  getBookingByUserIntoDb,
};
