import { model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { IUser, UserModel } from './user.interface';
import config from '../../config';

const userSchema = new Schema<IUser, UserModel>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: 0 },
    role: {
      type: String,
      enum: ['admin', 'user'],
      required: true,
      default: 'user',
    },
    image: { type: String },
    phone: { type: String },
    address: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);
userSchema.pre('save', async function () {
  //
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds),
  );
});

//post save middleware /

userSchema.post('save', function (doc, next) {
  doc.password = '';

  next();
});

userSchema.statics.isUserExistsByEmail = async function (email: string) {
  return await User.findOne({ email }).select('+password');
};

userSchema.statics.isPasswordMatch = async function (
  planTextPassword,
  hashedPassword,
) {
  return await bcrypt.compare(planTextPassword, hashedPassword);
};

export const User = model<IUser, UserModel>('User', userSchema);
