export const ORDER_STATUS_VALUES = [
  "created",
  "pending_payment",
  "confirmed",
  "processing",
  "shipped",
  "canceled",
] as const;

export type OrderStatus = (typeof ORDER_STATUS_VALUES)[number];

export const PAYMENT_STATUS_VALUES = [
  "pending",
  "approved",
  "rejected",
  "cancelled",
  "expired",
  "refunded",
  "in_dispute",
  "chargeback",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUS_VALUES)[number];

export type OrderStatusMeta = {
  label: string;
  shortLabel: string;
  description: string;
  badgeClassName: string;
};

export type PaymentStatusMeta = {
  label: string;
  shortLabel: string;
  description: string;
  badgeClassName: string;
};

export type OrderWorkflowAction =
  | "update_shipping"
  | "confirm_payment"
  | "start_production"
  | "mark_shipped"
  | "cancel";

export type OrderWorkflowStep = {
  status: OrderStatus;
  label: string;
  customerLabel: string;
  description: string;
  action: OrderWorkflowAction | null;
  actionLabel: string | null;
  nextStatus: OrderStatus | null;
};

export const ORDER_STATUS_META: Record<OrderStatus, OrderStatusMeta> = {
  created: {
    label: "Pedido criado",
    shortLabel: "Criado",
    description:
      "Pedido recebido. Aguardando revisão e definição do frete pela vendedora.",
    badgeClassName: "border-orange-200 bg-orange-50 text-orange-800",
  },

  pending_payment: {
    label: "Pagamento pendente",
    shortLabel: "Pagamento",
    description:
      "Frete definido e valor final atualizado. Aguardando confirmação do pagamento.",
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-800",
  },

  confirmed: {
    label: "Pagamento confirmado",
    shortLabel: "Confirmado",
    description:
      "Pagamento confirmado. O pedido está pronto para entrar em produção.",
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },

  processing: {
    label: "Em produção",
    shortLabel: "Produção",
    description: "Pedido em produção ou preparação.",
    badgeClassName: "border-blue-200 bg-blue-50 text-blue-700",
  },

  shipped: {
    label: "Enviado",
    shortLabel: "Enviado",
    description: "Pedido enviado ao cliente.",
    badgeClassName: "border-violet-200 bg-violet-50 text-violet-700",
  },

  canceled: {
    label: "Cancelado",
    shortLabel: "Cancelado",
    description: "Pedido cancelado.",
    badgeClassName: "border-red-200 bg-red-50 text-red-700",
  },
};

export const PAYMENT_STATUS_META: Record<
  PaymentStatus,
  PaymentStatusMeta
> = {
  pending: {
    label: "Pagamento pendente",
    shortLabel: "Pendente",
    description: "Pagamento ainda não confirmado.",
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-800",
  },

  approved: {
    label: "Pagamento aprovado",
    shortLabel: "Aprovado",
    description: "Pagamento confirmado.",
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },

  rejected: {
    label: "Pagamento rejeitado",
    shortLabel: "Rejeitado",
    description: "Pagamento rejeitado.",
    badgeClassName: "border-red-200 bg-red-50 text-red-700",
  },

  cancelled: {
    label: "Pagamento cancelado",
    shortLabel: "Cancelado",
    description: "Pagamento cancelado.",
    badgeClassName: "border-red-200 bg-red-50 text-red-700",
  },

  expired: {
    label: "Pagamento expirado",
    shortLabel: "Expirado",
    description: "Pagamento expirado.",
    badgeClassName: "border-zinc-200 bg-zinc-50 text-zinc-700",
  },

  refunded: {
    label: "Pagamento reembolsado",
    shortLabel: "Reembolso",
    description: "Pagamento reembolsado.",
    badgeClassName: "border-sky-200 bg-sky-50 text-sky-700",
  },

  in_dispute: {
    label: "Em disputa",
    shortLabel: "Disputa",
    description: "Pagamento em disputa.",
    badgeClassName: "border-orange-200 bg-orange-50 text-orange-700",
  },

  chargeback: {
    label: "Chargeback",
    shortLabel: "Chargeback",
    description: "Pagamento com chargeback.",
    badgeClassName: "border-red-200 bg-red-50 text-red-700",
  },
};

export const ORDER_WORKFLOW: readonly OrderWorkflowStep[] = [
  {
    status: "created",
    label: "Pedido criado",
    customerLabel: "Pedido criado",
    description: "Aguardando definição do frete.",
    action: "update_shipping",
    actionLabel: "Definir frete",
    nextStatus: "pending_payment",
  },

  {
    status: "pending_payment",
    label: "Pagamento pendente",
    customerLabel: "Pagamento pendente",
    description: "Aguardando confirmação do pagamento.",
    action: "confirm_payment",
    actionLabel: "Confirmar pagamento",
    nextStatus: "confirmed",
  },

  {
    status: "confirmed",
    label: "Pagamento confirmado",
    customerLabel: "Pagamento confirmado",
    description: "Pedido pronto para iniciar a produção.",
    action: "start_production",
    actionLabel: "Iniciar produção",
    nextStatus: "processing",
  },

  {
    status: "processing",
    label: "Em produção",
    customerLabel: "Em produção",
    description: "Pedido sendo produzido ou preparado.",
    action: "mark_shipped",
    actionLabel: "Marcar como enviado",
    nextStatus: "shipped",
  },

  {
    status: "shipped",
    label: "Enviado",
    customerLabel: "Enviado",
    description: "Pedido despachado para o cliente.",
    action: null,
    actionLabel: null,
    nextStatus: null,
  },
] as const;

