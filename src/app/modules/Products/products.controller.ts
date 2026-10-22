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
    meta: result.meta,
    data: result.result,
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

const setFlashSale = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.setFlashSaleIntoDb(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Flash sale set successfully',
    data: result,
  });
});

const removeFlashSale = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductService.removeFlashSaleFromDb(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Flash sale removed successfully',
    data: result,
  });
});

const getFlashSaleProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getFlashSaleProductsFromDb(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Flash sale products retrieved successfully',
    meta: result.meta,
    data: result.result,
  });
});

export const ProductController = {
  setFlashSale,
  removeFlashSale,
  getFlashSaleProducts,
  creatProduct,
  updateProduct,
  deleteProduct,
  getAllProduct,
  getSingle,
  SelRevenu,
};
