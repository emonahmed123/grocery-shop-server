import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { FlashSaleServices } from './flashSale.service';

const getFlashSaleHistory = catchAsync(async (req: Request, res: Response) => {
  const result = await FlashSaleServices.getFlashSaleHistoryFromDb(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Flash sale history retrieved successfully',
    meta: result.meta,
    data: result.result,
  });
});

const getProductFlashSaleSummary = catchAsync(
  async (req: Request, res: Response) => {
    const result = await FlashSaleServices.getProductFlashSaleSummaryFromDb(
      req.params.id,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Flash sale summary retrieved successfully',
      data: result,
    });
  },
);

export const FlashSaleControllers = {
  getFlashSaleHistory,
  getProductFlashSaleSummary,
};
