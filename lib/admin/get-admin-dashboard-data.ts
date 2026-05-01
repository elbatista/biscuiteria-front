import { prisma } from "@/lib/prisma";

function serializeDate(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}

export async function getAdminDashboardData() {
  const [
    settings,
    productsTotal,
    productsActive,
    productsInactive,
    productsFeatured,
    productsWithoutImage,
    productsWithoutCategory,
    categoriesTotal,
    categoriesActive,
    categoriesInactive,
    collectionsTotal,
    collectionsActive,
    collectionsInactive,
    collectionsFeatured,
    faqTotal,
    faqActive,
    faqInactive,
    latestProducts,
  ] = await Promise.all([
    prisma.storeSettings.findFirst({
      orderBy: {
        id: "asc",
      },
    }),

    prisma.product.count(),

    prisma.product.count({
      where: {
        active: true,
      },
    }),

    prisma.product.count({
      where: {
        active: false,
      },
    }),

    prisma.product.count({
      where: {
        featured: true,
      },
    }),

    prisma.product.count({
      where: {
        images: {
          none: {},
        },
      },
    }),

    prisma.product.count({
      where: {
        categories: {
          none: {},
        },
      },
    }),

    prisma.category.count(),

    prisma.category.count({
      where: {
        isActive: true,
      },
    }),

    prisma.category.count({
      where: {
        isActive: false,
      },
    }),

    prisma.collection.count(),

    prisma.collection.count({
      where: {
        isActive: true,
      },
    }),

    prisma.collection.count({
      where: {
        isActive: false,
      },
    }),

    prisma.collection.count({
      where: {
        isFeatured: true,
      },
    }),

    prisma.faqItem.count(),

    prisma.faqItem.count({
      where: {
        active: true,
      },
    }),

    prisma.faqItem.count({
      where: {
        active: false,
      },
    }),

    prisma.product.findMany({
      take: 5,
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        active: true,
        featured: true,
        updatedAt: true,
        images: {
          take: 1,
          orderBy: {
            sortOrder: "asc",
          },
          select: {
            thumbUrl: true,
            url: true,
            altText: true,
          },
        },
      },
    }),
  ]);

  const shippingOriginComplete = Boolean(
    settings?.originZipCode &&
      settings?.originStreet &&
      settings?.originNumber &&
      settings?.originDistrict &&
      settings?.originCity &&
      settings?.originState
  );

  return {
    settings: {
      storeStatus: settings?.storeStatus ?? "open",
      storeClosedMessage: settings?.storeClosedMessage ?? "",
      announcementEnabled: settings?.announcementEnabled ?? false,
      announcementMessage: settings?.announcementMessage ?? "",
      announcementLinkLabel: settings?.announcementLinkLabel ?? "",
      announcementLinkUrl: settings?.announcementLinkUrl ?? "",
      originZipCode: settings?.originZipCode ?? "",
      originCity: settings?.originCity ?? "",
      originState: settings?.originState ?? "",
      shippingOriginComplete,
      updatedAt: serializeDate(settings?.updatedAt),
    },

    products: {
      total: productsTotal,
      active: productsActive,
      inactive: productsInactive,
      featured: productsFeatured,
      withoutImage: productsWithoutImage,
      withoutCategory: productsWithoutCategory,
    },

    categories: {
      total: categoriesTotal,
      active: categoriesActive,
      inactive: categoriesInactive,
    },

    collections: {
      total: collectionsTotal,
      active: collectionsActive,
      inactive: collectionsInactive,
      featured: collectionsFeatured,
    },

    faq: {
      total: faqTotal,
      active: faqActive,
      inactive: faqInactive,
    },

    latestProducts: latestProducts.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      active: product.active,
      featured: product.featured,
      updatedAt: serializeDate(product.updatedAt),
      imageUrl: product.images[0]?.thumbUrl || product.images[0]?.url || null,
      imageAlt: product.images[0]?.altText || product.name,
    })),
  };
}

export type AdminDashboardData = Awaited<
  ReturnType<typeof getAdminDashboardData>
>;