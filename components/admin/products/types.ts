export type AdminProductImage = {
  id: number;
  url: string;
  thumbUrl: string | null;
  altText: string | null;
  sortOrder: number;
};

export type AdminProductColor = {
  id: number;
  name: string;
  hex: string;
  sortOrder: number;
  active: boolean;
};

export type ProductColorFormValue = {
  id?: number;
  name: string;
  hex: string;
  active: boolean;
  sortOrder: number;
};

export type AdminProductListItem = {
  id: number;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string | null;
  description: string | null;
  priceInCents: number;
  compareAtPriceInCents: number | null;
  currency: string;
  active: boolean;
  featured: boolean;
  weightGrams: number | null;
  heightCm: number | null;
  widthCm: number | null;
  lengthCm: number | null;
  images: AdminProductImage[];
  colors: AdminProductColor[];
};

export type AdminCategoryOption = {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
};

export type AdminCollectionOption = {
  id: number;
  title: string;
  slug: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
};

export type AdminProductDetail = AdminProductListItem & {
  categories: Array<{
    categoryId: number;
    category: {
      id: number;
      name: string;
      slug: string;
    };
  }>;
  collections: Array<{
    collectionId: number;
    collection: {
      id: number;
      title: string;
      slug: string;
      coverImageUrl?: string | null;
      coverImageThumbUrl?: string | null;
    };
  }>;
};

export type ProductFormValues = {
  name: string;
  shortDescription: string;
  description: string;
  price: string;
  compareAtPrice: string;
  active: boolean;
  featured: boolean;
  weightGrams: string;
  heightCm: string;
  widthCm: string;
  lengthCm: string;
  categoryIds: number[];
  collectionIds: number[];
  colors: ProductColorFormValue[];
};

export type AdminCategoriesResponse = {
  items: AdminCategoryOption[];
};

export type AdminCollectionsResponse = {
  items: AdminCollectionOption[];
};