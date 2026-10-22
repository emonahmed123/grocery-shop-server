import { z } from 'zod';

const subCategoryValidationSchema = z.object({
  name: z.string({ required_error: 'sub category name is required' }),
  slug: z.string({ required_error: 'sub category slug is required' }),
});

const imageValidationSchema = z.object(
  {
    thumbnail: z.string({ required_error: 'thumbnail is required' }),
    original: z.string({ required_error: 'original image is required' }),
  },
  { required_error: 'image is required' },
);

const categoryBody = z.object({
  name: z.string({
    required_error: 'Name is required',
    invalid_type_error: 'Name must be a string',
  }),
  slug: z.string({
    required_error: 'slug is required',
    invalid_type_error: 'slug must be a string',
  }),
  image: imageValidationSchema,
  icon: z.string().optional(),
  children: z.array(subCategoryValidationSchema).optional(),
  isDeleted: z.boolean().optional(),
});

const createCategoryValidationSchema = z.object({
  body: categoryBody,
});

const updateCategoryValidationSchema = z.object({
  body: categoryBody
    .extend({ image: imageValidationSchema.partial() })
    .partial(),
});

export const categoryValidations = {
  createCategoryValidationSchema,
  updateCategoryValidationSchema,
};
