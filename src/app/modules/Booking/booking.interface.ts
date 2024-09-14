import { Types } from 'mongoose';

export type TBooking = {
  name: string;
  userId: Types.ObjectId;
  products: Types.ObjectId[];
  quantity: number;
  totalAmount:number;
  status?: 'pending' | 'delivered';
};
