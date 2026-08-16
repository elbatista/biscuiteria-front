import {
  NextRequest,
  NextResponse,
} from "next/server";
import { z } from "zod";

import {
  canCancelOrder,
} from "@/lib/admin/orders/order-status";
import { getCurrentAdminUser } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/prisma";
import {
  sendOrderWorkflowEmail,
  type OrderWorkflowEmailEvent,
} from "@/lib/server/order-workflow-emails";

const reasonSchema = z
  .string()
  .trim()
  .max(500)
  .optional();

const notifyCustomerSchema =
  z.boolean().default(false);

const updateOrderSchema =
  z.discriminatedUnion(
    "intent",
    [
      z.object({
        intent: z.literal(
          "update_shipping"
        ),

        shippingInCents: z
          .number()
          .int()
          .min(0),

        shippingServiceName: z
          .string()
          .trim()
          .max(120)
          .optional(),

        reason:
          reasonSchema,

        notifyCustomer:
          notifyCustomerSchema,
      }),

      z.object({
        intent: z.literal(
          "confirm_payment"
        ),

        reason:
          reasonSchema,

        notifyCustomer:
          notifyCustomerSchema,
      }),

      z.object({
        intent: z.literal(
          "start_production"
        ),

        reason:
          reasonSchema,

        notifyCustomer:
          notifyCustomerSchema,
      }),

      z.object({
        intent: z.literal(
          "mark_shipped"
        ),

        trackingCode: z
          .string()
          .trim()
          .max(120)
          .optional()
          .or(z.literal("")),

        trackingUrl: z
          .string()
          .trim()
          .url(
            "Informe uma URL de rastreamento válida."
          )
          .max(500)
          .optional()
          .or(z.literal("")),

        reason:
          reasonSchema,

        notifyCustomer:
          notifyCustomerSchema,
      }),

      z.object({
        intent: z.literal(
          "update_tracking"
        ),

        trackingCode: z
          .string()
          .trim()
          .max(120)
          .optional()
          .or(z.literal("")),

        trackingUrl: z
          .string()
          .trim()
          .url(
            "Informe uma URL de rastreamento válida."
          )
          .max(500)
          .optional()
          .or(z.literal("")),

        reason:
          reasonSchema,

        notifyCustomer:
          notifyCustomerSchema,
      }),

      z.object({
        intent:
          z.literal("cancel"),

        reason: z
          .string()
          .trim()
          .max(500)
          .optional(),

        notifyCustomer:
          notifyCustomerSchema,
      }),

      z.object({
        intent: z.literal(
          "update_notes"
        ),

        sellerNotes: z
          .string()
          .trim()
          .max(5000)
          .optional()
          .or(z.literal("")),
      }),
    ]
  );

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

class OrderWorkflowError extends Error {
  statusCode: number;

  constructor(
    message: string,
    statusCode = 409
  ) {
    super(message);

    this.name =
      "OrderWorkflowError";

    this.statusCode =
      statusCode;
  }
}

function getAdminEmail(
  adminUser: Awaited<
    ReturnType<
      typeof getCurrentAdminUser
    >
  >
) {
  if (!adminUser) {
    return null;
  }

  if (
    "email" in adminUser &&
    typeof adminUser.email ===
      "string"
  ) {
    return adminUser.email;
  }

  return null;
}

function getChangedReason(
  defaultReason: string,
  customReason?: string
) {
  return (
    customReason?.trim() ||
    defaultReason
  );
}

function normalizeOptionalText(
  value?: string
) {
  return (
    value?.trim() || null
  );
}

/**
 * updateMany é usado para fazer a alteração
 * condicionada ao estado atual do pedido.
 *
 * Se nenhuma linha for alterada, significa que
 * outra requisição modificou o pedido antes.
 */
