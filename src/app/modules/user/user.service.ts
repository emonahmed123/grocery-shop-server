import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { IUser, TLoginUser } from './user.interface';
import { User } from './user.model';
import jwt from 'jsonwebtoken';
import config from '../../config';

const createSingupIntoDb = async (payload: IUser) => {
  const result = await User.create(payload);

  return result;
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

  return {
    accessToken,
    data: user,
  };
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
};
