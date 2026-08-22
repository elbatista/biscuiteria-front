import { randomUUID } from "node:crypto";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { sendManualOrderEmails } from "@/lib/server/manual-order-emails";
import { getStoreSettings } from "@/lib/server/store-settings";

export class CheckoutBusinessError extends Error {
  constructor(message: string) {
    super(message);

    this.name = "CheckoutBusinessError";
  }
}

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

export const publicCheckoutSchema = checkoutSchema.extend({
  idempotencyKey: z
    .string()
    .uuid("Identificador de checkout inválido."),
});

export type PublicCheckoutInput = z.infer<
  typeof publicCheckoutSchema
>;

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
  idempotencyKey: string;
};

async function createOrder(
  data: CheckoutInput,
  options: OrderCreationOptions
) {
  if (options.checkStoreAvailability) {
    const settings = await getStoreSettings();

    if (settings.storeStatus === "closed") {
      throw new CheckoutBusinessError(
        settings.storeClosedMessage ||
          "A loja não está aceitando pedidos no momento."
      );
    }
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
    throw new CheckoutBusinessError(
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
        throw new CheckoutBusinessError(
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
        throw new CheckoutBusinessError(
          `Escolha uma cor para o produto "${product.name}" antes de finalizar o pedido.`
        );
      }

      if (
        !productHasColors &&
        selectedColorId
      ) {
        throw new CheckoutBusinessError(
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
        throw new CheckoutBusinessError(
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

              idempotencyKey:
                options.idempotencyKey,

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

              creationEmailStatus:
                options.sendCreationEmails
                  ? "pending"
                  : "skipped",
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
    const emailResult = await sendManualOrderEmails({
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

    await prisma.order.update({
      where: {
        id: order.id,
      },

      data: {
        creationEmailStatus:
          emailResult.customerEmailSent
            ? "sent"
            : "failed",
      },
    });

    const hasEmailFailure =
      !emailResult.customerEmailSent ||
      !emailResult.sellerEmailSent;

    if (hasEmailFailure) {
      console.error(
        "ORDER_CREATION_EMAIL_ERROR",
        {
          orderId:
            order.id,

          publicId:
            order.publicId,

          customerEmailSent:
            emailResult.customerEmailSent,

          sellerEmailSent:
            emailResult.sellerEmailSent,

          customerEmailError:
            emailResult.customerEmailError,

          sellerEmailError:
            emailResult.sellerEmailError,
        }
      );

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

            customerEmailSent:
              emailResult.customerEmailSent,

            sellerEmailSent:
              emailResult.sellerEmailSent,

            customerEmailError:
              emailResult.customerEmailError,

            sellerEmailError:
              emailResult.sellerEmailError,
          },
        },
      });
    }

  } catch (error) {
    console.error(
      "ORDER_CREATION_EMAIL_ERROR",
      error
    );

    /**
     * Se houve uma falha inesperada no mecanismo
     * de envio, consideramos que não conseguimos
     * confirmar o envio ao cliente.
     */
    await prisma.order.update({
      where: {
        id: order.id,
      },

      data: {
        creationEmailStatus:
          "failed",
      },
    });

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
  data: PublicCheckoutInput
) {
  const idempotencyKey =
    `site:${data.idempotencyKey}`;

  /**
   * Primeira proteção.
   *
   * Se esse checkout já criou um pedido,
   * simplesmente devolvemos o pedido existente.
   *
   * Isso cobre:
   * - refresh da página;
   * - retry após timeout;
   * - segundo clique/requisição posterior;
   * - perda da resposta HTTP.
   */
  const existingOrder =
    await prisma.order.findUnique({
      where: {
        idempotencyKey,
      },

      select: {
        id: true,
        publicId: true,
      },
    });

  if (existingOrder) {
    return existingOrder;
  }

  try {
    return await createOrder(data, {
      sourceChannel: "site",
      historySource: "system",
      creationReason:
        "Pedido criado pelo cliente. Aguardando revisão e definição do frete.",
      checkStoreAvailability: true,
      sendCreationEmails: true,
      idempotencyKey,
    });
  } catch (error) {
    /**
     * Segunda proteção.
     *
     * Duas requisições podem chegar praticamente
     * ao mesmo tempo e ambas passarem pelo
     * findUnique acima antes de qualquer uma
     * terminar a criação.
     *
     * O UNIQUE do PostgreSQL permitirá que
     * somente uma delas crie o pedido.
     *
     * Depois de qualquer erro durante essa
     * tentativa, verificamos se a outra requisição
     * conseguiu criar o pedido.
     */
    const orderCreatedByConcurrentRequest =
      await prisma.order.findUnique({
        where: {
          idempotencyKey,
        },

        select: {
          id: true,
          publicId: true,
        },
      });

    if (orderCreatedByConcurrentRequest) {
      return orderCreatedByConcurrentRequest;
    }

    throw error;
  }
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

    idempotencyKey:
      `admin:${randomUUID()}`,
  });
}