function assertAtomicUpdate(
  result: {
    count: number;
  }
) {
  if (
    result.count !== 1
  ) {
    throw new OrderWorkflowError(
      "Este pedido foi alterado por outra ação enquanto você estava atualizando. Atualize a página e tente novamente."
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  const adminUser =
    await getCurrentAdminUser();

  if (!adminUser) {
    return NextResponse.json(
      {
        error:
          "Não autorizado.",
      },
      {
        status: 401,
      }
    );
  }

  const { id } =
    await context.params;

  const orderId =
    Number(id);

  if (
    !Number.isInteger(
      orderId
    ) ||
    orderId <= 0
  ) {
    return NextResponse.json(
      {
        error:
          "Pedido inválido.",
      },
      {
        status: 400,
      }
    );
  }

  let payload: z.infer<
    typeof updateOrderSchema
  >;

  try {
    const body =
      await request.json();

    payload =
      updateOrderSchema.parse(
        body
      );
  } catch (error) {
    if (
      error instanceof
      z.ZodError
    ) {
      return NextResponse.json(
        {
          error:
            error.issues[0]
              ?.message ||
            "Dados inválidos.",
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        error:
          "Dados inválidos.",
      },
      {
        status: 400,
      }
    );
  }

  const adminEmail =
    getAdminEmail(
      adminUser
    );

  try {
    const transactionResult =
      await prisma.$transaction(
        async (tx) => {
          const order =
            await tx.order.findUnique(
              {
                where: {
                  id:
                    orderId,
                },

                select: {
                  id:
                    true,

                  publicId:
                    true,

                  status:
                    true,

                  paymentStatus:
                    true,

                  subtotalInCents:
                    true,

                  shippingInCents:
                    true,

                  totalInCents:
                    true,

                  shippingServiceName:
                    true,

                  trackingCode:
                    true,

                  trackingUrl:
                    true,

                  sellerNotes:
                    true,

                  paidAt:
                    true,

                  shippedAt:
                    true,

                  cancelledAt:
                    true,
                },
              }
            );

          if (!order) {
            throw new OrderWorkflowError(
              "Pedido não encontrado.",
              404
            );
          }

          const now =
            new Date();

          /**
           * ============================================================
           * DEFINIR FRETE
           *
           * created -> pending_payment
           * ============================================================
           */
          if (
            payload.intent ===
            "update_shipping"
          ) {
            if (
              order.status !==
              "created"
            ) {
              throw new OrderWorkflowError(
                "O frete só pode ser definido enquanto o pedido está na etapa 'Pedido criado'."
              );
            }

            const shippingServiceName =
              payload.shippingServiceName?.trim() ||
              (payload.shippingInCents >
              0
                ? "Frete combinado"
                : "Sem custo de frete");

            const nextTotalInCents =
              order.subtotalInCents +
              payload.shippingInCents;

            /**
             * Proteção atômica:
             *
             * só uma requisição conseguirá encontrar
             * este pedido ainda em "created".
             */
            const updateResult =
              await tx.order.updateMany(
                {
                  where: {
                    id:
                      order.id,

                    status:
                      "created",
                  },

                  data: {
                    shippingInCents:
                      payload.shippingInCents,

                    totalInCents:
                      nextTotalInCents,

                    shippingServiceName,

                    status:
                      "pending_payment",
                  },
                }
              );

            assertAtomicUpdate(
              updateResult
            );

            const metadataJson = {
              event:
                "shipping_updated",

              intent:
                "update_shipping",

              adminEmail,

              previousShippingInCents:
                order.shippingInCents,

              nextShippingInCents:
                payload.shippingInCents,

              previousTotalInCents:
                order.totalInCents,

              nextTotalInCents,

              previousShippingServiceName:
                order.shippingServiceName,

              nextShippingServiceName:
                shippingServiceName,

              notification: {
                requested:
                  payload.notifyCustomer,

                sent:
                  false,
              },
            };

            const history =
              await tx.orderStatusHistory.create(
                {
                  data: {
                    orderId:
                      order.id,

                    fromStatus:
                      "created",

                    toStatus:
                      "pending_payment",

                    reason:
                      getChangedReason(
                        "Frete definido. Pedido aguardando pagamento.",
                        payload.reason
                      ),

                    source:
                      "admin",

                    metadataJson,
                  },

                  select: {
                    id:
                      true,
                  },
                }
              );

            return {
              historyId:
                history.id,

              notifyCustomer:
                payload.notifyCustomer,

              emailEvent:
                "shipping_updated" as const,

              metadataJson,
            };
          }

          /**
           * ============================================================
           * CONFIRMAR PAGAMENTO
           *
           * pending_payment -> confirmed
           * ============================================================
           */
          if (
            payload.intent ===
            "confirm_payment"
          ) {
            if (
              order.status !==
              "pending_payment"
            ) {
              throw new OrderWorkflowError(
                "O pagamento só pode ser confirmado quando o pedido está aguardando pagamento."
              );
            }

            const nextPaidAt =
              order.paidAt ??
              now;

            /**
             * Só confirma se o status ainda for pending_payment.
             *
             * Se outra chamada já tiver confirmado,
             * count será 0.
             */
            const updateResult =
              await tx.order.updateMany(
                {
                  where: {
                    id:
                      order.id,

                    status:
                      "pending_payment",
                  },

                  data: {
                    status:
                      "confirmed",

                    paymentStatus:
                      "approved",

                    paidAt:
                      nextPaidAt,
                  },
                }
              );

            assertAtomicUpdate(
              updateResult
            );

            const metadataJson = {
              event:
                "payment_confirmed",

              intent:
                "confirm_payment",

              adminEmail,

              previousPaymentStatus:
                order.paymentStatus,

              nextPaymentStatus:
                "approved",

              notification: {
                requested:
                  payload.notifyCustomer,

                sent:
                  false,
              },
            };

            const history =
              await tx.orderStatusHistory.create(
                {
                  data: {
                    orderId:
                      order.id,

                    fromStatus:
                      "pending_payment",

                    toStatus:
                      "confirmed",

                    reason:
                      getChangedReason(
                        "Pagamento confirmado pela administração.",
                        payload.reason
                      ),

                    source:
                      "admin",

                    metadataJson,
                  },

                  select: {
                    id:
                      true,
                  },
                }
              );

            return {
              historyId:
                history.id,

              notifyCustomer:
                payload.notifyCustomer,

              emailEvent:
                "payment_confirmed" as const,

              metadataJson,
            };
          }

          /**
           * ============================================================
           * INICIAR PRODUÇÃO
           *
           * confirmed -> processing
           * ============================================================
           */
          if (
            payload.intent ===
            "start_production"
          ) {
            if (
              order.status !==
              "confirmed"
            ) {
              throw new OrderWorkflowError(
                "A produção só pode ser iniciada depois que o pagamento estiver confirmado."
              );
            }

            const updateResult =
              await tx.order.updateMany(
                {
                  where: {
                    id:
                      order.id,

                    status:
                      "confirmed",
                  },

                  data: {
                    status:
                      "processing",
                  },
                }
              );

            assertAtomicUpdate(
              updateResult
            );

            const metadataJson = {
              event:
                "production_started",

              intent:
                "start_production",

              adminEmail,

              notification: {
                requested:
                  payload.notifyCustomer,

                sent:
                  false,
              },
            };

            const history =
              await tx.orderStatusHistory.create(
                {
                  data: {
                    orderId:
                      order.id,

                    fromStatus:
                      "confirmed",

                    toStatus:
                      "processing",

                    reason:
                      getChangedReason(
                        "Pedido colocado em produção.",
                        payload.reason
                      ),

                    source:
                      "admin",

                    metadataJson,
                  },

                  select: {
                    id:
                      true,
                  },
                }
              );

            return {
              historyId:
                history.id,

              notifyCustomer:
                payload.notifyCustomer,

              emailEvent:
                "production_started" as const,

              metadataJson,
            };
          }

          /**
           * ============================================================
           * MARCAR COMO ENVIADO
           *
           * processing -> shipped
           * ============================================================
           */
          if (
            payload.intent ===
            "mark_shipped"
          ) {
            if (
              order.status !==
              "processing"
            ) {
              throw new OrderWorkflowError(
                "O pedido só pode ser marcado como enviado enquanto está em produção."
              );
            }

            const trackingCode =
              normalizeOptionalText(
                payload.trackingCode
              );

            const trackingUrl =
              normalizeOptionalText(
                payload.trackingUrl
              );

            const nextShippedAt =
              order.shippedAt ??
              now;

            const updateResult =
              await tx.order.updateMany(
                {
                  where: {
                    id:
                      order.id,

                    status:
                      "processing",
                  },

                  data: {
                    status:
                      "shipped",

                    trackingCode,
                    trackingUrl,

                    shippedAt:
                      nextShippedAt,
                  },
                }
              );

            assertAtomicUpdate(
              updateResult
            );

            const metadataJson = {
              event:
                "order_shipped",

              intent:
                "mark_shipped",

              adminEmail,

              trackingCode,
              trackingUrl,

              notification: {
                requested:
                  payload.notifyCustomer,

                sent:
                  false,
              },
            };

            const history =
              await tx.orderStatusHistory.create(
                {
                  data: {
                    orderId:
                      order.id,

                    fromStatus:
                      "processing",

                    toStatus:
                      "shipped",

                    reason:
                      getChangedReason(
                        "Pedido marcado como enviado.",
                        payload.reason
                      ),

                    source:
                      "admin",

                    metadataJson,
                  },

                  select: {
                    id:
                      true,
                  },
                }
              );

            return {
              historyId:
                history.id,

              notifyCustomer:
                payload.notifyCustomer,

              emailEvent:
                "order_shipped" as const,

              metadataJson,
            };
          }

          /**
           * ============================================================
           * ATUALIZAR RASTREAMENTO
           *
           * shipped -> shipped
           * ============================================================
           */
          if (
            payload.intent ===
            "update_tracking"
          ) {
            if (
              order.status !==
              "shipped"
            ) {
              throw new OrderWorkflowError(
                "O rastreamento só pode ser alterado depois que o pedido foi enviado."
              );
            }

            const trackingCode =
              normalizeOptionalText(
                payload.trackingCode
              );

            const trackingUrl =
              normalizeOptionalText(
                payload.trackingUrl
              );

            const trackingChanged =
              trackingCode !==
                order.trackingCode ||
              trackingUrl !==
                order.trackingUrl;

            if (
              !trackingChanged
            ) {
              throw new OrderWorkflowError(
                "Nenhuma informação de rastreamento foi alterada.",
                400
              );
            }

            /**
             * Como o status não muda,
             * protegemos comparando também os valores antigos.
             *
             * Se outra aba alterar o rastreamento antes,
             * esta atualização não encontra mais a mesma combinação.
             */
            const updateResult =
              await tx.order.updateMany(
                {
                  where: {
                    id:
                      order.id,

                    status:
                      "shipped",

                    trackingCode:
                      order.trackingCode,

                    trackingUrl:
                      order.trackingUrl,
                  },

                  data: {
                    trackingCode,
                    trackingUrl,
                  },
                }
              );

            assertAtomicUpdate(
              updateResult
            );

            const metadataJson = {
              event:
                "tracking_updated",

              intent:
                "update_tracking",

              adminEmail,

              previousTrackingCode:
                order.trackingCode,

              nextTrackingCode:
                trackingCode,

              previousTrackingUrl:
                order.trackingUrl,

              nextTrackingUrl:
                trackingUrl,

              notification: {
                requested:
                  payload.notifyCustomer,

                sent:
                  false,
              },
            };

            const history =
              await tx.orderStatusHistory.create(
                {
                  data: {
                    orderId:
                      order.id,

                    fromStatus:
                      "shipped",

                    toStatus:
                      "shipped",

                    reason:
                      getChangedReason(
                        "Informações de rastreamento atualizadas.",
                        payload.reason
                      ),

                    source:
                      "admin",

                    metadataJson,
                  },

                  select: {
                    id:
                      true,
                  },
                }
              );

            return {
              historyId:
                history.id,

              notifyCustomer:
                payload.notifyCustomer,

              emailEvent:
                "tracking_updated" as const,

              metadataJson,
            };
          }

          /**
           * ============================================================
           * CANCELAR PEDIDO
           * ============================================================
           */
          if (
            payload.intent ===
            "cancel"
          ) {
            if (
              !canCancelOrder(
                order.status
              )
            ) {
              throw new OrderWorkflowError(
                "Este pedido não pode mais ser cancelado."
              );
            }

            /**
             * Cancelamento do pedido não equivale
             * a reembolso.
             *
             * Se o pagamento ainda estava pendente,
             * mudamos para cancelled.
             *
             * Se já estava aprovado, permanece approved.
             */
            const nextPaymentStatus =
              order.paymentStatus ===
              "pending"
                ? "cancelled"
                : order.paymentStatus;

            const nextCancelledAt =
              order.cancelledAt ??
              now;

            /**
             * Proteção atômica pelo status que foi lido.
             */
            const updateResult =
              await tx.order.updateMany(
                {
                  where: {
                    id:
                      order.id,

                    status:
                      order.status,
                  },

                  data: {
                    status:
                      "canceled",

                    paymentStatus:
                      nextPaymentStatus,

                    cancelledAt:
                      nextCancelledAt,
                  },
                }
              );

            assertAtomicUpdate(
              updateResult
            );

            const metadataJson = {
              event:
                "order_canceled",

              intent:
                "cancel",

              adminEmail,

              previousStatus:
                order.status,

              previousPaymentStatus:
                order.paymentStatus,

              nextPaymentStatus,

              notification: {
                requested:
                  payload.notifyCustomer,

                sent:
                  false,
              },
            };

            const history =
              await tx.orderStatusHistory.create(
                {
                  data: {
                    orderId:
                      order.id,

                    fromStatus:
                      order.status,

                    toStatus:
                      "canceled",

                    reason:
                      getChangedReason(
                        "Pedido cancelado pela administração.",
                        payload.reason
                      ),

                    source:
                      "admin",

                    metadataJson,
                  },

                  select: {
                    id:
                      true,
                  },
                }
              );

            return {
              historyId:
                history.id,

              notifyCustomer:
                payload.notifyCustomer,

              emailEvent:
                "order_canceled" as const,

              metadataJson,
            };
          }

          /**
           * ============================================================
           * NOTAS INTERNAS
           * ============================================================
           */
          if (
            payload.intent ===
            "update_notes"
          ) {
            const sellerNotes =
              payload.sellerNotes?.trim() ||
              null;

            if (
              sellerNotes ===
              order.sellerNotes
            ) {
              throw new OrderWorkflowError(
                "Nenhuma alteração foi feita nas notas internas.",
                400
              );
            }

            /**
             * Como notas não mudam status,
             * usamos o valor antigo como proteção.
             */
            const updateResult =
              await tx.order.updateMany(
                {
                  where: {
                    id:
                      order.id,

                    sellerNotes:
                      order.sellerNotes,
                  },

                  data: {
                    sellerNotes,
                  },
                }
              );

            assertAtomicUpdate(
              updateResult
            );

            const metadataJson = {
              event:
                "seller_notes_updated",

              intent:
                "update_notes",

              adminEmail,
            };

            const history =
              await tx.orderStatusHistory.create(
                {
                  data: {
                    orderId:
                      order.id,

                    fromStatus:
                      order.status,

                    toStatus:
                      order.status,

                    reason:
                      "Notas internas atualizadas pela administração.",

                    source:
                      "admin",

                    metadataJson,
                  },

                  select: {
                    id:
                      true,
                  },
                }
              );

            return {
              historyId:
                history.id,

              notifyCustomer:
                false,

              emailEvent:
                null,

              metadataJson,
            };
          }

          throw new OrderWorkflowError(
            "Ação inválida.",
            400
          );
        }
      );

    /**
     * ============================================================
     * NOTIFICAÇÃO POR E-MAIL
     *
     * Só acontece depois que a transação foi concluída.
     * ============================================================
     */
    if (
      transactionResult.notifyCustomer &&
      transactionResult.emailEvent
    ) {
      const orderForEmail =
        await prisma.order.findUnique(
          {
            where: {
              id:
                orderId,
            },

            select: {
              publicId:
                true,

              customerName:
                true,

              customerEmail:
                true,

              subtotalInCents:
                true,

              shippingInCents:
                true,

              totalInCents:
                true,

              shippingServiceName:
                true,

              trackingCode:
                true,

              trackingUrl:
                true,

              status:
                true,
            },
          }
        );

      if (!orderForEmail) {
        return NextResponse.json({
          ok:
            true,

          notification: {
            requested:
              true,

            sent:
              false,

            error:
              "Pedido atualizado, mas não foi possível carregar os dados para enviar o e-mail.",
          },
        });
      }

      try {
        await sendOrderWorkflowEmail(
          {
            event:
              transactionResult.emailEvent as OrderWorkflowEmailEvent,

            order:
              orderForEmail,
          }
        );

        await prisma.orderStatusHistory.update(
          {
            where: {
              id:
                transactionResult.historyId,
            },

            data: {
              metadataJson: {
                ...transactionResult.metadataJson,

                notification: {
                  requested:
                    true,

                  sent:
                    true,
                },
              },
            },
          }
        );

        return NextResponse.json({
          ok:
            true,

          notification: {
            requested:
              true,

            sent:
              true,
          },
        });
      } catch (
        emailError
      ) {
        console.error(
          "ORDER_WORKFLOW_EMAIL_ERROR",
          emailError
        );

        const errorMessage =
          emailError instanceof
          Error
            ? emailError.message
            : "Não foi possível enviar o e-mail.";

        try {
          await prisma.orderStatusHistory.update(
            {
              where: {
                id:
                  transactionResult.historyId,
              },

              data: {
                metadataJson: {
                  ...transactionResult.metadataJson,

                  notification: {
                    requested:
                      true,

                    sent:
                      false,

                    error:
                      errorMessage,
                  },
                },
              },
            }
          );
        } catch (
          historyError
        ) {
          console.error(
            "ORDER_EMAIL_HISTORY_UPDATE_ERROR",
            historyError
          );
        }

        return NextResponse.json({
          ok:
            true,

          notification: {
            requested:
              true,

            sent:
              false,

            error:
              errorMessage,
          },
        });
      }
    }

    return NextResponse.json({
      ok:
        true,

      notification: {
        requested:
          false,

        sent:
          false,
      },
    });
  } catch (error) {
    console.error(
      "ADMIN_ORDER_UPDATE_ERROR",
      error
    );

    if (
      error instanceof
      OrderWorkflowError
    ) {
      return NextResponse.json(
        {
          error:
            error.message,
        },
        {
          status:
            error.statusCode,
        }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof
          Error
            ? error.message
            : "Não foi possível atualizar o pedido.",
      },
      {
        status: 500,
      }
    );
  }
}