import { z } from 'zod';

const createBookingValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'name  is required',
      invalid_type_error: 'name must be String type!',
    }),
  }),
});

export const bookingValidationSchemas = {
  createBookingValidationSchema,
};
