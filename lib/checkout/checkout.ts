import { randomUUID } from "node:crypto";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { sendManualOrderEmails } from "@/lib/server/manual-order-emails";
import { assertStoreCanAcceptOrders } from "@/lib/server/store-settings";

export const checkoutSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2, "Informe seu nome."),
    email: z.string().trim().email("Informe um e-mail válido."),
    phone: z.string().trim().min(10, "Informe um telefone válido."),
    document: z.string().trim().optional(),
  }),

  shippingAddress: z.object({
    recipientName: z
      .string()
      .trim()
      .min(2, "Informe o nome do destinatário."),

    zipCode: z
      .string()
      .trim()
      .length(8, "Informe um CEP válido."),

    street: z
      .string()
      .trim()
      .min(2, "Informe a rua."),

    number: z
      .string()
      .trim()
      .min(1, "Informe o número."),

    complement: z
      .string()
      .trim()
      .optional(),

    neighborhood: z
      .string()
      .trim()
      .min(2, "Informe o bairro."),

    city: z
      .string()
      .trim()
      .min(2, "Informe a cidade."),

    state: z
      .string()
      .trim()
      .length(2, "Informe a UF com 2 letras."),

    country: z
      .string()
      .trim()
      .default("BR"),
  }),

  customerNotes: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .or(z.literal("")),

  items: z
    .array(
      z.object({
        productId: z
          .number()
          .int()
          .positive(),

        quantity: z
          .number()
          .int()
          .min(1)
          .max(99),

        selectedColorId: z
          .number()
          .int()
          .positive()
          .nullable()
          .optional(),
      })
    )
    .min(1, "Seu carrinho está vazio."),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

function generatePublicIdCandidate() {
  return `PEDIDO-${randomUUID()
    .replace(/-/g, "")
    .slice(0, 20)
    .toUpperCase()}`;
}

async function generateUniquePublicId() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const publicId = generatePublicIdCandidate();

    const existingOrder = await prisma.order.findUnique({
      where: {
        publicId,
      },

      select: {
        id: true,
      },
    });

    if (!existingOrder) {
      return publicId;
    }
  }

  throw new Error(
    "Não foi possível gerar um número único para o pedido."
  );
}

function normalizeZipCode(zipCode: string) {
  return zipCode.replace(/\D/g, "");
}

type OrderCreationOptions = {
  sourceChannel: "site" | "admin";
  historySource: "system" | "admin";
  creationReason: string;
  checkStoreAvailability: boolean;
  sendCreationEmails: boolean;
};

