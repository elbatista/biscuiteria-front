import { randomUUID } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertStoreCanAcceptOrders } from "@/lib/server/store-settings";

export const checkoutSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2, "Informe seu nome."),
    email: z.string().trim().email("Informe um e-mail válido."),
    phone: z.string().trim().min(10, "Informe um telefone válido."),
    document: z.string().trim().optional(),
  }),
  shippingAddress: z.object({
    recipientName: z.string().trim().min(2, "Informe o nome do destinatário."),
    zipCode: z.string().trim().length(8, "Informe um CEP válido."),
    street: z.string().trim().min(2, "Informe a rua."),
    number: z.string().trim().min(1, "Informe o número."),
    complement: z.string().trim().optional(),
    neighborhood: z.string().trim().min(2, "Informe o bairro."),
    city: z.string().trim().min(2, "Informe a cidade."),
    state: z.string().trim().length(2, "Informe a UF com 2 letras."),
    country: z.string().trim().default("BR"),
  }),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1, "Seu carrinho está vazio."),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

function generatePublicId() {
  return `PED-${randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`;
}

function normalizeZipCode(zipCode: string) {
  return zipCode.replace(/\D/g, "");
}

export async function createCheckoutOrder(data: CheckoutInput) {

  await assertStoreCanAcceptOrders();

  const uniqueProductIds = [...new Set(data.items.map((item) => item.productId))];

  const products = await prisma.product.findMany({
    where: {
      id: { in: uniqueProductIds },
      active: true,
    },
    select: {
      id: true,
      slug: true,
      sku: true,
      name: true,
      priceInCents: true,
    },
  });

  if (products.length !== uniqueProductIds.length) {
    throw new Error(
      "Um ou mais produtos do carrinho não estão mais disponíveis. Atualize o carrinho e tente novamente."
    );
  }

  const productMap = new Map(products.map((product) => [product.id, product]));

  const normalizedItems = data.items.map((item) => {
    const product = productMap.get(item.productId);

    if (!product) {
      throw new Error("Produto não encontrado.");
    }

    const lineTotalInCents = product.priceInCents * item.quantity;

    return {
      productId: product.id,
      productNameSnapshot: product.name,
      productSlugSnapshot: product.slug,
      skuSnapshot: product.sku,
      unitPriceInCents: product.priceInCents,
      quantity: item.quantity,
      lineTotalInCents,
    };
  });

  const itemsCount = normalizedItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotalInCents = normalizedItems.reduce(
    (acc, item) => acc + item.lineTotalInCents,
    0
  );
  const shippingInCents = 0;
  const totalInCents = subtotalInCents + shippingInCents;
  const publicId = generatePublicId();

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        publicId,
        customerName: data.customer.name.trim(),
        customerEmail: data.customer.email.trim().toLowerCase(),
        customerPhone: data.customer.phone.trim(),
        customerDocument: data.customer.document?.trim() || null,
        status: "pending_payment",
        paymentStatus: "pending",
        currency: "BRL",
        itemsCount,
        subtotalInCents,
        shippingInCents,
        totalInCents,
        paymentProvider: "mercadopago",
        sourceChannel: "site",
      },
    });

    await tx.orderItem.createMany({
      data: normalizedItems.map((item) => ({
        orderId: createdOrder.id,
        productId: item.productId,
        productNameSnapshot: item.productNameSnapshot,
        productSlugSnapshot: item.productSlugSnapshot,
        skuSnapshot: item.skuSnapshot,
        unitPriceInCents: item.unitPriceInCents,
        quantity: item.quantity,
        lineTotalInCents: item.lineTotalInCents,
      })),
    });

    await tx.shippingAddress.create({
      data: {
        orderId: createdOrder.id,
        recipientName: data.shippingAddress.recipientName.trim(),
        zipCode: normalizeZipCode(data.shippingAddress.zipCode),
        street: data.shippingAddress.street.trim(),
        number: data.shippingAddress.number.trim(),
        complement: data.shippingAddress.complement?.trim() || null,
        neighborhood: data.shippingAddress.neighborhood.trim(),
        city: data.shippingAddress.city.trim(),
        state: data.shippingAddress.state.trim().toUpperCase(),
        country: data.shippingAddress.country.trim().toUpperCase() || "BR",
      },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId: createdOrder.id,
        fromStatus: null,
        toStatus: "pending_payment",
        reason: "Pedido criado no checkout.",
        source: "system",
        metadataJson: {
          step: "checkout_created",
        },
      },
    });

    return createdOrder;
  });

  return {
    publicId: order.publicId,
  };
}