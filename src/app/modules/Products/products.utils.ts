import { TProduct } from './products.interface';

type TPricedProduct = Pick<TProduct, 'price' | 'salePrice' | 'flashSale'>;

export const roundPrice = (value: number) => Math.round(value * 100) / 100;

/**
 * A flash sale counts only inside its time window and while it still has
 * units left. Pass `quantity` to check that a whole order line fits the limit.
 */
export const isFlashSaleActive = (
  product: TPricedProduct,
  quantity = 1,
  now = new Date(),
) => {
  const flashSale = product.flashSale;

  if (!flashSale?.startAt || !flashSale?.endAt) {
    return false;
  }
  if (now < flashSale.startAt || now >= flashSale.endAt) {
    return false;
  }
  if (
    flashSale.quantityLimit &&
    flashSale.soldCount + quantity > flashSale.quantityLimit
  ) {
    return false;
  }

  return true;
};

/**
 * The price a customer pays right now: the flash price while a flash sale
 * runs, otherwise the sale price, otherwise the regular price.
 */
export const getCurrentPrice = (
  product: TPricedProduct,
  quantity = 1,
  now = new Date(),
) => {
  const basePrice = product.salePrice ?? product.price;

  if (!isFlashSaleActive(product, quantity, now)) {
    return { price: basePrice, isFlashSale: false };
  }

  const flashPrice = roundPrice(
    product.price * (1 - product.flashSale!.discountPercentage / 100),
  );

  // never charge more than the normal sale price
  return flashPrice < basePrice
    ? { price: flashPrice, isFlashSale: true }
    : { price: basePrice, isFlashSale: false };
};
