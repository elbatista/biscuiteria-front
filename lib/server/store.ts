import { prisma } from "@/lib/prisma";

export type StoreSortOption =
  | "featured"
  | "recent"
  | "price-asc"
  | "price-desc";

export type StoreCategorySummary = {
  id: number;
  name: string;
  slug: string;
  productCount: number;
};

export type StoreCollectionSummary = {
  id: number;
  title: string;
  slug: string;

  description:
    string | null;

  coverImageUrl:
    string | null;

  isFeatured:
    boolean;

  productCount:
    number;
};

export type StoreProductCardData = {
  id: number;
  slug: string;
  name: string;

  shortDescription:
    string | null;

  priceInCents:
    number;

  featured:
    boolean;

  image:
    string;

  available:
    boolean;

  colors: Array<{
    id: number;
    name: string;
    hex: string;
  }>;
};

export type StorePageData = {
  products:
    StoreProductCardData[];

  categories:
    StoreCategorySummary[];

  latestCollections:
    StoreCollectionSummary[];

  selectedCategory:
    StoreCategorySummary | null;

  selectedCollection:
    StoreCollectionSummary | null;

  totalProducts:
    number;

  sort:
    StoreSortOption;
};

function normalizeSingleValue(
  value?:
    | string
    | string[]
) {
  if (
    Array.isArray(value)
  ) {
    return value[0];
  }

  return value;
}

export function parseStoreSort(
  value?:
    | string
    | string[]
): StoreSortOption {
  const normalized =
    normalizeSingleValue(
      value
    );

  switch (normalized) {
    case "recent":
    case "price-asc":
    case "price-desc":
    case "featured":
      return normalized;

    default:
      return "featured";
  }
}

function buildProductOrderBy(
  sort: StoreSortOption
) {
  switch (sort) {
    case "recent":
      return [
        {
          createdAt:
            "desc" as const,
        },
      ];

    case "price-asc":
      return [
        {
          priceInCents:
            "asc" as const,
        },
        {
          createdAt:
            "desc" as const,
        },
      ];

    case "price-desc":
      return [
        {
          priceInCents:
            "desc" as const,
        },
        {
          createdAt:
            "desc" as const,
        },
      ];

    case "featured":
    default:
      return [
        {
          featured:
            "desc" as const,
        },
        {
          createdAt:
            "desc" as const,
        },
      ];
  }
}

export async function getStorePageData(
  input?: {
    categorySlug?:
      | string
      | string[];

    collectionSlug?:
      | string
      | string[];

    sort?:
      | string
      | string[];
  }
): Promise<StorePageData> {
  const categorySlug =
    normalizeSingleValue(
      input?.categorySlug
    );

  const collectionSlug =
    normalizeSingleValue(
      input?.collectionSlug
    );

  const sort =
    parseStoreSort(
      input?.sort
    );

  const [
    categories,
    latestCollections,
    selectedCategory,
    selectedCollection,
  ] =
    await Promise.all([
      prisma.category.findMany({
        where: {
          isActive: true,

          products: {
            some: {
              product: {
                active: true,
              },
            },
          },
        },

        orderBy: [
          {
            sortOrder:
              "asc",
          },
          {
            name:
              "asc",
          },
        ],

        include: {
          _count: {
            select: {
              products:
                true,
            },
          },
        },
      }),

      prisma.collection.findMany({
        where: {
          isActive: true,
        },

        orderBy: [
          {
            createdAt:
              "desc",
          },
          {
            sortOrder:
              "asc",
          },
        ],

        include: {
          products: {
            where: {
              product: {
                active: true,
              },
            },

            select: {
              productId:
                true,
            },
          },
        },

        take: 6,
      }),

      categorySlug
        ? prisma.category.findFirst({
            where: {
              slug:
                categorySlug,

              isActive:
                true,
            },

            include: {
              _count: {
                select: {
                  products:
                    true,
                },
              },
            },
          })
        : Promise.resolve(
            null
          ),

      collectionSlug
        ? prisma.collection.findFirst({
            where: {
              slug:
                collectionSlug,

              isActive:
                true,
            },

            include: {
              products: {
                where: {
                  product: {
                    active:
                      true,
                  },
                },

                select: {
                  productId:
                    true,
                },
              },
            },
          })
        : Promise.resolve(
            null
          ),
    ]);

  const where = {
    active: true,

    ...(selectedCategory
      ? {
          categories: {
            some: {
              categoryId:
                selectedCategory.id,
            },
          },
        }
      : {}),

    ...(selectedCollection
      ? {
          collections: {
            some: {
              collectionId:
                selectedCollection.id,
            },
          },
        }
      : {}),
  };

  const products =
    await prisma.product.findMany({
      where,

      orderBy:
        buildProductOrderBy(
          sort
        ),

      include: {
        images: {
          orderBy: {
            sortOrder:
              "asc",
          },

          take: 1,
        },

        colors: {
          where: {
            active: true,
          },

          orderBy: {
            sortOrder:
              "asc",
          },

          select: {
            id: true,
            name: true,
            hex: true,
          },
        },
      },
    });

  return {
    products:
      products.map(
        (product) => ({
          id:
            product.id,

          slug:
            product.slug,

          name:
            product.name,

          shortDescription:
            product.shortDescription,

          priceInCents:
            product.priceInCents,

          featured:
            product.featured,

          image:
            product.images[0]
              ?.thumbUrl ??
            product.images[0]
              ?.url ??
            "/placeholder.png",

          available:
            true,

          colors:
            product.colors.map(
              (color) => ({
                id:
                  color.id,

                name:
                  color.name,

                hex:
                  color.hex,
              })
            ),
        })
      ),

    categories:
      categories.map(
        (category) => ({
          id:
            category.id,

          name:
            category.name,

          slug:
            category.slug,

          productCount:
            category._count
              .products,
        })
      ),

    latestCollections:
      latestCollections.map(
        (collection) => ({
          id:
            collection.id,

          title:
            collection.title,

          slug:
            collection.slug,

          description:
            collection.description,

          coverImageUrl:
            collection.coverImageUrl,

          isFeatured:
            collection.isFeatured,

          productCount:
            collection.products
              .length,
        })
      ),

    selectedCategory:
      selectedCategory
        ? {
            id:
              selectedCategory.id,

            name:
              selectedCategory.name,

            slug:
              selectedCategory.slug,

            productCount:
              selectedCategory._count
                .products,
          }
        : null,

    selectedCollection:
      selectedCollection
        ? {
            id:
              selectedCollection.id,

            title:
              selectedCollection.title,

            slug:
              selectedCollection.slug,

            description:
              selectedCollection.description,

            coverImageUrl:
              selectedCollection.coverImageUrl,

            isFeatured:
              selectedCollection.isFeatured,

            productCount:
              selectedCollection.products
                .length,
          }
        : null,

    totalProducts:
      products.length,

    sort,
  };
}