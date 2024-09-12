import { TProduct } from './products.interface';
import { Product } from './products.model';

const creatProductIntoDb = async (payload: TProduct) => {
  const result = await Product.create(payload);

  return result;
};
const getProductIntoDb = async () => {
  const result = await Product.find({ isDeleted: false });

  return result;
};
const getSingleProductIntoDb = async (id: string) => {
  // console.log(id);
  const result = await Product.findById(id);

  return result;
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
};
