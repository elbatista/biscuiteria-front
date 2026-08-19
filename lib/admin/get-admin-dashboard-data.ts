import { prisma } from "@/lib/prisma";

function serializeDate(
  value: Date | null | undefined
) {
  return value
    ? value.toISOString()
    : null;
}

export async function getAdminDashboardData() {
  const [
    settings,

    ordersTotal,
    ordersCreated,
    ordersPendingPayment,
    ordersConfirmed,
    ordersProcessing,
    ordersShipped,
    ordersCanceled,

    actionOrders,
    latestOrders,

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

    /**
     * PEDIDOS
     */
    prisma.order.count(),

    prisma.order.count({
      where: {
        status: "created",
      },
    }),

    prisma.order.count({
      where: {
        status:
          "pending_payment",
      },
    }),

    prisma.order.count({
      where: {
        status: "confirmed",
      },
    }),

    prisma.order.count({
      where: {
        status: "processing",
      },
    }),

    prisma.order.count({
      where: {
        status: "shipped",
      },
    }),

    prisma.order.count({
      where: {
        status: "canceled",
      },
    }),

    /**
     * Pedidos ainda em andamento.
     *
     * Os menos recentemente atualizados aparecem primeiro,
     * ajudando a trazer para cima pedidos que estão parados.
     */
    prisma.order.findMany({
      where: {
        status: {
          in: [
            "created",
            "pending_payment",
            "confirmed",
            "processing",
          ],
        },
      },

      take: 6,

      orderBy: [
        {
          updatedAt: "asc",
        },
        {
          createdAt: "asc",
        },
      ],

      select: {
        id: true,
        publicId: true,
        status: true,

        customerName: true,

        itemsCount: true,
        totalInCents: true,

        createdAt: true,
        updatedAt: true,
      },
    }),

    /**
     * Últimos pedidos independentemente do status.
     */
    prisma.order.findMany({
      take: 6,

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        publicId: true,
        status: true,

        customerName: true,

        itemsCount: true,
        totalInCents: true,

        createdAt: true,
      },
    }),

    /**
     * CATÁLOGO
     */
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
      take: 3,

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

  const ordersInProgress =
    ordersCreated +
    ordersPendingPayment +
    ordersConfirmed +
    ordersProcessing;

  return {
    settings: {
      storeStatus:
        settings?.storeStatus ??
        "open",

      storeClosedMessage:
        settings?.storeClosedMessage ??
        "",

      announcementEnabled:
        settings?.announcementEnabled ??
        false,

      announcementMessage:
        settings?.announcementMessage ??
        "",

      announcementLinkLabel:
        settings?.announcementLinkLabel ??
        "",

      announcementLinkUrl:
        settings?.announcementLinkUrl ??
        "",

      updatedAt:
        serializeDate(
          settings?.updatedAt
        ),
    },

    orders: {
      total:
        ordersTotal,

      inProgress:
        ordersInProgress,

      created:
        ordersCreated,

      pendingPayment:
        ordersPendingPayment,

      confirmed:
        ordersConfirmed,

      processing:
        ordersProcessing,

      shipped:
        ordersShipped,

      canceled:
        ordersCanceled,
    },

    actionOrders:
      actionOrders.map(
        (order) => ({
          id:
            order.id,

          publicId:
            order.publicId,

          status:
            order.status,

          customerName:
            order.customerName,

          itemsCount:
            order.itemsCount,

          totalInCents:
            order.totalInCents,

          createdAt:
            serializeDate(
              order.createdAt
            ),

          updatedAt:
            serializeDate(
              order.updatedAt
            ),
        })
      ),

    latestOrders:
      latestOrders.map(
        (order) => ({
          id:
            order.id,

          publicId:
            order.publicId,

          status:
            order.status,

          customerName:
            order.customerName,

          itemsCount:
            order.itemsCount,

          totalInCents:
            order.totalInCents,

          createdAt:
            serializeDate(
              order.createdAt
            ),
        })
      ),

    products: {
      total:
        productsTotal,

      active:
        productsActive,

      inactive:
        productsInactive,

      featured:
        productsFeatured,

      withoutImage:
        productsWithoutImage,

      withoutCategory:
        productsWithoutCategory,
    },

    categories: {
      total:
        categoriesTotal,

      active:
        categoriesActive,

      inactive:
        categoriesInactive,
    },

    collections: {
      total:
        collectionsTotal,

      active:
        collectionsActive,

      inactive:
        collectionsInactive,

      featured:
        collectionsFeatured,
    },

    faq: {
      total:
        faqTotal,

      active:
        faqActive,

      inactive:
        faqInactive,
    },

    latestProducts:
      latestProducts.map(
        (product) => ({
          id:
            product.id,

          name:
            product.name,

          slug:
            product.slug,

          active:
            product.active,

          featured:
            product.featured,

          updatedAt:
            serializeDate(
              product.updatedAt
            ),

          imageUrl:
            product.images[0]
              ?.thumbUrl ||
            product.images[0]
              ?.url ||
            null,

          imageAlt:
            product.images[0]
              ?.altText ||
            product.name,
        })
      ),
  };
}

export type AdminDashboardData =
  Awaited<
    ReturnType<
      typeof getAdminDashboardData
    >
  >;