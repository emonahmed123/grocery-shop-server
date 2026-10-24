import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { Request, Response } from 'express';
import { userService } from './user.service';
import { tokenUtils } from '../../utils/token';
import { CookieUtils } from '../../utils/cookie';

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
  // the tokens go in httpOnly cookies and, as before, in the body
  tokenUtils.setAuthCookies(res, result);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is logged in succesfully!',
    data: result,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  // the cookie first, then the body or header older clients send it in
  const token =
    CookieUtils.getCookie(req, 'refreshToken') ||
    req.body?.refreshToken ||
    req?.headers?.authorization?.split(' ')[1];
  const result = await userService.refreshToken(token);
  tokenUtils.setAuthCookies(res, result);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Access token is retrieved succesfully!',
    data: result,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const result = await userService.changePassword(req.user, req.body);
  // tokens from before the change stop working, so the new pair replaces them
  tokenUtils.setAuthCookies(res, result);

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
  tokenUtils.setAuthCookies(res, result);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is logged in succesfully!',
    data: result,
  });
});

// the tokens are stateless, so logging out means removing the cookies
const logoutUser = catchAsync(async (req, res) => {
  tokenUtils.clearAuthCookies(res);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is logged out successfully!',
    data: null,
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
  logoutUser,
};
