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

const refreshToken = catchAsync(async (req, res) => {
  const token =
    req.body?.refreshToken || req?.headers?.authorization?.split(' ')[1];
  const result = await userService.refreshToken(token);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Access token is retrieved succesfully!',
    data: result,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const result = await userService.changePassword(req.user, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password changed successfully!',
    data: result,
  });
});

const forgetPassword = catchAsync(async (req, res) => {
  await userService.forgetPassword(req.body.email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message:
      'If an account exists with this email, a reset link has been sent.',
    data: null,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  await userService.resetPassword(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password reset successfully, please login',
    data: null,
  });
});

const googleUser = catchAsync(async (req, res) => {
  const result = await userService.googleUser(req.body);

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
  refreshToken,
  changePassword,
  forgetPassword,
  resetPassword,
  getProfile,
  allUser,
  googleUser,
  addImage,
};