export const MAIN_WORKFLOW_STATUSES = [
  "created",
  "pending_payment",
  "confirmed",
  "processing",
  "shipped",
] as const;

export type MainWorkflowStatus =
  (typeof MAIN_WORKFLOW_STATUSES)[number];

export function isOrderStatus(value: string): value is OrderStatus {
  return ORDER_STATUS_VALUES.includes(value as OrderStatus);
}

export function isPaymentStatus(
  value: string
): value is PaymentStatus {
  return PAYMENT_STATUS_VALUES.includes(value as PaymentStatus);
}

export function getOrderStatusMeta(
  status: string
): OrderStatusMeta {
  if (isOrderStatus(status)) {
    return ORDER_STATUS_META[status];
  }

  return {
    label: status,
    shortLabel: status,
    description: "Status desconhecido.",
    badgeClassName: "border-zinc-200 bg-zinc-50 text-zinc-700",
  };
}

export function getPaymentStatusMeta(
  status: string
): PaymentStatusMeta {
  if (isPaymentStatus(status)) {
    return PAYMENT_STATUS_META[status];
  }

  return {
    label: status,
    shortLabel: status,
    description: "Status de pagamento desconhecido.",
    badgeClassName: "border-zinc-200 bg-zinc-50 text-zinc-700",
  };
}

export function getWorkflowStep(
  status: string
): OrderWorkflowStep | null {
  return ORDER_WORKFLOW.find((step) => step.status === status) ?? null;
}

export function getNextSuggestedOrderStatus(
  status: string
): OrderStatus | null {
  return getWorkflowStep(status)?.nextStatus ?? null;
}

export function getNextSuggestedOrderStatusLabel(
  status: string
) {
  const nextStatus = getNextSuggestedOrderStatus(status);

  if (!nextStatus) {
    return null;
  }

  return getOrderStatusMeta(nextStatus).label;
}

export function getOrderPrimaryAction(
  status: string
): OrderWorkflowAction | null {
  return getWorkflowStep(status)?.action ?? null;
}

export function getOrderPrimaryActionLabel(
  status: string
): string | null {
  return getWorkflowStep(status)?.actionLabel ?? null;
}

export function canAdvanceOrderToStatus(
  currentStatus: string,
  nextStatus: string
) {
  if (!isOrderStatus(currentStatus)) {
    return false;
  }

  if (!isOrderStatus(nextStatus)) {
    return false;
  }

  const workflowStep = getWorkflowStep(currentStatus);

  if (!workflowStep) {
    return false;
  }

  return workflowStep.nextStatus === nextStatus;
}

export function canCancelOrder(status: string) {
  return (
    isOrderStatus(status) &&
    status !== "canceled" &&
    status !== "shipped"
  );
}

/**
 * Temporariamente mantida porque a API administrativa atual
 * ainda trabalha com alteração de status.
 *
 * Na Etapa 2 vamos substituí-la por ações específicas:
 * update_shipping, confirm_payment, start_production,
 * mark_shipped e cancel.
 */
export function canMoveOrderToStatus(
  currentStatus: string,
  nextStatus: string
) {
  if (!isOrderStatus(currentStatus)) {
    return false;
  }

  if (!isOrderStatus(nextStatus)) {
    return false;
  }

  if (currentStatus === nextStatus) {
    return true;
  }

  if (nextStatus === "canceled") {
    return canCancelOrder(currentStatus);
  }

  return canAdvanceOrderToStatus(currentStatus, nextStatus);
}

export function shouldSetPaidAt({
  previousPaymentStatus,
  nextPaymentStatus,
}: {
  previousPaymentStatus: string;
  nextPaymentStatus: string;
}) {
  return (
    previousPaymentStatus !== "approved" &&
    nextPaymentStatus === "approved"
  );
}

export function shouldSetShippedAt({
  previousStatus,
  nextStatus,
}: {
  previousStatus: string;
  nextStatus: string;
}) {
  return (
    previousStatus !== "shipped" &&
    nextStatus === "shipped"
  );
}

export function shouldSetCancelledAt({
  previousStatus,
  nextStatus,
}: {
  previousStatus: string;
  nextStatus: string;
}) {
  return (
    previousStatus !== "canceled" &&
    nextStatus === "canceled"
  );
}