"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  Ban,
  CheckCircle2,
  Loader2,
  Mail,
  PackageCheck,
  Save,
  Truck,
} from "lucide-react";

import {
  canCancelOrder,
  getOrderStatusMeta,
  getWorkflowStep,
} from "@/lib/admin/orders/order-status";
import {
  centsToAdminPriceInput,
  normalizeAdminPriceInputToCents,
  formatOrderCurrency,
} from "@/lib/admin/orders/order-format";
import type { AdminOrderDetails } from "@/lib/admin/orders/get-admin-order";

type AdminOrderActionsProps = {
  order: Pick<
    AdminOrderDetails,
    | "id"
    | "status"
    | "paymentStatus"
    | "subtotalInCents"
    | "shippingInCents"
    | "shippingServiceName"
    | "trackingCode"
    | "trackingUrl"
  >;
};

type SavingIntent =
  | "update_shipping"
  | "confirm_payment"
  | "start_production"
  | "mark_shipped"
  | "update_tracking"
  | "cancel"
  | null;

type UpdateOrderResponse = {
  ok?: boolean;

  error?: string;

  notification?: {
    requested: boolean;
    sent: boolean;
    error?: string;
  };
};

function normalizeShippingServiceName(
  value: string | null
) {
  if (
    !value ||
    value === "A combinar"
  ) {
    return "";
  }

  return value;
}

function NotificationOption({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;

  onChange: (
    checked: boolean
  ) => void;

  disabled?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) =>
          onChange(
            event.target.checked
          )
        }
        className="mt-0.5 h-4 w-4 rounded border-zinc-300 accent-[var(--green-500)]"
      />

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 shrink-0 text-[var(--green-500)]" />

          <span className="text-sm font-semibold text-zinc-900">
            Notificar cliente por e-mail
          </span>
        </div>

        <p className="mt-1 text-xs leading-relaxed text-zinc-500">
          Se desmarcado, a ação será executada normalmente sem enviar e-mail.
        </p>
      </div>
    </label>
  );
}

