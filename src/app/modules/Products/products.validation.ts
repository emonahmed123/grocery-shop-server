import { z } from 'zod';

const productValidationSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Name is required',
        invalid_type_error: 'Name must be a string',
      })
      .min(3, { message: 'name can  be more than 3 charactes' }),

    description: z
      .string({
        required_error: 'description is required',
        invalid_type_error: 'description must be a string',
      })
      .min(6, { message: 'description can  be more than 6 charactes' }),
    price: z.number({
      required_error: 'Price is required',
      invalid_type_error: 'Price must be a number',
    }),

    category: z.string({
      required_error: 'category is Required ',
      invalid_type_error: 'Category must be a string',
    }),
    image: z.string({
      required_error: 'image is required',
      invalid_type_error: 'image must be a string',
    }),
    isDeleted: z.boolean().optional(),
  }),
});
const UpdateproductValidationSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Name is required',
        invalid_type_error: 'Name must be a string',
      })
      .min(3, { message: 'name can  be more than 3 charactes' })
      .optional(),
    description: z
      .string({
        required_error: 'description is required',
        invalid_type_error: 'description must be a string',
      })
      .min(6, { message: 'description can  be more than 6 charactes' })
      .optional(),

    pricePerHour: z
      .number({
        required_error: ' pricePerHour is required',
        invalid_type_error: ' pricePerHour must be a number',
      })
      .optional(),
    location: z
      .string({
        required_error: ' location is required',
        invalid_type_error: 'location must be a string',
      })
      .optional(),
    image: z
      .string({
        required_error: 'image is required',
        invalid_type_error: 'image must be a string',
      })
      .optional(),
    isDeleted: z.boolean().optional(),
  }),
});

export const productValidations = {
  productValidationSchema,
  UpdateproductValidationSchema,
};
