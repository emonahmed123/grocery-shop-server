export type TFlashSale = {
  /** Percent taken off the regular `price`. */
  discountPercentage: number;
  startAt: Date;
  endAt: Date;
  /** How many units can be sold at the flash price; no limit when empty. */
  quantityLimit?: number;
  soldCount: number;
};

export type TVariation = {
  name: string;
  values: string[];
};

export type TProduct = {
  name: string;
  slug: string;
  image: string;
  unit: string;
  /** Regular price, or the lowest price when `maxPrice` is set. */
  price: number;
  /** Discounted price; marks the product as on sale. */
  salePrice?: number;
  /** Highest price for products sold in several variations. */
  maxPrice?: number;
  description?: string;
  gallery?: string[];
  tags?: string[];
  variations?: TVariation;
  category?: string;
  isAvailable: boolean;
  flashSale?: TFlashSale;
  isDeleted: boolean;
  inStock: number;
  averageRating: number;
  ratingCount: number;
};
