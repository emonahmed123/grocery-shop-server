import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { Request, Response } from 'express';
import { userService } from './user.service';

const Createsignup = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createSingupIntoDb(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User registered successfully',
    data: result,
  });
});

const loginUser = catchAsync(async (req, res) => {
  const result = await userService.loginUser(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is logged in succesfully!',
    data: result,
  });
});

const googleUser = catchAsync(async (req, res) => {
  const result = await userService.loginUser(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is logged in succesfully!',
    data: result,
  });
});

const addImage = catchAsync(async (req, res) => {
  const userId = req.user?.userId;
  const result = await userService.PostImageIntoDb(req.body, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: ' Image add  succesfully!',
    data: result,
  });
});

const getProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await userService.getProfileFromDB(userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User profile retrieved successfully',
    data: result,
  });
});

const allUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.allUserFromDb();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User profile retrieved successfully',
    data: result,
  });
});

export const userController = {
  Createsignup,
  loginUser,
  getProfile,
  allUser,
  googleUser,
  addImage,
};
