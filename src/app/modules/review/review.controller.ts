import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';

import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { ReviewServices } from './review.service';

const getReviews = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ReviewServices.getReviewsFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reviews retrieved successfully.',
    data: result,
  });
});
const createReview = catchAsync(async (req: Request, res: Response) => {
  const review = req.body;
  const result = await ReviewServices.createReviewIntoDB(review);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reviews retrieved successfully.',
    data: result,
  });
});

export const ReviewControllers = {
  getReviews,
  createReview,
};
