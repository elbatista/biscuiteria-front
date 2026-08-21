import { prisma } from "@/lib/prisma";
import {
  isOrderStatus,
  type OrderStatus,
} from "@/lib/admin/orders/order-status";

const ADMIN_ORDERS_PAGE_SIZE = 20;

export type AdminOrdersSearchParams = {
  q?: string;
  status?: string;
  page?: string;
};

export type AdminOrderListItem = {
  id: number;
  publicId: string;
  status: string;
  paymentStatus: string;
  sourceChannel: string | null;

  customerName: string;
  customerEmail: string;
  customerPhone: string | null;

  itemsCount: number;

  subtotalInCents: number;
  shippingInCents: number;
  totalInCents: number;

  shippingServiceName: string | null;

  trackingCode: string | null;
  trackingUrl: string | null;

  createdAt: Date;
  updatedAt: Date;

  paidAt: Date | null;
  shippedAt: Date | null;
  cancelledAt: Date | null;
};

export type AdminOrdersCounters = {
  total: number;
  created: number;
  pendingPayment: number;
  confirmed: number;
  processing: number;
  shipped: number;
  canceled: number;
};

export type AdminOrdersResult = {
  orders: AdminOrderListItem[];

  counters: AdminOrdersCounters;

  totalCount: number;

  page: number;
  pageSize: number;
  totalPages: number;

  filters: {
    q: string;
    status: string;
  };
};

function normalizePage(value: string | undefined) {
  const page = Number(value);

  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }

  return page;
}

function normalizeSearch(value: string | undefined) {
  return value?.trim() || "";
}

function normalizeStatus(
  value: string | undefined
): OrderStatus | undefined {
  if (!value || value === "all") {
    return undefined;
  }

  return isOrderStatus(value)
    ? value
    : undefined;
}

function getSearchWhere(q: string) {
  if (!q) {
    return {};
  }

  const phoneDigits =
    q.replace(/\D/g, "");

  return {
    OR: [
      {
        publicId: {
          contains: q,
          mode: "insensitive" as const,
        },
      },

      {
        customerName: {
          contains: q,
          mode: "insensitive" as const,
        },
      },

      {
        customerEmail: {
          contains: q,
          mode: "insensitive" as const,
        },
      },

      {
        customerPhone: {
          contains:
            phoneDigits || q,

          mode:
            "insensitive" as const,
        },
      },
    ],
  };
}

export async function getAdminOrders(
  searchParams: AdminOrdersSearchParams
): Promise<AdminOrdersResult> {
  const q =
    normalizeSearch(
      searchParams.q
    );

  const status =
    normalizeStatus(
      searchParams.status
    );

  const requestedPage =
    normalizePage(
      searchParams.page
    );

  const where = {
    ...(status
      ? {
          status,
        }
      : {}),

    ...getSearchWhere(q),
  };

  const [
    totalCount,
    orders,

    total,
    created,
    pendingPayment,
    confirmed,
    processing,
    shipped,
    canceled,
  ] = await Promise.all([
    /**
     * Quantidade encontrada considerando
     * os filtros atuais.
     */
    prisma.order.count({
      where,
    }),

    /**
     * Pedidos da página atual.
     */
    prisma.order.findMany({
      where,

      orderBy: {
        createdAt: "desc",
      },

      skip:
        (requestedPage - 1) *
        ADMIN_ORDERS_PAGE_SIZE,

      take:
        ADMIN_ORDERS_PAGE_SIZE,

      select: {
        id: true,
        publicId: true,

        status: true,
        paymentStatus: true,
        sourceChannel: true,

        customerName: true,
        customerEmail: true,
        customerPhone: true,

        itemsCount: true,

        subtotalInCents: true,
        shippingInCents: true,
        totalInCents: true,

        shippingServiceName:
          true,

        trackingCode: true,
        trackingUrl: true,

        createdAt: true,
        updatedAt: true,

        paidAt: true,
        shippedAt: true,
        cancelledAt: true,
      },
    }),

    /**
     * TODOS
     */
    prisma.order.count(),

    /**
     * PEDIDO CRIADO
     *
     * A vendedora precisa revisar
     * e definir o frete.
     */
    prisma.order.count({
      where: {
        status: "created",
      },
    }),

    /**
     * PAGAMENTO
     *
     * Frete já definido.
     * Aguardando pagamento.
     */
    prisma.order.count({
      where: {
        status:
          "pending_payment",
      },
    }),

    /**
     * CONFIRMADOS
     *
     * Pagamento confirmado.
     * Precisa iniciar produção.
     */
    prisma.order.count({
      where: {
        status: "confirmed",
      },
    }),

    /**
     * PRODUÇÃO
     */
    prisma.order.count({
      where: {
        status: "processing",
      },
    }),

    /**
     * ENVIADOS
     */
    prisma.order.count({
      where: {
        status: "shipped",
      },
    }),

    /**
     * CANCELADOS
     */
    prisma.order.count({
      where: {
        status: "canceled",
      },
    }),
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalCount /
        ADMIN_ORDERS_PAGE_SIZE
    )
  );

  const page = Math.min(
    requestedPage,
    totalPages
  );

  return {
    orders,

    counters: {
      total,
      created,
      pendingPayment,
      confirmed,
      processing,
      shipped,
      canceled,
    },

    totalCount,

    page,

    pageSize:
      ADMIN_ORDERS_PAGE_SIZE,

    totalPages,

    filters: {
      q,
      status:
        status ?? "all",
    },
  };
}