import { prisma } from "@/lib/prisma";
import type { StoreCollectionSummary } from "@/lib/server/store";
import { cacheLife, cacheTag } from "next/cache";

export type HomeBestSellerProduct = {
  id: number;
  name: string;
  slug: string;
  priceInCents: number;
  image: string;
  salesCount: number;
};

export async function getHomeBestSellers(limit = 4): Promise<HomeBestSellerProduct[]> {

  "use cache";

  cacheTag("best-sellers");
  cacheLife("minutes");

  const grouped = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: {
      quantity: true,
    },
    orderBy: {
      _sum: {
        quantity: "desc",
      },
    },
    take: limit,
  });

  const validGroupIds = grouped
    .map((item) => item.productId)
    .filter((value): value is number => typeof value === "number");

  if (validGroupIds.length === 0) {
    return [];
  }

  const products = await prisma.product.findMany({
    where: {
      id: { in: validGroupIds },
      active: true,
    },
    include: {
      images: {
        orderBy: {
          sortOrder: "asc",
        },
        take: 1,
      },
    },
  });

  const productMap = new Map(products.map((product) => [product.id, product]));

  return grouped
    .map((item) => {
      if (item.productId === null) {
        return null;
      }

      const product = productMap.get(item.productId);

      if (!product) {
        return null;
      }

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        priceInCents: product.priceInCents,
        image:
          product.images[0]?.thumbUrl ??
          product.images[0]?.url ??
          "/placeholder.png",
        salesCount: item._sum.quantity ?? 0,
      };
    })
    .filter((item): item is HomeBestSellerProduct => Boolean(item));
}

export async function getHomeLatestCollections(
  limit = 3
): Promise<StoreCollectionSummary[]> {
  const collections = await prisma.collection.findMany({
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
    orderBy: [{ createdAt: "desc" }, { sortOrder: "asc" }],
    take: limit,
    include: {
      _count: {
        select: {
          products: true,
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
    productCount: collection._count.products,
  }));
}