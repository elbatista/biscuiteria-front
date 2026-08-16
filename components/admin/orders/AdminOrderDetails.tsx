import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardCopy,
  ExternalLink,
  Mail,
  MailCheck,
  MailX,
  MapPin,
  MessageCircle,
  Package,
  ReceiptText,
  Truck,
  UserRound,
} from "lucide-react";

import AdminOrderActions from "@/components/admin/orders/AdminOrderActions";
import AdminOrderSellerNotes from "@/components/admin/orders/AdminOrderSellerNotes";
import AdminOrderUtilityActions from "@/components/admin/orders/AdminOrderUtilityActions";

import {
  getOrderStatusMeta,
} from "@/lib/admin/orders/order-status";

import {
  buildWhatsAppUrl,
  formatAdminDocument,
  formatAdminOrderDate,
  formatAdminOrderDateLong,
  formatAdminPhone,
  formatAdminZipCode,
  formatOrderCurrency,
} from "@/lib/admin/orders/order-format";

import type { AdminOrderDetails as AdminOrderDetailsType } from "@/lib/admin/orders/get-admin-order";

type AdminOrderDetailsProps = {
  order: AdminOrderDetailsType;
};

type HistoryMetadata = {
  event?: string;

  intent?: string;

  adminEmail?: string | null;

  notification?: {
    requested?: boolean;
    sent?: boolean;
    error?: string;
  };
};

type HistoryPresentation = {
  label: string;
  description: string | null;
  icon:
    | "status"
    | "shipping"
    | "payment"
    | "production"
    | "shipping_sent"
    | "tracking"
    | "notes"
    | "cancel";
};

function isValidHex(
  value: string | null
) {
  return Boolean(
    value &&
      /^#[0-9A-Fa-f]{6}$/.test(
        value
      )
  );
}

