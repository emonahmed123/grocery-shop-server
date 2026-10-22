import { z } from 'zod';

const dateString = (field: string) =>
  z
    .string({ required_error: `${field} is required` })
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: `${field} must be a valid date`,
    });

const variationValidationSchema = z.object({
  name: z.string({ required_error: 'variation name is required' }),
  values: z.array(z.string()),
});

const productBody = z.object({
  name: z
    .string({
      required_error: 'Name is required',
      invalid_type_error: 'Name must be a string',
    })
    .min(3, { message: 'name must be at least 3 characters' }),
  slug: z.string({
    required_error: 'slug is required',
    invalid_type_error: 'slug must be a string',
  }),
  image: z.string({
    required_error: 'image is required',
    invalid_type_error: 'image must be a string',
  }),
  unit: z.string({
    required_error: 'unit is required',
    invalid_type_error: 'unit must be a string',
  }),
  price: z
    .number({
      required_error: 'Price is required',
      invalid_type_error: 'Price must be a number',
    })
    .min(0),
  salePrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  description: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  variations: variationValidationSchema.optional(),
  category: z.string().optional(),
  isAvailable: z.boolean().optional(),
  inStock: z.number().min(0).optional(),
  isDeleted: z.boolean().optional(),
});

const productValidationSchema = z.object({
  body: productBody,
});

const UpdateproductValidationSchema = z.object({
  body: productBody.partial(),
});

const flashSaleValidationSchema = z.object({
  body: z
    .object({
      products: z
        .array(
          z
            .string()
            .regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid product id' }),
          { required_error: 'products are required' },
        )
        .min(1, { message: 'Select at least one product' }),
      discountPercentage: z
        .number({
          required_error: 'discountPercentage is required',
          invalid_type_error: 'discountPercentage must be a number',
        })
        .min(1)
        .max(99),
      startAt: dateString('startAt'),
      endAt: dateString('endAt'),
      quantityLimit: z.number().int().min(1).optional(),
    })
    .refine((data) => new Date(data.endAt) > new Date(data.startAt), {
      message: 'endAt must be after startAt',
      path: ['endAt'],
    })
    .refine((data) => new Date(data.endAt) > new Date(), {
      message: 'endAt must be in the future',
      path: ['endAt'],
    }),
});

export const productValidations = {
  productValidationSchema,
  UpdateproductValidationSchema,
  flashSaleValidationSchema,
};
