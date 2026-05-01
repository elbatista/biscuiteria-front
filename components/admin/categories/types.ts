export type AdminCategory = {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    products: number;
  };
};

export type AdminCategoriesResponse = {
  items: AdminCategory[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type CategoryFormValues = {
  name: string;
  isActive: boolean;
  sortOrder: number;
};