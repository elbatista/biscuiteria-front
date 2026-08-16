"use client";

import Link from "next/link";
import {
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  Eye,
  PackageCheck,
  Search,
  ShoppingBag,
  Truck,
  WalletCards,
} from "lucide-react";

import {
  getOrderPrimaryActionLabel,
  getOrderStatusMeta,
} from "@/lib/admin/orders/order-status";

import {
  formatAdminOrderDate,
  formatAdminPhone,
  formatOrderCurrency,
} from "@/lib/admin/orders/order-format";

import type {
  AdminOrderListItem,
  AdminOrdersResult,
} from "@/lib/admin/orders/get-admin-orders";

type AdminOrdersPageClientProps = {
  result: AdminOrdersResult;
};

type OrdersTab = {
  value: string;
  label: string;
  shortLabel: string;
  description: string;
  count: number;
  icon: ReactNode;
};

function buildQueryString(
  currentParams: URLSearchParams,
  nextValues: Record<
    string,
    string | number | null | undefined
  >
) {
  const params =
    new URLSearchParams(
      currentParams.toString()
    );

  Object.entries(nextValues).forEach(
    ([key, value]) => {
      if (
        value === null ||
        value === undefined ||
        value === "" ||
        value === "all"
      ) {
        params.delete(key);

        return;
      }

      params.set(
        key,
        String(value)
      );
    }
  );

  return params.toString();
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const meta =
    getOrderStatusMeta(
      status
    );

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        meta.badgeClassName,
      ].join(" ")}
      title={
        meta.description
      }
    >
      {meta.label}
    </span>
  );
}

function getNextActionLabel(
  order: AdminOrderListItem
) {
  if (
    order.status ===
    "canceled"
  ) {
    return null;
  }

  if (
    order.status ===
    "shipped"
  ) {
    if (
      !order.trackingCode &&
      !order.trackingUrl
    ) {
      return "Adicionar rastreamento";
    }

    return "Ver pedido";
  }

  return (
    getOrderPrimaryActionLabel(
      order.status
    ) || "Ver pedido"
  );
}

function getOrderOperationalDescription(
  order: AdminOrderListItem
) {
  switch (order.status) {
    case "created":
      return "Aguardando revisão e definição do frete.";

    case "pending_payment":
      return "Frete definido. Aguardando confirmação do pagamento.";

    case "confirmed":
      return "Pagamento confirmado. Pronto para iniciar produção.";

    case "processing":
      return "Pedido em produção. Próximo passo é preparar o envio.";

    case "shipped":
      if (
        !order.trackingCode &&
        !order.trackingUrl
      ) {
        return "Pedido enviado. Rastreamento não informado.";
      }

      return "Pedido enviado ao cliente.";

    case "canceled":
      return "Fluxo do pedido encerrado.";

    default:
      return "";
  }
}

function getNextStepDescription(
  order: AdminOrderListItem
) {
  switch (order.status) {
    case "created":
      return "Definir frete";

    case "pending_payment":
      return "Confirmar pagamento";

    case "confirmed":
      return "Iniciar produção";

    case "processing":
      return "Marcar como enviado";

    case "shipped":
      if (
        !order.trackingCode &&
        !order.trackingUrl
      ) {
        return "Adicionar rastreamento";
      }

      return null;

    default:
      return null;
  }
}

function OrderActionButton({
  order,
  compact = false,
}: {
  order: AdminOrderListItem;
  compact?: boolean;
}) {
  const label =
    getNextActionLabel(
      order
    );

  if (!label) {
    return (
      <span className="text-xs font-medium text-zinc-400">
        Sem ações
      </span>
    );
  }

  return (
    <Link
      href={`/admin/orders/${order.id}`}
      className={[
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl bg-[var(--green-500)] text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--green-300)]",
        compact
          ? "px-3 py-2"
          : "px-4 py-2",
      ].join(" ")}
    >
      <span>
        {label}
      </span>

      <ChevronRight className="h-4 w-4 shrink-0" />
    </Link>
  );
}

