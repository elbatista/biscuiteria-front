import { prisma } from "@/lib/prisma";

export async function getStoreProducts() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
  });

  return products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    priceInCents: product.priceInCents,
    featured: product.featured,
    image:
      product.images[0]?.thumbUrl ??
      product.images[0]?.url ??
      "/placeholder.png",
    available: true,
  }));
}

export async function getStoreProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: {
      slug,
      active: true,
    },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!product) return null;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    description: product.description,
    priceInCents: product.priceInCents,
    compareAtPriceInCents: product.compareAtPriceInCents,
    featured: product.featured,
    images: product.images.map((image) => ({
      id: image.id,
      url: image.url,
      thumbUrl: image.thumbUrl,
      altText: image.altText,
      sortOrder: image.sortOrder,
    })),
    available: true,
  };
}

export async function getRelatedStoreProducts(currentProductId: number) {
  const products = await prisma.product.findMany({
    where: {
      active: true,
      id: {
        not: currentProductId,
      },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 4,
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
  });

  return products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    priceInCents: product.priceInCents,
    featured: product.featured,
    image:
      product.images[0]?.thumbUrl ??
      product.images[0]?.url ??
      "/placeholder.png",
    available: true,
  }));
}