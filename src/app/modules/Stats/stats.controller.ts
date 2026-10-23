import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StatsService } from './stats.service';

const getAdminStats = catchAsync(async (req: Request, res: Response) => {
  const result = await StatsService.getAdminStatsFromDb();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard stats retrieved successfully',
    data: result,
  });
});

export const StatsController = {
  getAdminStats,
};
