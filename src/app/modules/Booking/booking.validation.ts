import { z } from 'zod';
import { BOOKING_STATUS, PAYMENT_METHOD } from './booking.constant';

const orderItemValidationSchema = z.object({
  product: z
    .string({ required_error: 'product id is required' })
    .regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid product id' }),
  quantity: z
    .number({
      required_error: 'quantity is required',
      invalid_type_error: 'quantity must be a number',
    })
    .int()
    .min(1, { message: 'quantity must be at least 1' }),
  variation: z.string().optional(),
});

const createBookingValidationSchema = z.object({
  body: z.object({
    items: z
      .array(orderItemValidationSchema, {
        required_error: 'items are required',
      })
      .min(1, { message: 'Booking must have at least one item' }),
    shippingAddress: z.object(
      {
        district: z
          .string({ required_error: 'district is required' })
          .min(1, { message: 'district is required' }),
        address: z
          .string({ required_error: 'address is required' })
          .min(1, { message: 'address is required' }),
        phone: z
          .string({ required_error: 'phone is required' })
          .min(1, { message: 'phone is required' }),
      },
      { required_error: 'shippingAddress is required' },
    ),
    deliveryInstructions: z
      .object({
        note: z.string().optional(),
        leaveAtDoor: z.boolean().optional(),
      })
      .optional(),
    paymentMethod: z.enum(PAYMENT_METHOD).optional(),
  }),
});

const updateBookingStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(BOOKING_STATUS, {
      required_error: 'status is required',
    }),
  }),
});

export const bookingValidationSchemas = {
  createBookingValidationSchema,
  updateBookingStatusValidationSchema,
};
