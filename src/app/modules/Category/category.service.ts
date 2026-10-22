import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import { TCategory } from './category.interface';
import { Category } from './category.model';

const createCategoryIntoDb = async (payload: TCategory) => {
  const result = await Category.create(payload);
  return result;
};

const getAllCategoriesFromDb = async (query: Record<string, unknown>) => {
  const categoryQuery = new QueryBuilder(Category.find(), {
    ...query,
    isDeleted: false,
  })
    .search(['name', 'slug', 'children.name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await categoryQuery.modelQuery;
  const meta = await categoryQuery.countTotal();

  return {
    meta,
    result,
  };
};

const getSingleCategoryFromDb = async (slug: string) => {
  const result = await Category.findOne({ slug, isDeleted: false });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'This category is not found');
  }

  return result;
};

const updateCategoryIntoDb = async (
  id: string,
  payload: Partial<TCategory>,
) => {
  const { image, ...remainingData } = payload;
  const modifiedData: Record<string, unknown> = { ...remainingData };

  // update only the given image fields, keep the others unchanged
  if (image && Object.keys(image).length) {
    for (const [key, value] of Object.entries(image)) {
      modifiedData[`image.${key}`] = value;
    }
  }

  const result = await Category.findOneAndUpdate(
    { _id: id, isDeleted: false },
    modifiedData,
    { new: true, runValidators: true },
  );

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'This category is not found');
  }

  return result;
};

const deleteCategoryFromDb = async (id: string) => {
  const result = await Category.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true },
  );

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'This category is not found');
  }

  return result;
};

export const CategoryService = {
  createCategoryIntoDb,
  getAllCategoriesFromDb,
  getSingleCategoryFromDb,
  updateCategoryIntoDb,
  deleteCategoryFromDb,
};
