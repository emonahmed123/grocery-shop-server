/* eslint-disable @typescript-eslint/no-explicit-any */
import { TProduct } from './products.interface';
import { Product } from './products.model';

const creatProductIntoDb = async (payload: TProduct) => {
  const result = await Product.create(payload);

  return result;
};
const getProductIntoDb = async (fillter: any) => {
  let result;
  if (fillter.category) {
    result = await Product.find({
      $and: [{ category: fillter.category }, { isDeleted: false }],
    });
  } else {
    result = await Product.find({ isDeleted: false }).select('-isDeleted');
  }

  return result;
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

export const ProductService = {
  creatProductIntoDb,
  updateProductIntoDb,
  deleteProductIntoDb,
  getProductIntoDb,
  getSingleProductIntoDb,
  SelRevenuIntoDb,
};
