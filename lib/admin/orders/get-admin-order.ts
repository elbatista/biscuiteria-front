import { prisma } from "@/lib/prisma";

export type AdminOrderDetails = {
  id: number;
  publicId: string;
  status: string;
  paymentStatus: string;
  currency: string;

  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  customerDocument: string | null;
  customerNotes: string | null;

  sellerNotes: string | null;

  itemsCount: number;
  subtotalInCents: number;
  shippingInCents: number;
  totalInCents: number;

  shippingServiceName: string | null;
  paymentProvider: string | null;
  sourceChannel: string | null;

  trackingCode: string | null;
  trackingUrl: string | null;

  createdAt: Date;
  updatedAt: Date;
  paidAt: Date | null;
  shippedAt: Date | null;
  cancelledAt: Date | null;

  items: {
    id: number;
    productId: number | null;
    productNameSnapshot: string;
    productSlugSnapshot: string | null;
    skuSnapshot: string | null;
    selectedColorId: number | null;
    selectedColorNameSnapshot: string | null;
    selectedColorHexSnapshot: string | null;
    unitPriceInCents: number;
    quantity: number;
    lineTotalInCents: number;
  }[];

  shippingAddress: {
    id: number;
    recipientName: string;
    zipCode: string;
    street: string;
    number: string;
    complement: string | null;
    neighborhood: string;
    city: string;
    state: string;
    country: string;
  } | null;

  statusHistory: {
    id: number;
    fromStatus: string | null;
    toStatus: string;
    reason: string | null;
    source: string | null;
    metadataJson: unknown;
    createdAt: Date;
  }[];
};

export async function getAdminOrderById(
  id: number
): Promise<AdminOrderDetails | null> {
  const order =
    await prisma.order.findUnique({
      where: {
        id,
      },

      include: {
        items: {
          orderBy: {
            id: "asc",
          },
        },

        shippingAddress: true,

        statusHistory: {
          orderBy: {
            createdAt: "asc",
          },

          select: {
            id: true,
            fromStatus: true,
            toStatus: true,
            reason: true,
            source: true,
            metadataJson: true,
            createdAt: true,
          },
        },
      },
    });

  if (!order) {
    return null;
  }

  return {
    id: order.id,
    publicId: order.publicId,
    status: order.status,
    paymentStatus: order.paymentStatus,
    currency: order.currency,

    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    customerDocument: order.customerDocument,
    customerNotes: order.customerNotes,

    sellerNotes: order.sellerNotes,

    itemsCount: order.itemsCount,
    subtotalInCents: order.subtotalInCents,
    shippingInCents: order.shippingInCents,
    totalInCents: order.totalInCents,

    shippingServiceName:
      order.shippingServiceName,

    paymentProvider:
      order.paymentProvider,

    sourceChannel:
      order.sourceChannel,

    trackingCode:
      order.trackingCode,

    trackingUrl:
      order.trackingUrl,

    createdAt:
      order.createdAt,

    updatedAt:
      order.updatedAt,

    paidAt:
      order.paidAt,

    shippedAt:
      order.shippedAt,

    cancelledAt:
      order.cancelledAt,

    items: order.items.map(
      (item) => ({
        id: item.id,

        productId:
          item.productId,

        productNameSnapshot:
          item.productNameSnapshot,

        productSlugSnapshot:
          item.productSlugSnapshot,

        skuSnapshot:
          item.skuSnapshot,

        selectedColorId:
          item.selectedColorId,

        selectedColorNameSnapshot:
          item.selectedColorNameSnapshot,

        selectedColorHexSnapshot:
          item.selectedColorHexSnapshot,

        unitPriceInCents:
          item.unitPriceInCents,

        quantity:
          item.quantity,

        lineTotalInCents:
          item.lineTotalInCents,
      })
    ),

    shippingAddress:
      order.shippingAddress
        ? {
            id:
              order.shippingAddress.id,

            recipientName:
              order.shippingAddress
                .recipientName,

            zipCode:
              order.shippingAddress
                .zipCode,

            street:
              order.shippingAddress
                .street,

            number:
              order.shippingAddress
                .number,

            complement:
              order.shippingAddress
                .complement,

            neighborhood:
              order.shippingAddress
                .neighborhood,

            city:
              order.shippingAddress
                .city,

            state:
              order.shippingAddress
                .state,

            country:
              order.shippingAddress
                .country,
          }
        : null,

    statusHistory:
      order.statusHistory.map(
        (history) => ({
          id:
            history.id,

          fromStatus:
            history.fromStatus,

          toStatus:
            history.toStatus,

          reason:
            history.reason,

          source:
            history.source,

          metadataJson:
            history.metadataJson,

          createdAt:
            history.createdAt,
        })
      ),
  };
}