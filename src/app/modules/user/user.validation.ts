import { z } from 'zod';

const signupValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Name is required',
      invalid_type_error: 'Name must be a string',
    }),
    email: z.string().email({ message: '{VALUE} is not valid email type' }),
    password: z.string({
      required_error: 'Password is required',
      invalid_type_error: 'Password must be a string',
    }),

    role: z
      .enum(['admin', 'user'], {
        required_error: 'Role is required',
      })
      .default('user'),
    isDeleted: z.boolean().optional(),
  }),
});

const updateUserValidationSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Name is required',
        invalid_type_error: 'Name must be a string',
      })
      .optional(),
    email: z
      .string({
        required_error: 'Email is required',
        invalid_type_error: 'Email must be a string',
      })
      .email({
        message: 'Invalid email',
      })
      .optional(),
    password: z
      .string({
        required_error: 'Password is required',
        invalid_type_error: 'Password must be a string',
      })
      .optional(),

    role: z
      .enum(['admin', 'user'], {
        required_error: 'Role is required',
      })
      .optional(),
    isDeleted: z.boolean().optional(),
  }),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'email is Required' }),
    password: z.string({ required_error: 'password is required' }),
  }),
});

const changePasswordValidationSchema = z.object({
  body: z
    .object({
      oldPassword: z.string({ required_error: 'Old password is required' }),
      newPassword: z
        .string({ required_error: 'New password is required' })
        .min(6, { message: 'New password must be at least 6 characters' }),
    })
    .refine((data) => data.oldPassword !== data.newPassword, {
      message: 'New password must be different from the old one',
      path: ['newPassword'],
    }),
});

const forgetPasswordValidationSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email({ message: 'Invalid email' }),
  }),
});

const resetPasswordValidationSchema = z.object({
  body: z.object({
    token: z.string({ required_error: 'Reset token is required' }),
    newPassword: z
      .string({ required_error: 'New password is required' })
      .min(6, { message: 'New password must be at least 6 characters' }),
  }),
});

export const userValidationSchemas = {
  signupValidationSchema,
  loginValidationSchema,
  changePasswordValidationSchema,
  forgetPasswordValidationSchema,
  resetPasswordValidationSchema,

  updateUserValidationSchema,
};