function isPlainObject(
  value: unknown
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function getHistoryMetadata(
  value: unknown
): HistoryMetadata {
  if (!isPlainObject(value)) {
    return {};
  }

  const result:
    HistoryMetadata = {};

  if (
    typeof value.event ===
    "string"
  ) {
    result.event =
      value.event;
  }

  if (
    typeof value.intent ===
    "string"
  ) {
    result.intent =
      value.intent;
  }

  if (
    typeof value.adminEmail ===
      "string" ||
    value.adminEmail === null
  ) {
    result.adminEmail =
      value.adminEmail;
  }

  if (
    isPlainObject(
      value.notification
    )
  ) {
    result.notification = {
      requested:
        typeof value
          .notification
          .requested ===
        "boolean"
          ? value
              .notification
              .requested
          : undefined,

      sent:
        typeof value
          .notification
          .sent ===
        "boolean"
          ? value
              .notification
              .sent
          : undefined,

      error:
        typeof value
          .notification
          .error ===
        "string"
          ? value
              .notification
              .error
          : undefined,
    };
  }

  return result;
}

function getHistoryPresentation({
  toStatus,
  metadata,
}: {
  toStatus: string;
  metadata: HistoryMetadata;
}): HistoryPresentation {
  switch (
    metadata.event
  ) {
    case "order_created":
      return {
        label:
          "Pedido criado",

        description:
          "Pedido recebido pelo site.",

        icon:
          "status",
      };

    case "shipping_updated":
      return {
        label:
          "Frete atualizado",

        description:
          "O valor final e a forma de envio foram definidos.",

        icon:
          "shipping",
      };

    case "payment_confirmed":
      return {
        label:
          "Pagamento confirmado",

        description:
          "O pagamento foi marcado como recebido.",

        icon:
          "payment",
      };

    case "production_started":
      return {
        label:
          "Produção iniciada",

        description:
          "O pedido entrou na etapa de produção.",

        icon:
          "production",
      };

    case "order_shipped":
      return {
        label:
          "Pedido enviado",

        description:
          "O pedido foi marcado como enviado.",

        icon:
          "shipping_sent",
      };

    case "tracking_updated":
      return {
        label:
          "Rastreamento atualizado",

        description:
          "As informações de rastreamento foram alteradas.",

        icon:
          "tracking",
      };

    case "seller_notes_updated":
      return {
        label:
          "Notas internas atualizadas",

        description:
          "As notas administrativas deste pedido foram alteradas.",

        icon:
          "notes",
      };

    case "order_canceled":
      return {
        label:
          "Pedido cancelado",

        description:
          "O fluxo operacional do pedido foi interrompido.",

        icon:
          "cancel",
      };

    case "order_created_email_failed":
      return {
        label:
          "Falha na notificação inicial",

        description:
          "O pedido foi criado, mas houve erro no envio do e-mail automático.",

        icon:
          "status",
      };

    default:
      return {
        label:
          getOrderStatusMeta(
            toStatus
          ).label,

        description:
          null,

        icon:
          "status",
      };
  }
}

function HistoryEventIcon({
  type,
}: {
  type:
    HistoryPresentation["icon"];
}) {
  switch (type) {
    case "shipping":
      return (
        <Truck className="h-4 w-4" />
      );

    case "payment":
      return (
        <CheckCircle2 className="h-4 w-4" />
      );

    case "production":
      return (
        <Package className="h-4 w-4" />
      );

    case "shipping_sent":
      return (
        <Truck className="h-4 w-4" />
      );

    case "tracking":
      return (
        <MapPin className="h-4 w-4" />
      );

    case "notes":
      return (
        <ReceiptText className="h-4 w-4" />
      );

    case "cancel":
      return (
        <AlertTriangle className="h-4 w-4" />
      );

    default:
      return (
        <CheckCircle2 className="h-4 w-4" />
      );
  }
}

function NotificationStatus({
  metadata,
}: {
  metadata: HistoryMetadata;
}) {
  const notification =
    metadata.notification;

  /**
   * Eventos antigos ou puramente internos
   * podem não possuir informação de notificação.
   */
  if (!notification) {
    return null;
  }

  if (
    notification.requested ===
    false
  ) {
    return (
      <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600">
        <MailX className="h-3.5 w-3.5" />

        Cliente não notificado
      </div>
    );
  }

  if (
    notification.requested ===
      true &&
    notification.sent ===
      true
  ) {
    return (
      <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
        <MailCheck className="h-3.5 w-3.5" />

        Cliente notificado por e-mail
      </div>
    );
  }

  if (
    notification.requested ===
      true &&
    notification.sent ===
      false
  ) {
    return (
      <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />

          Falha ao enviar e-mail
        </div>

        {notification.error ? (
          <p className="mt-1 break-words text-xs leading-relaxed text-amber-700">
            {
              notification.error
            }
          </p>
        ) : null}
      </div>
    );
  }

  return null;
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--rose-50)] text-[var(--green-500)] ring-1 ring-[var(--rose-100)]">
          {icon}
        </div>

        <h2 className="text-base font-semibold text-zinc-900">
          {title}
        </h2>
      </div>

      <div className="mt-5">
        {children}
      </div>
    </section>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-zinc-100 py-3 last:border-b-0">
      <dt className="text-sm text-zinc-500">
        {label}
      </dt>

      <dd className="max-w-[65%] text-right text-sm font-medium text-zinc-900">
        {value}
      </dd>
    </div>
  );
}

function getShippingLabel(
  order: AdminOrderDetailsType
) {
  if (
    order.status ===
    "created"
  ) {
    return "A definir";
  }

  if (
    order.shippingInCents ===
    0
  ) {
    return "Grátis";
  }

  return formatOrderCurrency(
    order.shippingInCents
  );
}

