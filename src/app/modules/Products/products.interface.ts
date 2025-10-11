export type TProduct = {
  name: string;
  description: string;
  image: string;
  category: string;
  price: number;
  isAvailable: boolean;
  offer: string[];
  isDeleted: boolean;
  inStock: number;
  averageRating: number;
  ratingCount: number;
};

export type TOffer = {
  offerType: 'discount' | 'freeshipping';
  value: number;
  validUntil: Date | string;
  isActive: boolean;
};
