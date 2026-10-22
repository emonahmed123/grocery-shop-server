/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { IUser, TLoginUser } from './user.interface';
import { User } from './user.model';
import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import config from '../../config';
import { jwtUtils } from '../../utils/jwt';
import sendEmail from '../../utils/sendEmail';
import { resetPasswordTemplate } from '../../utils/emailTemplates';

const createSingupIntoDb = async (payload: IUser) => {
  const result = await User.create(payload);

  return result;
};

const googleUser = async (payload: any) => {
  console.log(payload);

  const user = await User.findOne({ email: payload.email });

  if (!user) {
    const newUser = await User.create(payload);

    const jwtPayload = {
      name: newUser.name,
      userId: newUser._id,
      email: newUser?.email,
      role: newUser?.role,
    };
    const accessToken = jwt.sign(
      jwtPayload,
      config.jwt_access_secret as string,
      {
        expiresIn: '10d',
      },
    );
    const { isDeleted, password, ...restData } = newUser.toObject();

    return {
      accessToken,
      data: newUser,
    };
  } else {
    const jwtPayload = {
      name: user.name,
      userId: user._id,
      email: user?.email,
      role: user?.role,
    };
    const accessToken = jwt.sign(
      jwtPayload,
      config.jwt_access_secret as string,
      {
        expiresIn: '10d',
      },
    );
    const { isDeleted, password, ...restData } = user.toObject();

    return {
      accessToken,
      data: restData,
    };
  }
};

const loginUser = async (payload: TLoginUser) => {
  //  if(! await User.isUserExistsByCustomId(payload?.id)){
  //   throw new AppError(httpStatus.NOT_FOUND, 'This user not found')
  // }

  const user = await User.isUserExistsByEmail(payload.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is NotFound');
  }
  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is Deleted');
  }

  //cheaking if the user is  already deleted

  // const isPasswordMatch=

  // console.log(isPasswordMatch)

  //      console.log(isUserExists?.password)
  if (!(await User.isPasswordMatch(payload.password, user?.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'This password flase');
  }

  const jwtPayload = {
    name: user.name,
    userId: user._id,
    email: user?.email,
    role: user?.role,
  };
  const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret as string, {
    expiresIn: '10d',
  });

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    { expiresIn: (config.jwt_refresh_expires_in as string) || '30d' },
  );

  return {
    accessToken,
    refreshToken,
    data: user,
  };
};

const refreshToken = async (token: string) => {
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
  }

  // checking if the given refresh token is valid
  const verified = jwtUtils.verifyToken(
    token,
    config.jwt_refresh_secret as string,
  );

  if (!verified.success || !verified.data) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid refresh token!');
  }

  const user = await User.isUserExistsByEmail(verified.data.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }

  if (user?.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
  }

  if (
    User.isJWTIssuedBeforePasswordChanged(
      user.passwordChangedAt,
      verified.data.iat,
    )
  ) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'Password was changed, please login again',
    );
  }

  const jwtPayload = {
    name: user.name,
    userId: user._id,
    email: user?.email,
    role: user?.role,
  };
  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    { expiresIn: '10d' },
  );

  return {
    accessToken,
  };
};

const hashPassword = (password: string) =>
  bcrypt.hash(password, Number(config.bcrypt_salt_rounds));

const changePassword = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string },
) => {
  const user = await User.isUserExistsByEmail(userData.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }

  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
  }

  if (!(await User.isPasswordMatch(payload.oldPassword, user.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Old password is incorrect');
  }

  await User.findByIdAndUpdate(user._id, {
    password: await hashPassword(payload.newPassword),
    passwordChangedAt: new Date(),
  });

  // the old tokens stop working now, so hand out fresh ones
  const jwtPayload = {
    name: user.name,
    userId: user._id,
    email: user?.email,
    role: user?.role,
  };
  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    { expiresIn: '10d' },
  );
  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    { expiresIn: (config.jwt_refresh_expires_in as string) || '30d' },
  );

  return {
    accessToken,
    refreshToken,
  };
};

// signing with the current password hash makes a reset link single-use:
// once the password changes, every earlier link stops verifying
const getResetSecret = (hashedPassword: string) =>
  `${config.jwt_access_secret}${hashedPassword}`;

const forgetPassword = async (email: string) => {
  if (!config.reset_pass_ui_link) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Reset password link is not configured',
    );
  }

  const user = await User.isUserExistsByEmail(email);

  // same answer whether the email exists or not, so nobody can probe accounts
  if (!user || user.isDeleted) {
    return;
  }

  const resetToken = jwtUtils.createToken(
    { userId: user._id, email: user.email },
    getResetSecret(user.password),
    { expiresIn: '10m' },
  );
  const resetLink = `${config.reset_pass_ui_link}?token=${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: 'Reset your password',
    html: resetPasswordTemplate(user.name, resetLink),
  });
};

const resetPassword = async (payload: {
  token: string;
  newPassword: string;
}) => {
  const invalidLinkError = new AppError(
    httpStatus.UNAUTHORIZED,
    'This reset link is invalid or expired',
  );

  // read the email first to find whose password hash signed the token
  const decoded = jwtUtils.decodeToken(payload.token);
  if (!decoded?.email) {
    throw invalidLinkError;
  }

  const user = await User.isUserExistsByEmail(decoded.email);
  if (!user || user.isDeleted) {
    throw invalidLinkError;
  }

  const verified = jwtUtils.verifyToken(
    payload.token,
    getResetSecret(user.password),
  );
  if (!verified.success) {
    throw invalidLinkError;
  }

  await User.findByIdAndUpdate(user._id, {
    password: await hashPassword(payload.newPassword),
    passwordChangedAt: new Date(),
  });
};

const allUserFromDb = async () => {
  const result = await User.find({ isDeleted: false });
  return result;
};

const PostImageIntoDb = async (payload: any, id: string) => {
  console.log(payload, id);
  const reslut = await User.findByIdAndUpdate(
    id,
    { $set: payload },
    { new: true, runValidators: true },
  );
  return reslut;
};

const getProfileFromDB = async (id: string) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'No Data Found');
  }
  // removing the isDeleted flag and password  from response
  const { isDeleted, password, ...restData } = user.toObject();
  return restData;
};

export const userService = {
  getProfileFromDB,
  createSingupIntoDb,
  loginUser,
  refreshToken,
  changePassword,
  forgetPassword,
  resetPassword,
  allUserFromDb,
  googleUser,
  PostImageIntoDb,
};
