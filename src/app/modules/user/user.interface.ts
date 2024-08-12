import { Model } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  phone: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

export type TLoginUser={
  email:string;
  password:string;
}


export interface UserModel extends Model<IUser>{
 isUserExistsByEmail(email:string):Promise<IUser>
 isPasswordMatch(planTextPassword:string,hashedPassword:string):Promise<boolean>


}