function MobileOrderCard({
  order,
}: {
  order: AdminOrderListItem;
}) {
  const nextStep =
    getNextStepDescription(
      order
    );

  return (
    <article className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <StatusBadge
              status={
                order.status
              }
            />

            <Link
              href={`/admin/orders/${order.id}`}
              className="mt-3 block break-all text-base font-bold text-zinc-900 transition hover:text-[var(--green-500)]"
            >
              {
                order.publicId
              }
            </Link>

            <p className="mt-1 text-lg font-semibold text-zinc-900">
              {
                order.customerName
              }
            </p>

            <p className="mt-1 text-xs text-zinc-400">
              Criado em{" "}
              {formatAdminOrderDate(
                order.createdAt
              )}
            </p>
          </div>

          <Link
            href={`/admin/orders/${order.id}`}
            aria-label={`Abrir pedido ${order.publicId}`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-900"
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-4 rounded-2xl bg-zinc-50 p-4">
          <p className="text-sm leading-relaxed text-zinc-600">
            {getOrderOperationalDescription(
              order
            )}
          </p>

          {nextStep ? (
            <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-[var(--green-500)]">
              <ChevronRight className="h-3.5 w-3.5" />

              Próximo:{" "}
              {nextStep}
            </div>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-zinc-100 p-3">
            <p className="text-xs text-zinc-400">
              Itens
            </p>

            <p className="mt-1 text-sm font-semibold text-zinc-900">
              {
                order.itemsCount
              }{" "}
              {order.itemsCount ===
              1
                ? "item"
                : "itens"}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-100 p-3">
            <p className="text-xs text-zinc-400">
              Total
            </p>

            <p className="mt-1 text-sm font-bold text-zinc-900">
              {formatOrderCurrency(
                order.totalInCents
              )}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-1 border-t border-zinc-100 pt-4">
          <p className="truncate text-xs text-zinc-500">
            {
              order.customerEmail
            }
          </p>

          {order.customerPhone ? (
            <p className="text-xs text-zinc-500">
              {formatAdminPhone(
                order.customerPhone
              )}
            </p>
          ) : null}
        </div>
      </div>

      <div className="border-t border-zinc-100 bg-zinc-50/70 p-4">
        {order.status ===
        "canceled" ? (
          <Link
            href={`/admin/orders/${order.id}`}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            Ver pedido

            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <div className="[&>a]:w-full">
            <OrderActionButton
              order={order}
            />
          </div>
        )}
      </div>
    </article>
  );
}

export default function AdminOrdersPageClient({
  result,
}: AdminOrdersPageClientProps) {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const [q, setQ] =
    useState(
      result.filters.q
    );

  const hasActiveSearch =
    Boolean(
      result.filters.q
    );

  const tabs: OrdersTab[] = [
    {
      value: "all",
      label: "Todos os pedidos",
      shortLabel: "Todos",
      description:
        "Visualização geral de todos os pedidos.",
      count:
        result.counters.total,
      icon: (
        <ClipboardList className="h-4 w-4" />
      ),
    },

    {
      value: "created",
      label: "Pedidos criados",
      shortLabel: "Novos",
      description:
        "Pedidos que precisam ter o frete definido.",
      count:
        result.counters.created,
      icon: (
        <ShoppingBag className="h-4 w-4" />
      ),
    },

    {
      value:
        "pending_payment",
      label:
        "Pagamento pendente",
      shortLabel:
        "Pagamento",
      description:
        "Pedidos aguardando confirmação do pagamento.",
      count:
        result.counters
          .pendingPayment,
      icon: (
        <WalletCards className="h-4 w-4" />
      ),
    },

    {
      value: "confirmed",
      label:
        "Pagamentos confirmados",
      shortLabel:
        "Confirmados",
      description:
        "Pedidos pagos que ainda precisam entrar em produção.",
      count:
        result.counters
          .confirmed,
      icon: (
        <CheckCircle2 className="h-4 w-4" />
      ),
    },

    {
      value: "processing",
      label: "Em produção",
      shortLabel:
        "Produção",
      description:
        "Pedidos atualmente em produção.",
      count:
        result.counters
          .processing,
      icon: (
        <PackageCheck className="h-4 w-4" />
      ),
    },

    {
      value: "shipped",
      label:
        "Pedidos enviados",
      shortLabel:
        "Enviados",
      description:
        "Pedidos que já foram despachados.",
      count:
        result.counters
          .shipped,
      icon: (
        <Truck className="h-4 w-4" />
      ),
    },

    {
      value: "canceled",
      label:
        "Pedidos cancelados",
      shortLabel:
        "Cancelados",
      description:
        "Pedidos cujo fluxo foi interrompido.",
      count:
        result.counters
          .canceled,
      icon: (
        <Ban className="h-4 w-4" />
      ),
    },
  ];

  const activeTab =
    result.filters.status;

  const selectedTab =
    tabs.find(
      (tab) =>
        tab.value ===
        activeTab
    ) ?? tabs[0];

  const pagination =
    useMemo(() => {
      const previousPage =
        result.page > 1
          ? `/admin/orders?${buildQueryString(
              searchParams,
              {
                page:
                  result.page -
                  1,
              }
            )}`
          : null;

      const nextPage =
        result.page <
        result.totalPages
          ? `/admin/orders?${buildQueryString(
              searchParams,
              {
                page:
                  result.page +
                  1,
              }
            )}`
          : null;

      return {
        previousPage,
        nextPage,
      };
    }, [
      result.page,
      result.totalPages,
      searchParams,
    ]);

  function getTabHref(
    status: string
  ) {
    const queryString =
      buildQueryString(
        searchParams,
        {
          status:
            status === "all"
              ? null
              : status,

          page:
            null,
        }
      );

    return `/admin/orders${
      queryString
        ? `?${queryString}`
        : ""
    }`;
  }

  function handleSearchSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const queryString =
      buildQueryString(
        searchParams,
        {
          q:
            q.trim(),

          page:
            null,
        }
      );

    router.push(
      `/admin/orders${
        queryString
          ? `?${queryString}`
          : ""
      }`
    );
  }

  function handleClearSearch() {
    setQ("");

    const queryString =
      buildQueryString(
        searchParams,
        {
          q:
            null,

          page:
            null,
        }
      );

    router.push(
      `/admin/orders${
        queryString
          ? `?${queryString}`
          : ""
      }`
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* CABEÇALHO */}
      <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--rose-50)] text-[var(--green-500)] ring-1 ring-[var(--rose-100)]">
                <ClipboardList className="h-5 w-5" />
              </div>

              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
                Pedidos
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
                Trabalhe pelas etapas abaixo. Cada pedido aparece na fila correspondente à próxima ação necessária.
              </p>
            </div>

            <div className="flex items-center gap-4 rounded-3xl border border-zinc-200 bg-zinc-50 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                  Total
                </p>

                <p className="mt-1 text-3xl font-bold text-zinc-900">
                  {
                    result.counters
                      .total
                  }
                </p>
              </div>

              <div className="h-10 w-px bg-zinc-200" />

              <div>
                <p className="text-xs text-zinc-400">
                  Em andamento
                </p>

                <p className="mt-1 text-lg font-bold text-zinc-900">
                  {result.counters
                    .created +
                    result.counters
                      .pendingPayment +
                    result.counters
                      .confirmed +
                    result.counters
                      .processing}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ABAS */}
        <div className="border-t border-zinc-100 bg-zinc-50/70">
          <div className="overflow-x-auto px-4 py-3 sm:px-6">
            <nav
              aria-label="Etapas dos pedidos"
              className="flex min-w-max gap-2"
            >
              {tabs.map(
                (tab) => {
                  const isActive =
                    activeTab ===
                    tab.value;

                  return (
                    <Link
                      key={
                        tab.value
                      }
                      href={getTabHref(
                        tab.value
                      )}
                      aria-current={
                        isActive
                          ? "page"
                          : undefined
                      }
                      className={[
                        "inline-flex min-h-11 items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition",

                        isActive
                          ? "border-[var(--green-500)] bg-[var(--green-500)] text-white shadow-sm"
                          : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50",
                      ].join(
                        " "
                      )}
                    >
                      {
                        tab.icon
                      }

                      <span>
                        {
                          tab.shortLabel
                        }
                      </span>

                      <span
                        className={[
                          "inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-xs",

                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-zinc-100 text-zinc-600",
                        ].join(
                          " "
                        )}
                      >
                        {
                          tab.count
                        }
                      </span>
                    </Link>
                  );
                }
              )}
            </nav>
          </div>
        </div>
      </section>

      {/* FILA SELECIONADA */}
      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--green-500)]">
              Fila atual
            </p>

            <h2 className="mt-1 text-xl font-semibold text-zinc-900">
              {
                selectedTab.label
              }
            </h2>

            <p className="mt-1 text-sm leading-relaxed text-zinc-500">
              {
                selectedTab.description
              }
            </p>
          </div>

          <div className="shrink-0">
            <p className="text-sm text-zinc-500">
              <strong className="text-zinc-900">
                {
                  result.totalCount
                }
              </strong>{" "}
              {result.totalCount ===
              1
                ? "pedido encontrado"
                : "pedidos encontrados"}
            </p>
          </div>
        </div>

        {/* BUSCA */}
        <form
          onSubmit={
            handleSearchSubmit
          }
          className="mt-5 flex flex-col gap-3 sm:flex-row"
        >
          <label className="relative block flex-1">
            <span className="sr-only">
              Buscar pedido
            </span>

            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

            <input
              value={q}
              onChange={(
                event
              ) =>
                setQ(
                  event.target
                    .value
                )
              }
              placeholder="Pedido, cliente, e-mail ou telefone"
              className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[var(--green-500)]"
            />
          </label>

          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--green-500)] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--green-300)]"
          >
            <Search className="h-4 w-4 sm:hidden" />

            Buscar
          </button>

          {hasActiveSearch ? (
            <button
              type="button"
              onClick={
                handleClearSearch
              }
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
            >
              Limpar busca
            </button>
          ) : null}
        </form>

        {hasActiveSearch ? (
          <div className="mt-3 rounded-2xl bg-zinc-50 px-4 py-3 text-sm text-zinc-500">
            Buscando por{" "}
            <strong className="text-zinc-800">
              “{
                result.filters.q
              }”
            </strong>{" "}
            dentro da fila{" "}
            <strong className="text-zinc-800">
              {
                selectedTab.shortLabel
              }
            </strong>
            .
          </div>
        ) : null}
      </section>

      {/* LISTA VAZIA */}
      {result.orders.length ===
      0 ? (
        <section className="rounded-3xl border border-dashed border-zinc-300 bg-white p-8 text-center sm:p-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-400">
            {hasActiveSearch ? (
              <Search className="h-5 w-5" />
            ) : (
              <Clock3 className="h-5 w-5" />
            )}
          </div>

          <h2 className="mt-4 text-lg font-semibold text-zinc-900">
            {hasActiveSearch
              ? "Nenhum pedido encontrado"
              : "Nenhum pedido nesta fila"}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
            {hasActiveSearch
              ? "Tente buscar por outro nome, e-mail, telefone ou número de pedido."
              : `No momento não há pedidos em “${selectedTab.label}”.`}
          </p>

          {hasActiveSearch ? (
            <button
              type="button"
              onClick={
                handleClearSearch
              }
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
            >
              Limpar busca
            </button>
          ) : null}
        </section>
      ) : (
        <>
          {/* MOBILE / TABLET */}
          <section className="space-y-3 lg:hidden">
            {result.orders.map(
              (order) => (
                <MobileOrderCard
                  key={
                    order.id
                  }
                  order={
                    order
                  }
                />
              )
            )}
          </section>

          {/* DESKTOP */}
          <section className="hidden overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Pedido
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Cliente
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Etapa
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Próximo passo
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Total
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Ação
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100 bg-white">
                  {result.orders.map(
                    (order) => {
                      const nextStep =
                        getNextStepDescription(
                          order
                        );

                      return (
                        <tr
                          key={
                            order.id
                          }
                          className="transition hover:bg-zinc-50/80"
                        >
                          <td className="px-5 py-4 align-top">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="break-all text-sm font-bold text-zinc-900 transition hover:text-[var(--green-500)]"
                            >
                              {
                                order.publicId
                              }
                            </Link>

                            <p className="mt-1 text-xs text-zinc-400">
                              {formatAdminOrderDate(
                                order.createdAt
                              )}
                            </p>

                            <p className="mt-1 text-xs text-zinc-400">
                              {
                                order.itemsCount
                              }{" "}
                              {order.itemsCount ===
                              1
                                ? "item"
                                : "itens"}
                            </p>
                          </td>

                          <td className="px-5 py-4 align-top">
                            <p className="text-sm font-semibold text-zinc-900">
                              {
                                order.customerName
                              }
                            </p>

                            <p className="mt-1 max-w-[220px] truncate text-xs text-zinc-500">
                              {
                                order.customerEmail
                              }
                            </p>

                            {order.customerPhone ? (
                              <p className="mt-1 text-xs text-zinc-500">
                                {formatAdminPhone(
                                  order.customerPhone
                                )}
                              </p>
                            ) : null}
                          </td>

                          <td className="px-5 py-4 align-top">
                            <StatusBadge
                              status={
                                order.status
                              }
                            />

                            <p className="mt-2 max-w-[220px] text-xs leading-relaxed text-zinc-500">
                              {getOrderOperationalDescription(
                                order
                              )}
                            </p>
                          </td>

                          <td className="px-5 py-4 align-top">
                            {nextStep ? (
                              <div className="inline-flex items-start gap-2 rounded-2xl bg-zinc-50 px-3 py-2">
                                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[var(--green-500)]" />

                                <span className="text-sm font-semibold text-zinc-700">
                                  {
                                    nextStep
                                  }
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-zinc-400">
                                Fluxo concluído
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4 text-right align-top">
                            <p className="text-sm font-bold text-zinc-900">
                              {formatOrderCurrency(
                                order.totalInCents
                              )}
                            </p>

                            {order.status ===
                            "created" ? (
                              <p className="mt-1 text-xs text-zinc-400">
                                total parcial
                              </p>
                            ) : null}
                          </td>

                          <td className="px-5 py-4 text-right align-top">
                            {order.status ===
                            "canceled" ? (
                              <Link
                                href={`/admin/orders/${order.id}`}
                                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                              >
                                Ver

                                <Eye className="h-4 w-4" />
                              </Link>
                            ) : (
                              <OrderActionButton
                                order={
                                  order
                                }
                                compact
                              />
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* PAGINAÇÃO */}
          <section className="flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-zinc-500">
                Página{" "}
                <span className="font-semibold text-zinc-900">
                  {
                    result.page
                  }
                </span>{" "}
                de{" "}
                <span className="font-semibold text-zinc-900">
                  {
                    result.totalPages
                  }
                </span>
              </p>

              <p className="mt-1 text-xs text-zinc-400">
                {
                  result.totalCount
                }{" "}
                {result.totalCount ===
                1
                  ? "pedido nesta consulta"
                  : "pedidos nesta consulta"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              {pagination.previousPage ? (
                <Link
                  href={
                    pagination.previousPage
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                >
                  <ChevronLeft className="h-4 w-4" />

                  Anterior
                </Link>
              ) : (
                <span className="inline-flex h-11 cursor-not-allowed items-center justify-center gap-2 rounded-2xl border border-zinc-100 bg-zinc-50 px-4 text-sm font-semibold text-zinc-300">
                  <ChevronLeft className="h-4 w-4" />

                  Anterior
                </span>
              )}

              {pagination.nextPage ? (
                <Link
                  href={
                    pagination.nextPage
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                >
                  Próxima

                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <span className="inline-flex h-11 cursor-not-allowed items-center justify-center gap-2 rounded-2xl border border-zinc-100 bg-zinc-50 px-4 text-sm font-semibold text-zinc-300">
                  Próxima

                  <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}