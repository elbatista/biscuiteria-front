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
      colors: {
        where: {
          active: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
        select: {
          id: true,
          name: true,
          hex: true,
          sortOrder: true,
          active: true,
        },
      },
      collections: {
        include: {
          collection: {
            select: {
              id: true,
              title: true,
              slug: true,
              coverImageUrl: true,
              coverImageThumbUrl: true,
              isFeatured: true,
            },
          },
        },
        orderBy: {
          collectionId: "asc",
        },
      },
      categories: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: {
          categoryId: "asc",
        },
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
    colors: product.colors.map((color) => ({
      id: color.id,
      name: color.name,
      hex: color.hex,
      sortOrder: color.sortOrder,
      active: color.active,
    })),
    collections: product.collections.map((item) => ({
      id: item.collection.id,
      title: item.collection.title,
      slug: item.collection.slug,
      coverImageUrl: item.collection.coverImageUrl,
      coverImageThumbUrl: item.collection.coverImageThumbUrl,
      isFeatured: item.collection.isFeatured,
    })),
    categories: product.categories.map((item) => ({
      id: item.category.id,
      name: item.category.name,
      slug: item.category.slug,
    })),
    available: true,
  };
}

export async function getRelatedStoreProducts(currentProductId: number) {
  const currentProduct = await prisma.product.findUnique({
    where: { id: currentProductId },
    include: {
      collections: {
        select: {
          collectionId: true,
        },
      },
      categories: {
        select: {
          categoryId: true,
        },
      },
    },
  });

  if (!currentProduct) {
    return {
      title: "Você também pode gostar",
      subtitle: "Veja outros produtos da loja.",
      products: [],
    };
  }

  const collectionIds = currentProduct.collections.map(
    (item) => item.collectionId
  );
  const categoryIds = currentProduct.categories.map((item) => item.categoryId);

  const sameCollection = collectionIds.length
    ? await prisma.product.findMany({
        where: {
          active: true,
          id: {
            not: currentProductId,
          },
          collections: {
            some: {
              collectionId: {
                in: collectionIds,
              },
            },
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
      })
    : [];

  let relatedProducts = sameCollection;

  if (relatedProducts.length < 4 && categoryIds.length > 0) {
    const existingIds = new Set([
      currentProductId,
      ...relatedProducts.map((product) => product.id),
    ]);

    const sameCategory = await prisma.product.findMany({
      where: {
        active: true,
        id: {
          notIn: Array.from(existingIds),
        },
        categories: {
          some: {
            categoryId: {
              in: categoryIds,
            },
          },
        },
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 4 - relatedProducts.length,
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
      },
    });

    relatedProducts = [...relatedProducts, ...sameCategory];
  }

  if (relatedProducts.length < 4) {
    const existingIds = new Set([
      currentProductId,
      ...relatedProducts.map((product) => product.id),
    ]);

    const fallback = await prisma.product.findMany({
      where: {
        active: true,
        id: {
          notIn: Array.from(existingIds),
        },
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 4 - relatedProducts.length,
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
      },
    });

    relatedProducts = [...relatedProducts, ...fallback];
  }

  let title = "Você também pode gostar";
  let subtitle = "Veja outros produtos da loja.";

  if (collectionIds.length > 0 && sameCollection.length > 0) {
    title = "Mais da mesma coleção";
    subtitle = "Veja outros produtos da mesma coleção.";
  } else if (categoryIds.length > 0) {
    title = "Mais da mesma categoria";
    subtitle = "Descubra outros produtos relacionados pela categoria.";
  }

  return {
    title,
    subtitle,
    products: relatedProducts.map((product) => ({
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
    })),
  };
}