async function createOrder(
  data: CheckoutInput,
  options: OrderCreationOptions
) {
  if (options.checkStoreAvailability) {
    await assertStoreCanAcceptOrders();
  }

  const uniqueProductIds = [
    ...new Set(
      data.items.map(
        (item) => item.productId
      )
    ),
  ];

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: uniqueProductIds,
      },

      active: true,
    },

    select: {
      id: true,
      slug: true,
      sku: true,
      name: true,
      priceInCents: true,

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
        },
      },
    },
  });

  if (
    products.length !==
    uniqueProductIds.length
  ) {
    throw new Error(
      "Um ou mais produtos do carrinho não estão mais disponíveis. Atualize o carrinho e tente novamente."
    );
  }

  const productMap = new Map(
    products.map((product) => [
      product.id,
      product,
    ])
  );

  const normalizedItems = data.items.map(
    (item) => {
      const product = productMap.get(
        item.productId
      );

      if (!product) {
        throw new Error(
          "Produto não encontrado."
        );
      }

      const selectedColorId =
        item.selectedColorId ?? null;

      const productHasColors =
        product.colors.length > 0;

      if (
        productHasColors &&
        !selectedColorId
      ) {
        throw new Error(
          `Escolha uma cor para o produto "${product.name}" antes de finalizar o pedido.`
        );
      }

      if (
        !productHasColors &&
        selectedColorId
      ) {
        throw new Error(
          `O produto "${product.name}" não possui opções de cor. Remova e adicione novamente ao carrinho.`
        );
      }

      const selectedColor =
        selectedColorId
          ? product.colors.find(
              (color) =>
                color.id ===
                selectedColorId
            )
          : null;

      if (
        selectedColorId &&
        !selectedColor
      ) {
        throw new Error(
          `A cor selecionada para "${product.name}" não está mais disponível. Remova e adicione novamente ao carrinho.`
        );
      }

      const lineTotalInCents =
        product.priceInCents *
        item.quantity;

      return {
        productId: product.id,

        productNameSnapshot:
          product.name,

        productSlugSnapshot:
          product.slug,

        skuSnapshot:
          product.sku,

        selectedColorId:
          selectedColor?.id ?? null,

        selectedColorNameSnapshot:
          selectedColor?.name ?? null,

        selectedColorHexSnapshot:
          selectedColor?.hex ?? null,

        unitPriceInCents:
          product.priceInCents,

        quantity:
          item.quantity,

        lineTotalInCents,
      };
    }
  );

  const itemsCount =
    normalizedItems.reduce(
      (acc, item) =>
        acc + item.quantity,
      0
    );

  const subtotalInCents =
    normalizedItems.reduce(
      (acc, item) =>
        acc +
        item.lineTotalInCents,
      0
    );

  /**
   * O pedido nasce sem frete definido.
   *
   * A vendedora informará o valor do frete
   * posteriormente no admin.
   */
  const shippingInCents = 0;

  const totalInCents =
    subtotalInCents +
    shippingInCents;

  const publicId =
    await generateUniquePublicId();

  const order =
    await prisma.$transaction(
      async (tx) => {
        const createdOrder =
          await tx.order.create({
            data: {
              publicId,

              customerName:
                data.customer.name.trim(),

              customerEmail:
                data.customer.email
                  .trim()
                  .toLowerCase(),

              customerPhone:
                data.customer.phone.trim(),

              customerDocument:
                data.customer.document?.trim() ||
                null,

              customerNotes:
                data.customerNotes?.trim() ||
                null,

              /**
               * Novo workflow:
               *
               * todo pedido nasce como "created".
               *
               * Isso significa:
               * pedido recebido e aguardando
               * revisão/definição do frete.
               */
              status: "created",

              paymentStatus:
                "pending",

              currency:
                "BRL",

              itemsCount,

              subtotalInCents,

              shippingInCents,

              totalInCents,

              shippingServiceName:
                "A combinar",

              paymentProvider:
                "manual",

              sourceChannel:
                options.sourceChannel,
            },

            include: {
              shippingAddress: true,
              items: true,
            },
          });

        await tx.orderItem.createMany({
          data: normalizedItems.map(
            (item) => ({
              orderId:
                createdOrder.id,

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
        });

        await tx.shippingAddress.create({
          data: {
            orderId:
              createdOrder.id,

            recipientName:
              data.shippingAddress
                .recipientName
                .trim(),

            zipCode:
              normalizeZipCode(
                data.shippingAddress
                  .zipCode
              ),

            street:
              data.shippingAddress
                .street
                .trim(),

            number:
              data.shippingAddress
                .number
                .trim(),

            complement:
              data.shippingAddress
                .complement
                ?.trim() ||
              null,

            neighborhood:
              data.shippingAddress
                .neighborhood
                .trim(),

            city:
              data.shippingAddress
                .city
                .trim(),

            state:
              data.shippingAddress
                .state
                .trim()
                .toUpperCase(),

            country:
              data.shippingAddress
                .country
                .trim()
                .toUpperCase() ||
              "BR",
          },
        });

        /**
         * Primeiro evento do histórico.
         *
         * fromStatus = null porque este é
         * o nascimento do pedido.
         */
        await tx.orderStatusHistory.create({
          data: {
            orderId:
              createdOrder.id,

            fromStatus:
              null,

            toStatus:
              "created",

            reason:
              options.creationReason,

            source:
              options.historySource,

            metadataJson: {
              event:
                "order_created",

              origin:
                options.sourceChannel,

              payment:
                "manual",

              shipping:
                "manual",

              hasColorSelections:
                normalizedItems.some(
                  (item) =>
                    item.selectedColorId !==
                    null
                ),
            },
          },
        });

        return createdOrder;
      }
    );

  if (!options.sendCreationEmails) {
    return {
      id: order.id,
      publicId: order.publicId,
    };
  }

  const orderForEmail =
    await prisma.order.findUnique({
      where: {
        id: order.id,
      },

      include: {
        items: {
          orderBy: {
            id: "asc",
          },
        },

        shippingAddress:
          true,
      },
    });

  if (!orderForEmail) {
    throw new Error(
      "Pedido criado, mas não foi possível carregá-lo."
    );
  }

  /**
   * Por enquanto mantemos o e-mail
   * automático de criação existente.
   *
   * Na etapa específica de notificações
   * vamos reorganizar os e-mails em torno
   * das ações do workflow.
   */
  try {
    await sendManualOrderEmails({
      publicId:
        orderForEmail.publicId,

      customerName:
        orderForEmail.customerName,

      customerEmail:
        orderForEmail.customerEmail,

      customerPhone:
        orderForEmail.customerPhone,

      customerDocument:
        orderForEmail.customerDocument,

      customerNotes:
        orderForEmail.customerNotes,

      subtotalInCents:
        orderForEmail.subtotalInCents,

      totalInCents:
        orderForEmail.totalInCents,

      createdAt:
        orderForEmail.createdAt,

      items:
        orderForEmail.items.map(
          (item) => ({
            productNameSnapshot:
              item.productNameSnapshot,

            productSlugSnapshot:
              item.productSlugSnapshot,

            skuSnapshot:
              item.skuSnapshot,

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
        orderForEmail.shippingAddress
          ? {
              recipientName:
                orderForEmail
                  .shippingAddress
                  .recipientName,

              zipCode:
                orderForEmail
                  .shippingAddress
                  .zipCode,

              street:
                orderForEmail
                  .shippingAddress
                  .street,

              number:
                orderForEmail
                  .shippingAddress
                  .number,

              complement:
                orderForEmail
                  .shippingAddress
                  .complement,

              neighborhood:
                orderForEmail
                  .shippingAddress
                  .neighborhood,

              city:
                orderForEmail
                  .shippingAddress
                  .city,

              state:
                orderForEmail
                  .shippingAddress
                  .state,

              country:
                orderForEmail
                  .shippingAddress
                  .country,
            }
          : null,
    });
  } catch (error) {
    console.error(
      "MANUAL_ORDER_EMAIL_ERROR",
      error
    );

    /**
     * Uma falha de e-mail não desfaz
     * a criação do pedido.
     *
     * Registramos apenas o ocorrido
     * no histórico.
     */
    await prisma.orderStatusHistory.create({
      data: {
        orderId:
          order.id,

        fromStatus:
          "created",

        toStatus:
          "created",

        reason:
          "Pedido criado, mas houve erro ao enviar um ou mais e-mails automáticos.",

        source:
          "system",

        metadataJson: {
          event:
            "order_created_email_failed",

          error:
            error instanceof Error
              ? error.message
              : "unknown_error",
        },
      },
    });
  }

  return {
    id: order.id,
    publicId:
      order.publicId,
  };
}

export async function createCheckoutOrder(
  data: CheckoutInput
) {
  return createOrder(data, {
    sourceChannel: "site",
    historySource: "system",
    creationReason:
      "Pedido criado pelo cliente. Aguardando revisão e definição do frete.",
    checkStoreAvailability: true,
    sendCreationEmails: true,
  });
}

export async function createAdminOrder(
  data: CheckoutInput,
  options?: {
    sendCreationEmails?: boolean;
  }
) {
  return createOrder(data, {
    sourceChannel: "admin",
    historySource: "admin",
    creationReason:
      "Pedido criado manualmente pelo admin. Aguardando revisão e definição do frete.",
    checkStoreAvailability: false,
    sendCreationEmails:
      options?.sendCreationEmails ?? true,
  });
}
