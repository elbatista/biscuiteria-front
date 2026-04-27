import { prisma } from "@/lib/prisma";
import type {
  StoreCategorySummary,
  StoreCollectionSummary,
  StoreProductCardData,
  StoreSortOption,
} from "@/lib/server/store";
import { parseStoreSort } from "@/lib/server/store";
import { unstable_noStore as noStore } from "next/cache";

function normalizeSingleValue(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function buildProductOrderBy(sort: StoreSortOption) {
  switch (sort) {
    case "recent":
      return [{ createdAt: "desc" as const }];
    case "price-asc":
      return [{ priceInCents: "asc" as const }, { createdAt: "desc" as const }];
    case "price-desc":
      return [{ priceInCents: "desc" as const }, { createdAt: "desc" as const }];
    case "featured":
    default:
      return [{ featured: "desc" as const }, { createdAt: "desc" as const }];
  }
}

export type CollectionPageData = {
  collection: {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    coverImageUrl: string | null;
    coverImageThumbUrl: string | null;
    isFeatured: boolean;
  };
  categories: StoreCategorySummary[];
  selectedCategory: StoreCategorySummary | null;
  products: StoreProductCardData[];
  totalProducts: number;
  sort: StoreSortOption;
};

export async function getCollectionPageData(input: {
  slug: string;
  categorySlug?: string | string[];
  sort?: string | string[];
}): Promise<CollectionPageData | null> {
  const categorySlug = normalizeSingleValue(input.categorySlug);
  const sort = parseStoreSort(input.sort);

  const collection = await prisma.collection.findFirst({
    where: {
      slug: input.slug,
      isActive: true,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      coverImageUrl: true,
      coverImageThumbUrl: true,
      isFeatured: true,
    },
  });

  if (!collection) {
    return null;
  }

  const categoriesInCollection = await prisma.category.findMany({
    where: {
      isActive: true,
      products: {
        some: {
          product: {
            active: true,
            collections: {
              some: {
                collectionId: collection.id,
              },
            },
          },
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  const selectedCategory =
    categorySlug
      ? categoriesInCollection.find((category) => category.slug === categorySlug) ?? null
      : null;

  const products = await prisma.product.findMany({
    where: {
      active: true,
      collections: {
        some: {
          collectionId: collection.id,
        },
      },
      ...(selectedCategory
        ? {
            categories: {
              some: {
                categoryId: selectedCategory.id,
              },
            },
          }
        : {}),
    },
    orderBy: buildProductOrderBy(sort),
    include: {
      images: {
        orderBy: {
          sortOrder: "asc",
        },
        take: 1,
      },
    },
  });

  return {
    collection,
    categories: categoriesInCollection.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      productCount: category._count.products,
    })),
    selectedCategory: selectedCategory
      ? {
          id: selectedCategory.id,
          name: selectedCategory.name,
          slug: selectedCategory.slug,
          productCount: selectedCategory._count.products,
        }
      : null,
    products: products.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      shortDescription: product.shortDescription,
      priceInCents: product.priceInCents,
      featured: product.featured,
      image:
        product.images[0]?.thumbUrl ??
        product.images[0]?.url ??
        "/placeholder.png",
      available: true,
    })),
    totalProducts: products.length,
    sort,
  };
}

export async function getCollectionsIndexPageData(): Promise<StoreCollectionSummary[]> {
  noStore();

  const collections = await prisma.collection.findMany({
    where: {
      isActive: true,
    },
    orderBy: [{ createdAt: "desc" }, { sortOrder: "asc" }],
    include: {
      products: {
        where: {
          product: {
            active: true,
          },
        },
        select: {
          productId: true,
        },
      },
    },
  });

  return collections.map((collection) => ({
    id: collection.id,
    title: collection.title,
    slug: collection.slug,
    description: collection.description,
    coverImageUrl: collection.coverImageUrl,
    isFeatured: collection.isFeatured,
    productCount: collection.products.length,
  }));
}