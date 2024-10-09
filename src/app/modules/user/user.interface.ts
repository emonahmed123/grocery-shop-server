import { Model, ObjectId } from 'mongoose';
import { USER_ROLE } from './user.canstance';

export interface IUser {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  image?: string;
  phone?: string;
  address?: string;
}

export type TLoginUser = {
  email: string;
  password: string;
};

export interface UserModel extends Model<IUser> {
  isUserExistsByEmail(email: string): Promise<IUser>;
  isPasswordMatch(
    planTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
}

export type TUserRole = keyof typeof USER_ROLE;
