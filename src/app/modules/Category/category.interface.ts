export type TCategoryImage = {
  thumbnail: string;
  original: string;
};

export type TSubCategory = {
  name: string;
  slug: string;
};

export type TCategory = {
  name: string;
  slug: string;
  image: TCategoryImage;
  icon?: string;
  children?: TSubCategory[];
  isDeleted: boolean;
};