export default function AdminOrderDetails({
  order,
}: AdminOrderDetailsProps) {
  const address =
    order.shippingAddress;

  const statusMeta =
    getOrderStatusMeta(
      order.status
    );

  const publicOrderUrl =
    `/pedido/${order.publicId}`;

  const whatsappUrl =
    buildWhatsAppUrl({
      phone:
        order.customerPhone,

      customerName:
        order.customerName,

      publicId:
        order.publicId,
    });

  const reversedHistory =
    [...order.statusHistory]
      .reverse();

  return (
    <div className="space-y-6">
      {/* VOLTAR */}
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 transition hover:text-zinc-900"
      >
        <ArrowLeft className="h-4 w-4" />

        Voltar para pedidos
      </Link>

      {/* CABEÇALHO */}
      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <span
              className={[
                "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
                statusMeta.badgeClassName,
              ].join(" ")}
            >
              {
                statusMeta.label
              }
            </span>

            <h1 className="mt-4 break-all text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
              {
                order.publicId
              }
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              {
                order.customerName
              }{" "}
              ·{" "}
              {formatAdminOrderDateLong(
                order.createdAt
              )}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {whatsappUrl ? (
                <Link
                  href={
                    whatsappUrl
                  }
                  target="_blank"
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--green-300)]"
                >
                  <MessageCircle className="h-4 w-4" />

                  WhatsApp
                </Link>
              ) : null}

              <a
                href={`mailto:${order.customerEmail}`}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
              >
                <Mail className="h-4 w-4" />

                E-mail
              </a>

              <Link
                href={
                  publicOrderUrl
                }
                target="_blank"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
              >
                <ExternalLink className="h-4 w-4" />

                Página pública
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 xl:min-w-[430px]">
            <div className="rounded-2xl bg-zinc-50 p-3 sm:p-4">
              <p className="text-xs font-medium text-zinc-500">
                Itens
              </p>

              <p className="mt-1 text-lg font-bold text-zinc-900 sm:text-xl">
                {
                  order.itemsCount
                }
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-50 p-3 sm:p-4">
              <p className="text-xs font-medium text-zinc-500">
                Frete
              </p>

              <p className="mt-1 text-sm font-bold text-zinc-900 sm:text-base">
                {getShippingLabel(
                  order
                )}
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-50 p-3 sm:p-4">
              <p className="text-xs font-medium text-zinc-500">
                Total
              </p>

              <p className="mt-1 text-sm font-bold text-zinc-900 sm:text-base">
                {formatOrderCurrency(
                  order.totalInCents
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AÇÃO PRINCIPAL */}
      <AdminOrderActions
        order={order}
      />

      {/* DADOS DO PEDIDO */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* ITENS */}
        <InfoCard
          icon={
            <Package className="h-5 w-5" />
          }
          title="Itens"
        >
          <div className="space-y-3">
            {order.items.map(
              (item) => (
                <div
                  key={
                    item.id
                  }
                  className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
                >
                  <div className="flex items-start justify-between gap-5">
                    <div className="min-w-0">
                      {item.productSlugSnapshot ? (
                        <Link
                          href={`/produtos/${item.productSlugSnapshot}`}
                          target="_blank"
                          className="font-semibold text-zinc-900 transition hover:text-[var(--green-500)]"
                        >
                          {
                            item.productNameSnapshot
                          }
                        </Link>
                      ) : (
                        <p className="font-semibold text-zinc-900">
                          {
                            item.productNameSnapshot
                          }
                        </p>
                      )}

                      {item.skuSnapshot ? (
                        <p className="mt-1 text-xs text-zinc-400">
                          SKU:{" "}
                          {
                            item.skuSnapshot
                          }
                        </p>
                      ) : null}

                      {item.selectedColorNameSnapshot ? (
                        <div className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-zinc-600">
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-zinc-300"
                            style={{
                              backgroundColor:
                                isValidHex(
                                  item.selectedColorHexSnapshot
                                )
                                  ? item.selectedColorHexSnapshot ??
                                    "#E4E4E7"
                                  : "#E4E4E7",
                            }}
                          />

                          {
                            item.selectedColorNameSnapshot
                          }
                        </div>
                      ) : null}
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-xs text-zinc-500">
                        {
                          item.quantity
                        }
                        x
                      </p>

                      <p className="mt-1 font-semibold text-zinc-900">
                        {formatOrderCurrency(
                          item.lineTotalInCents
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          <dl className="mt-4 rounded-2xl bg-zinc-50 px-4">
            <DetailRow
              label="Subtotal"
              value={formatOrderCurrency(
                order.subtotalInCents
              )}
            />

            <DetailRow
              label="Frete"
              value={getShippingLabel(
                order
              )}
            />

            <DetailRow
              label="Total"
              value={
                <strong>
                  {formatOrderCurrency(
                    order.totalInCents
                  )}
                </strong>
              }
            />
          </dl>
        </InfoCard>

        {/* CLIENTE */}
        <InfoCard
          icon={
            <UserRound className="h-5 w-5" />
          }
          title="Cliente"
        >
          <dl>
            <DetailRow
              label="Nome"
              value={
                order.customerName
              }
            />

            <DetailRow
              label="E-mail"
              value={
                <a
                  href={`mailto:${order.customerEmail}`}
                  className="break-all hover:underline"
                >
                  {
                    order.customerEmail
                  }
                </a>
              }
            />

            <DetailRow
              label="Telefone"
              value={formatAdminPhone(
                order.customerPhone
              )}
            />

            {order.customerDocument ? (
              <DetailRow
                label="Documento"
                value={formatAdminDocument(
                  order.customerDocument
                )}
              />
            ) : null}
          </dl>

          {order.customerNotes ? (
            <div className="mt-4 rounded-2xl bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                Observação do cliente
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-amber-900">
                {
                  order.customerNotes
                }
              </p>
            </div>
          ) : null}
        </InfoCard>

        {/* ENTREGA */}
        <InfoCard
          icon={
            <MapPin className="h-5 w-5" />
          }
          title="Entrega"
        >
          {address ? (
            <>
              <div className="text-sm leading-relaxed text-zinc-700">
                <p className="font-semibold text-zinc-900">
                  {
                    address.recipientName
                  }
                </p>

                <p className="mt-2">
                  {address.street},{" "}
                  {address.number}
                  {address.complement
                    ? ` · ${address.complement}`
                    : ""}
                </p>

                <p>
                  {
                    address.neighborhood
                  }
                </p>

                <p>
                  {address.city} -{" "}
                  {
                    address.state
                  }
                </p>

                <p>
                  CEP{" "}
                  {formatAdminZipCode(
                    address.zipCode
                  )}
                </p>
              </div>

              <dl className="mt-4 rounded-2xl bg-zinc-50 px-4">
                <DetailRow
                  label="Forma de envio"
                  value={
                    order.status ===
                    "created"
                      ? "A definir"
                      : order.shippingServiceName ||
                        "-"
                  }
                />

                <DetailRow
                  label="Valor"
                  value={getShippingLabel(
                    order
                  )}
                />

              </dl>
            </>
          ) : (
            <p className="text-sm text-zinc-500">
              Endereço não informado.
            </p>
          )}

          {order.trackingCode ||
          order.trackingUrl ? (
            <div className="mt-4 rounded-2xl border border-zinc-200 p-4">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-zinc-500" />

                <p className="text-sm font-semibold text-zinc-900">
                  Rastreamento
                </p>
              </div>

              {order.trackingCode ? (
                <p className="mt-3 break-all text-sm text-zinc-600">
                  Código:{" "}
                  <strong className="text-zinc-900">
                    {
                      order.trackingCode
                    }
                  </strong>
                </p>
              ) : null}

              {order.trackingUrl ? (
                <Link
                  href={
                    order.trackingUrl
                  }
                  target="_blank"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[var(--green-500)] hover:underline"
                >
                  Abrir rastreamento

                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              ) : null}
            </div>
          ) : null}
        </InfoCard>

        {/* RESUMO */}
        <InfoCard
          icon={
            <ReceiptText className="h-5 w-5" />
          }
          title="Resumo do pedido"
        >
          <dl>
            <DetailRow
              label="Pedido"
              value={
                order.publicId
              }
            />

            <DetailRow
              label="Criado em"
              value={formatAdminOrderDate(
                order.createdAt
              )}
            />

            {order.paidAt ? (
              <DetailRow
                label="Pagamento confirmado"
                value={formatAdminOrderDate(
                  order.paidAt
                )}
              />
            ) : null}

            {order.shippedAt ? (
              <DetailRow
                label="Enviado em"
                value={formatAdminOrderDate(
                  order.shippedAt
                )}
              />
            ) : null}

            {order.cancelledAt ? (
              <DetailRow
                label="Cancelado em"
                value={formatAdminOrderDate(
                  order.cancelledAt
                )}
              />
            ) : null}

            <DetailRow
              label="Origem"
              value={
                order.sourceChannel ||
                "site"
              }
            />
          </dl>
        </InfoCard>
      </div>

      {/* MAIS INFORMAÇÕES */}
      <section className="space-y-3">
        <p className="px-1 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
          Mais informações
        </p>

        {/* NOTAS INTERNAS */}
        <details className="group rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 sm:px-6">
            <div>
              <p className="font-semibold text-zinc-900">
                Notas internas
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                Informações visíveis somente no admin.
              </p>
            </div>

            <span className="text-sm text-zinc-400">
              Abrir
            </span>
          </summary>

          <div className="border-t border-zinc-100 px-5 py-5 sm:px-6">
            <AdminOrderSellerNotes
              order={order}
            />
          </div>
        </details>

        {/* HISTÓRICO */}
        <details
          open
          className="group rounded-3xl border border-zinc-200 bg-white shadow-sm"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 sm:px-6">
            <div>
              <p className="font-semibold text-zinc-900">
                Histórico do pedido
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                {
                  order.statusHistory
                    .length
                }{" "}
                {order.statusHistory
                  .length === 1
                  ? "registro"
                  : "registros"}
              </p>
            </div>

            <span className="text-sm text-zinc-400">
              Abrir
            </span>
          </summary>

          <div className="border-t border-zinc-100 px-5 py-5 sm:px-6">
            {reversedHistory.length >
            0 ? (
              <div>
                {reversedHistory.map(
                  (
                    history,
                    index
                  ) => {
                    const metadata =
                      getHistoryMetadata(
                        history.metadataJson
                      );

                    const presentation =
                      getHistoryPresentation(
                        {
                          toStatus:
                            history.toStatus,

                          metadata,
                        }
                      );

                    const isLast =
                      index ===
                      reversedHistory.length -
                        1;

                    return (
                      <div
                        key={
                          history.id
                        }
                        className="relative flex gap-4"
                      >
                        {!isLast ? (
                          <div className="absolute bottom-0 left-[17px] top-9 w-px bg-zinc-200" />
                        ) : null}

                        <div
                          className={[
                            "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-white",

                            presentation.icon ===
                            "cancel"
                              ? "border-red-200 text-red-600"
                              : "border-zinc-200 text-[var(--green-500)]",
                          ].join(
                            " "
                          )}
                        >
                          <HistoryEventIcon
                            type={
                              presentation.icon
                            }
                          />
                        </div>

                        <div
                          className={[
                            "min-w-0 flex-1",

                            !isLast
                              ? "pb-7"
                              : "",
                          ].join(
                            " "
                          )}
                        >
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                            <p className="text-sm font-semibold text-zinc-900">
                              {
                                presentation.label
                              }
                            </p>

                            <span className="shrink-0 text-xs text-zinc-400">
                              {formatAdminOrderDate(
                                history.createdAt
                              )}
                            </span>
                          </div>

                          {presentation.description ? (
                            <p className="mt-1 text-sm leading-relaxed text-zinc-500">
                              {
                                presentation.description
                              }
                            </p>
                          ) : null}

                          {history.reason &&
                          history.reason !==
                            presentation.description ? (
                            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                              {
                                history.reason
                              }
                            </p>
                          ) : null}

                          <NotificationStatus
                            metadata={
                              metadata
                            }
                          />

                          {metadata.adminEmail ? (
                            <p className="mt-2 text-xs text-zinc-400">
                              Ação realizada por{" "}
                              {
                                metadata.adminEmail
                              }
                            </p>
                          ) : history.source ===
                            "system" ? (
                            <p className="mt-2 text-xs text-zinc-400">
                              Ação automática do sistema
                            </p>
                          ) : null}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">
                Nenhum histórico registrado.
              </p>
            )}
          </div>
        </details>

        {/* UTILIDADES */}
        <details className="group rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <ClipboardCopy className="h-5 w-5 text-zinc-400" />

              <div>
                <p className="font-semibold text-zinc-900">
                  Compartilhar e copiar
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  Resumo e link público do pedido.
                </p>
              </div>
            </div>

            <span className="text-sm text-zinc-400">
              Abrir
            </span>
          </summary>

          <div className="border-t border-zinc-100 p-5 sm:p-6">
            <AdminOrderUtilityActions
              order={order}
            />
          </div>
        </details>
      </section>
    </div>
  );
}