export default function AdminOrderActions({
  order,
}: AdminOrderActionsProps) {
  const router =
    useRouter();

  const [
    savingIntent,
    setSavingIntent,
  ] = useState<SavingIntent>(
    null
  );

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState<
    string | null
  >(null);

  const [
    notificationWarning,
    setNotificationWarning,
  ] = useState<
    string | null
  >(null);

  const [
    notifyCustomer,
    setNotifyCustomer,
  ] = useState(true);

  const [
    notifyOnCancel,
    setNotifyOnCancel,
  ] = useState(true);

  const [
    shippingValue,
    setShippingValue,
  ] = useState(
    centsToAdminPriceInput(
      order.shippingInCents
    )
  );

  const [
    shippingServiceName,
    setShippingServiceName,
  ] = useState(
    normalizeShippingServiceName(
      order.shippingServiceName
    )
  );

  const [
    trackingCode,
    setTrackingCode,
  ] = useState(
    order.trackingCode ?? ""
  );

  const [
    trackingUrl,
    setTrackingUrl,
  ] = useState(
    order.trackingUrl ?? ""
  );

  const statusMeta =
    getOrderStatusMeta(
      order.status
    );

  const workflowStep =
    getWorkflowStep(
      order.status
    );

  const isSaving =
    savingIntent !== null;

  /**
   * Fazemos o cálculo em tempo real do frete digitado.
   *
   * Se o valor ainda não for válido, consideramos 0 apenas
   * para a prévia visual.
   */
  const previewShippingInCents =
    useMemo(() => {
      return (
        normalizeAdminPriceInputToCents(
          shippingValue
        ) ?? 0
      );
    }, [shippingValue]);

  const previewTotalInCents =
    useMemo(() => {
      return (
        order.subtotalInCents +
        previewShippingInCents
      );
    }, [
      order.subtotalInCents,
      previewShippingInCents,
    ]);

  async function updateOrder(
    intent: Exclude<
      SavingIntent,
      null
    >,

    payload: Record<
      string,
      unknown
    > = {},

    success: string
  ) {
    setSavingIntent(
      intent
    );

    setError(null);

    setSuccessMessage(
      null
    );

    setNotificationWarning(
      null
    );

    try {
      const response =
        await fetch(
          `/api/admin/orders/${order.id}`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                intent,
                ...payload,
              }),
          }
        );

      const result =
        (await response.json()) as UpdateOrderResponse;

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Não foi possível atualizar o pedido."
        );
      }

      setSuccessMessage(
        success
      );

      if (
        result.notification
          ?.requested &&
        !result.notification.sent
      ) {
        setNotificationWarning(
          result.notification
            .error ||
            "A ação foi concluída, mas o e-mail não pôde ser enviado."
        );
      }

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o pedido."
      );
    } finally {
      setSavingIntent(
        null
      );
    }
  }

  async function handleShippingSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const shippingInCents =
      normalizeAdminPriceInputToCents(
        shippingValue
      );

    if (
      shippingInCents ===
      null
    ) {
      setError(
        "Informe um valor de frete válido."
      );

      return;
    }

    await updateOrder(
      "update_shipping",

      {
        shippingInCents,

        shippingServiceName:
          shippingServiceName.trim() ||
          undefined,

        notifyCustomer,
      },

      "Frete definido. O pedido agora está aguardando pagamento."
    );
  }

  async function handleConfirmPayment() {
    await updateOrder(
      "confirm_payment",

      {
        notifyCustomer,
      },

      "Pagamento confirmado com sucesso."
    );
  }

  async function handleStartProduction() {
    await updateOrder(
      "start_production",

      {
        notifyCustomer,
      },

      "Pedido colocado em produção."
    );
  }

  async function handleMarkShipped(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    await updateOrder(
      "mark_shipped",

      {
        trackingCode:
          trackingCode.trim(),

        trackingUrl:
          trackingUrl.trim(),

        notifyCustomer,
      },

      "Pedido marcado como enviado."
    );
  }

  async function handleTrackingSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    await updateOrder(
      "update_tracking",

      {
        trackingCode:
          trackingCode.trim(),

        trackingUrl:
          trackingUrl.trim(),

        notifyCustomer,
      },

      "Rastreamento atualizado."
    );
  }

  async function handleCancelOrder() {
    const confirmed =
      window.confirm(
        "Tem certeza que deseja cancelar este pedido? O fluxo será interrompido."
      );

    if (!confirmed) {
      return;
    }

    await updateOrder(
      "cancel",

      {
        notifyCustomer:
          notifyOnCancel,
      },

      "Pedido cancelado."
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      {notificationWarning ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>
            Atenção:
          </strong>{" "}
          {notificationWarning}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <div className="bg-zinc-50 px-5 py-5 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
            Etapa atual
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span
              className={[
                "inline-flex rounded-full border px-3 py-1.5 text-sm font-semibold",
                statusMeta.badgeClassName,
              ].join(" ")}
            >
              {
                statusMeta.label
              }
            </span>
          </div>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600">
            {workflowStep
              ?.description ??
              statusMeta.description}
          </p>
        </div>

        <div className="p-5 sm:p-6">
          {/* PEDIDO CRIADO */}
          {order.status ===
          "created" ? (
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">
                Definir frete
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                Informe o valor e a forma de envio. Ao salvar, o pedido avançará automaticamente para Pagamento pendente.
              </p>

              <form
                onSubmit={
                  handleShippingSubmit
                }
                className="mt-6 space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-zinc-700">
                      Valor do frete
                    </span>

                    <div className="relative mt-2">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                        R$
                      </span>

                      <input
                        value={
                          shippingValue
                        }
                        onChange={(
                          event
                        ) =>
                          setShippingValue(
                            event.target
                              .value
                          )
                        }
                        placeholder="0,00"
                        inputMode="decimal"
                        autoFocus
                        className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm text-zinc-900 outline-none transition focus:border-[var(--green-500)]"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-zinc-700">
                      Forma de envio
                    </span>

                    <input
                      value={
                        shippingServiceName
                      }
                      onChange={(
                        event
                      ) =>
                        setShippingServiceName(
                          event.target
                            .value
                        )
                      }
                      placeholder="Ex: Correios PAC, Motoboy, Retirada"
                      className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-[var(--green-500)]"
                    />
                  </label>
                </div>

                {/* PRÉVIA DO TOTAL */}
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
                    Prévia do pedido
                  </p>

                  <div className="mt-3 space-y-3">
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-zinc-500">
                        Subtotal
                      </span>

                      <span className="font-medium text-zinc-900">
                        {formatOrderCurrency(
                          order.subtotalInCents
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-zinc-500">
                        Frete
                      </span>

                      <span className="font-medium text-zinc-900">
                        {formatOrderCurrency(
                          previewShippingInCents
                        )}
                      </span>
                    </div>

                    <div className="border-t border-zinc-200 pt-3">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-semibold text-zinc-900">
                          Total
                        </span>

                        <span className="text-lg font-bold text-zinc-900">
                          {formatOrderCurrency(
                            previewTotalInCents
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <NotificationOption
                  checked={
                    notifyCustomer
                  }
                  onChange={
                    setNotifyCustomer
                  }
                  disabled={
                    isSaving
                  }
                />

                <button
                  type="submit"
                  disabled={
                    isSaving
                  }
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--green-500)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--green-300)] disabled:cursor-not-allowed disabled:bg-zinc-300 sm:w-auto"
                >
                  {savingIntent ===
                  "update_shipping" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}

                  Salvar frete e avançar
                </button>
              </form>
            </div>
          ) : null}

          {/* PAGAMENTO PENDENTE */}
          {order.status ===
          "pending_payment" ? (
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <CheckCircle2 className="h-5 w-5" />
              </div>

              <h2 className="mt-4 text-xl font-semibold text-zinc-900">
                Confirmar pagamento
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
                Confirme esta etapa somente depois de verificar que o pagamento foi realmente recebido.
              </p>

              <div className="mt-6 max-w-xl space-y-4">
                <NotificationOption
                  checked={
                    notifyCustomer
                  }
                  onChange={
                    setNotifyCustomer
                  }
                  disabled={
                    isSaving
                  }
                />

                <button
                  type="button"
                  onClick={
                    handleConfirmPayment
                  }
                  disabled={
                    isSaving
                  }
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--green-500)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--green-300)] disabled:cursor-not-allowed disabled:bg-zinc-300 sm:w-auto"
                >
                  {savingIntent ===
                  "confirm_payment" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}

                  Confirmar pagamento
                </button>
              </div>
            </div>
          ) : null}

          {/* CONFIRMADO */}
          {order.status ===
          "confirmed" ? (
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <PackageCheck className="h-5 w-5" />
              </div>

              <h2 className="mt-4 text-xl font-semibold text-zinc-900">
                Iniciar produção
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
                O pagamento já foi confirmado. Avance quando o pedido realmente entrar na fila de produção.
              </p>

              <div className="mt-6 max-w-xl space-y-4">
                <NotificationOption
                  checked={
                    notifyCustomer
                  }
                  onChange={
                    setNotifyCustomer
                  }
                  disabled={
                    isSaving
                  }
                />

                <button
                  type="button"
                  onClick={
                    handleStartProduction
                  }
                  disabled={
                    isSaving
                  }
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--green-500)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--green-300)] disabled:cursor-not-allowed disabled:bg-zinc-300 sm:w-auto"
                >
                  {savingIntent ===
                  "start_production" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <PackageCheck className="h-4 w-4" />
                  )}

                  Iniciar produção
                </button>
              </div>
            </div>
          ) : null}

          {/* PRODUÇÃO */}
          {order.status ===
          "processing" ? (
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <Truck className="h-5 w-5" />
              </div>

              <h2 className="mt-4 text-xl font-semibold text-zinc-900">
                Enviar pedido
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
                Informe o rastreamento se houver e finalize o envio. Código e link são opcionais.
              </p>

              <form
                onSubmit={
                  handleMarkShipped
                }
                className="mt-6 space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-zinc-700">
                      Código de rastreamento
                    </span>

                    <input
                      value={
                        trackingCode
                      }
                      onChange={(
                        event
                      ) =>
                        setTrackingCode(
                          event.target
                            .value
                        )
                      }
                      placeholder="Ex: BR123456789BR"
                      className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-[var(--green-500)]"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-zinc-700">
                      Link de rastreamento
                    </span>

                    <input
                      value={
                        trackingUrl
                      }
                      onChange={(
                        event
                      ) =>
                        setTrackingUrl(
                          event.target
                            .value
                        )
                      }
                      placeholder="https://..."
                      className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-[var(--green-500)]"
                    />
                  </label>
                </div>

                <NotificationOption
                  checked={
                    notifyCustomer
                  }
                  onChange={
                    setNotifyCustomer
                  }
                  disabled={
                    isSaving
                  }
                />

                <button
                  type="submit"
                  disabled={
                    isSaving
                  }
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--green-500)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--green-300)] disabled:cursor-not-allowed disabled:bg-zinc-300 sm:w-auto"
                >
                  {savingIntent ===
                  "mark_shipped" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Truck className="h-4 w-4" />
                  )}

                  Marcar como enviado
                </button>
              </form>
            </div>
          ) : null}

          {/* ENVIADO */}
          {order.status ===
          "shipped" ? (
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                <CheckCircle2 className="h-5 w-5" />
              </div>

              <h2 className="mt-4 text-xl font-semibold text-zinc-900">
                Pedido enviado
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
                O fluxo operacional está concluído. Se necessário, você pode corrigir os dados de rastreamento abaixo.
              </p>

              <form
                onSubmit={
                  handleTrackingSubmit
                }
                className="mt-6 space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-zinc-700">
                      Código de rastreamento
                    </span>

                    <input
                      value={
                        trackingCode
                      }
                      onChange={(
                        event
                      ) =>
                        setTrackingCode(
                          event.target
                            .value
                        )
                      }
                      placeholder="Ex: BR123456789BR"
                      className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-[var(--green-500)]"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-zinc-700">
                      Link de rastreamento
                    </span>

                    <input
                      value={
                        trackingUrl
                      }
                      onChange={(
                        event
                      ) =>
                        setTrackingUrl(
                          event.target
                            .value
                        )
                      }
                      placeholder="https://..."
                      className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-[var(--green-500)]"
                    />
                  </label>
                </div>

                <NotificationOption
                  checked={
                    notifyCustomer
                  }
                  onChange={
                    setNotifyCustomer
                  }
                  disabled={
                    isSaving
                  }
                />

                <button
                  type="submit"
                  disabled={
                    isSaving
                  }
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingIntent ===
                  "update_tracking" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}

                  Atualizar rastreamento
                </button>
              </form>
            </div>
          ) : null}

          {/* CANCELADO */}
          {order.status ===
          "canceled" ? (
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-700">
                <Ban className="h-5 w-5" />
              </div>

              <h2 className="mt-4 text-xl font-semibold text-zinc-900">
                Pedido cancelado
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                Este pedido não possui mais ações de avanço.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {/* CANCELAMENTO */}
      {canCancelOrder(
        order.status
      ) ? (
        <details className="group rounded-3xl border border-zinc-200 bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-zinc-600 sm:px-6">
            <span>
              Mais opções
            </span>

            <span className="text-xs font-normal text-zinc-400 group-open:hidden">
              Cancelamento
            </span>
          </summary>

          <div className="border-t border-zinc-100 px-5 py-5 sm:px-6">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-800">
                Cancelar pedido
              </p>

              <p className="mt-1 text-sm leading-relaxed text-red-700">
                O cancelamento interrompe o workflow e não poderá ser desfeito pela interface normal.
              </p>

              <div className="mt-4">
                <NotificationOption
                  checked={
                    notifyOnCancel
                  }
                  onChange={
                    setNotifyOnCancel
                  }
                  disabled={
                    isSaving
                  }
                />
              </div>

              <button
                type="button"
                onClick={
                  handleCancelOrder
                }
                disabled={
                  isSaving
                }
                className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingIntent ===
                "cancel" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Ban className="h-4 w-4" />
                )}

                Cancelar pedido
              </button>
            </div>
          </div>
        </details>
      ) : null}
    </div>
  );
}