import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import {
  closeFlashSale,
  createFlashSaleRecord,
} from '../FlashSale/flashSale.service';
import { TProduct } from './products.interface';
import { Product } from './products.model';

const creatProductIntoDb = async (payload: TProduct) => {
  const result = await Product.create(payload);

  return result;
};
const getProductIntoDb = async (query: Record<string, unknown>) => {
  const productQuery = new QueryBuilder(Product.find(), {
    ...query,
    isDeleted: false,
  })
    .search(['name', 'description', 'category', 'tags'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await productQuery.modelQuery;
  const meta = await productQuery.countTotal();

  return {
    meta,
    result,
  };
};
const getSingleProductIntoDb = async (id: string) => {
  // console.log(id);
  const result = await Product.findById(id);

  return result;
};
const SelRevenuIntoDb = async () => {
  const Products = await Product.find({ isDeleted: false });

  const revenePerproduct = Products.map((product) => product.price - 100);
  console.log(revenePerproduct);
};

const updateProductIntoDb = async (id: string, payload: TProduct) => {
  const result = await Product.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};
const deleteProductIntoDb = async (id: string) => {
  const result = await Product.findByIdAndUpdate(
    id,
    { isDeleted: true },
    {
      new: true,
      runValidators: true,
    },
  );

  return result;
};

type TFlashSalePayload = {
  products: string[];
  discountPercentage: number;
  startAt: string;
  endAt: string;
  quantityLimit?: number;
};

const setFlashSaleIntoDb = async (payload: TFlashSalePayload) => {
  const { discountPercentage, startAt, endAt, quantityLimit } = payload;
  const productIds = [...new Set(payload.products)];

  const existingProducts = await Product.find({
    _id: { $in: productIds },
    isDeleted: false,
  });

  if (existingProducts.length !== productIds.length) {
    const existingIds = existingProducts.map((product) => product.id);
    const missingIds = productIds.filter((id) => !existingIds.includes(id));
    throw new AppError(
      httpStatus.NOT_FOUND,
      `Products not found: ${missingIds.join(', ')}`,
    );
  }

  const settings = {
    discountPercentage,
    startAt: new Date(startAt),
    endAt: new Date(endAt),
    quantityLimit,
  };
  const now = new Date();

  // a new flash sale replaces the old one and starts counting from zero;
  // the old one stays in the history, and each product gets its own record
  for (const product of existingProducts) {
    await closeFlashSale(product, 'replaced', now);
    const saleId = await createFlashSaleRecord(product, settings);

    await Product.updateOne(
      { _id: product._id },
      { flashSale: { ...settings, soldCount: 0, saleId } },
      { runValidators: true },
    );
  }

  const result = await Product.find({ _id: { $in: productIds } });
  return result;
};

const removeFlashSaleFromDb = async (id: string) => {
  const product = await Product.findOne({ _id: id, isDeleted: false });
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'This product is not found');
  }

  // the sale leaves the product but stays in the history
  await closeFlashSale(product, 'removed');

  const result = await Product.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $unset: { flashSale: 1 } },
    { new: true },
  );

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'This product is not found');
  }

  return result;
};

const getFlashSaleProductsFromDb = async (query: Record<string, unknown>) => {
  const now = new Date();

  const productQuery = new QueryBuilder(
    Product.find({
      'flashSale.startAt': { $lte: now },
      'flashSale.endAt': { $gt: now },
      // inside $and so it does not clash with the $or that search() adds
      $and: [
        {
          $or: [
            { 'flashSale.quantityLimit': null },
            {
              $expr: {
                $lt: ['$flashSale.soldCount', '$flashSale.quantityLimit'],
              },
            },
          ],
        },
      ],
    }),
    // sales that end soonest come first unless another sort is asked for
    { sort: 'flashSale.endAt', ...query, isDeleted: false },
  )
    .search(['name', 'description', 'category', 'tags'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await productQuery.modelQuery;
  const meta = await productQuery.countTotal();

  return {
    meta,
    result,
  };
};

export const ProductService = {
  setFlashSaleIntoDb,
  removeFlashSaleFromDb,
  getFlashSaleProductsFromDb,
  creatProductIntoDb,
  updateProductIntoDb,
  deleteProductIntoDb,
  getProductIntoDb,
  getSingleProductIntoDb,
  SelRevenuIntoDb,
};
