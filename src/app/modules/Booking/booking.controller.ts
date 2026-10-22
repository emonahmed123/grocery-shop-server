import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { BookingService } from './booking.service';
import { Request, Response } from 'express';

const CreateBooking = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingService.createBookingIntoDb(
    req.body,
    req.user.userId,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Booking created successfully',
    data: result,
  });
});

const getAllBooking = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingService.getAllBookingIntoDb(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bookings retrieved successfully',
    meta: result.meta,
    data: result.result,
  });
});

const getSingleBooking = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BookingService.getSingleBookingFromDb(id, req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking retrieved successfully',
    data: result,
  });
});

const TotalSale = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingService.TotalSaleIntoDb();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Total Sale retrieved successfully',
    data: result,
  });
});

const cancelBooking = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BookingService.cancelBookingIntoDb(id, req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking cancelled successfully',
    data: result,
  });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BookingService.updateBookingStatusIntoDb(
    id,
    req.body.status,
    req.user,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking status updated successfully',
    data: result,
  });
});

// kept for the old admin button that only marks a booking as delivered
const deliverBooking = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BookingService.updateBookingStatusIntoDb(
    id,
    'delivered',
    req.user,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking delivered successfully',
    data: result,
  });
});

const getBookingByUser = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingService.getBookingByUserIntoDb(req.user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bookings retrieved successfully',
    data: result,
  });
});

const getmyBooking = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingService.getMyBookingIntoDb(req.user.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bookings retrieved successfully',
    data: result,
  });
});

export const bookingController = {
  CreateBooking,
  getAllBooking,
  getSingleBooking,
  getmyBooking,
  cancelBooking,
  updateBookingStatus,
  deliverBooking,
  TotalSale,
  getBookingByUser,
};
