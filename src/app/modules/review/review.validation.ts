import { z } from 'zod';

const createReviewValidationSchema = z.object({
  body: z.object({
    productId: z
      .string({ required_error: 'productId is required' })
      .regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid product id' }),
    rating: z
      .number({
        required_error: 'rating is required',
        invalid_type_error: 'rating must be a number',
      })
      .int()
      .min(1, { message: 'rating must be from 1 to 5' })
      .max(5, { message: 'rating must be from 1 to 5' }),
    review: z
      .string({ required_error: 'review is required' })
      .trim()
      .min(3, { message: 'Please write a few words' })
      .max(1000, { message: 'review is too long' }),
  }),
});

export const reviewValidationSchemas = {
  createReviewValidationSchema,
};
