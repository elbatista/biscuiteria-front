export type AdminCollection = {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  coverImageUrl?: string | null;
  coverImageThumbUrl?: string | null;
  coverImageAlt?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  startsAt?: string | null;
  endsAt?: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    products: number;
  };
};

export type AdminCollectionsResponse = {
  items: AdminCollection[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type CollectionFormValues = {
  title: string;
  description: string;
  coverImageAlt: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  startsAt: string;
  endsAt: string;
};

export type UploadCollectionCoverResponse = {
  success: true;
  url: string;
  thumbUrl: string;
};