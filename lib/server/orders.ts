import { prisma } from "@/lib/prisma";

export async function getOrderByPublicId(publicId: string) {
  const order = await prisma.order.findUnique({
    where: { publicId },
    include: {
      items: {
        orderBy: { id: "asc" },
      },
      shippingAddress: true,
      statusHistory: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!order) return null;

  return {
    id: order.id,
    publicId: order.publicId,
    status: order.status,
    paymentStatus: order.paymentStatus,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    customerDocument: order.customerDocument,
    subtotalInCents: order.subtotalInCents,
    shippingInCents: order.shippingInCents,
    totalInCents: order.totalInCents,
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      id: item.id,
      productNameSnapshot: item.productNameSnapshot,
      productSlugSnapshot: item.productSlugSnapshot,
      unitPriceInCents: item.unitPriceInCents,
      quantity: item.quantity,
      lineTotalInCents: item.lineTotalInCents,
    })),
    shippingAddress: order.shippingAddress
      ? {
          recipientName: order.shippingAddress.recipientName,
          zipCode: order.shippingAddress.zipCode,
          street: order.shippingAddress.street,
          number: order.shippingAddress.number,
          complement: order.shippingAddress.complement,
          neighborhood: order.shippingAddress.neighborhood,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          country: order.shippingAddress.country,
        }
      : null,
  };
}