import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { ProductService } from './products.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';

const creatProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.creatProductIntoDb(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product added successfully',
    data: result,
  });
});
const getAllProduct = catchAsync(async (req: Request, res: Response) => {
  console.log(req.query);

  const result = await ProductService.getProductIntoDb(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product retrieved successfully',
    data: result,
  });
});

const SelRevenu = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.SelRevenuIntoDb();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product retrieved successfully',
    data: result,
  });
});

const getSingle = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // console.log(id);
  const result = await ProductService.getSingleProductIntoDb(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product retrieved successfully',
    data: result,
  });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await ProductService.updateProductIntoDb(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product updated successfully',
    data: result,
  });
});
const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  console.log(req.params);
  const { id } = req.params;

  const result = await ProductService.deleteProductIntoDb(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product Delete successfully',
    data: result,
  });
});

export const ProductController = {
  creatProduct,
  updateProduct,
  deleteProduct,
  getAllProduct,
  getSingle,
  SelRevenu,
};
