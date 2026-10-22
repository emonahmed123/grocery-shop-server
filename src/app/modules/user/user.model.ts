import { model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { IUser, UserModel } from './user.interface';
import config from '../../config';

const userSchema = new Schema<IUser, UserModel>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: 0 },
    passwordChangedAt: { type: Date },
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
  // only hash a new or changed password, never an already hashed one
  if (!user.isModified('password')) return;
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

// a token signed before the last password change must not work any more
userSchema.statics.isJWTIssuedBeforePasswordChanged = function (
  passwordChangedAt: Date | undefined,
  jwtIssuedAt: number | undefined,
) {
  if (!passwordChangedAt || !jwtIssuedAt) return false;
  // `iat` is in whole seconds, so compare in whole seconds too
  return Math.floor(passwordChangedAt.getTime() / 1000) > jwtIssuedAt;
};

export const User = model<IUser, UserModel>('User', userSchema);
