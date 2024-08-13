import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { BookingService } from "./booking.service";
import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";

const CreateBooking=catchAsync(async (req: Request, res: Response) => {
  const user =req.user 

 
  const result = await BookingService.createBookingIntoDb(req.body,user );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking created successfully ',
    data: result,
  });
});

const getAllBooking=catchAsync(async(req:Request,res:Response)=>{
     const result =await BookingService.getAllBookingIntoDb()
 
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bookings retrieved successfully',
    data: result,
  });
})
const getmyBooking=catchAsync(async(req:Request,res:Response)=>{
    const user= req.user 
  
  const result =await BookingService.getMyBookingIntoD(user)
 
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bookings retrieved successfully',
    data: result,
  });
})

export const bookingController={
  CreateBooking,
  getAllBooking,
  getmyBooking
}