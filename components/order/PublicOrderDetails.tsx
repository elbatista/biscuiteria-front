import Link from "next/link";
import {
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  ReceiptText,
  Truck,
  XCircle,
} from "lucide-react";

import Container from "@/components/Container";
import { formatBRLFromCents } from "@/lib/format-price";
import type { PublicOrderDetails as PublicOrderDetailsType } from "@/lib/server/orders";

type PublicOrderDetailsProps = {
  order: PublicOrderDetailsType;
};

type TimelineStepId =
  | "created"
  | "shipping_updated"
  | "pending_payment"
  | "confirmed"
  | "processing"
  | "shipped";

type TimelineStepState =
  | "completed"
  | "current"
  | "future";

type TimelineStep = {
  id: TimelineStepId;
  label: string;
  description: string;
  state: TimelineStepState;
  date: Date | null;
};

const WORKFLOW_STATUS_ORDER = [
  "created",
  "pending_payment",
  "confirmed",
  "processing",
  "shipped",
] as const;

function formatDateTime(
  date: Date
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle:
        "long",

      timeStyle:
        "short",

      timeZone:
        "America/Sao_Paulo",
    }
  ).format(date);
}

function formatShortDateTime(
  date: Date
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle:
        "short",

      timeStyle:
        "short",

      timeZone:
        "America/Sao_Paulo",
    }
  ).format(date);
}

function formatZipCode(
  zipCode: string
) {
  const digits =
    zipCode.replace(
      /\D/g,
      ""
    );

  if (
    digits.length !== 8
  ) {
    return zipCode;
  }

  return `${digits.slice(
    0,
    5
  )}-${digits.slice(5)}`;
}

function maskName(
  name: string
) {
  const parts =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (
    parts.length === 0
  ) {
    return "Cliente";
  }

  if (
    parts.length === 1
  ) {
    const first =
      parts[0];

    if (
      first.length <= 2
    ) {
      return `${
        first[0] ?? ""
      }***`;
    }

    return `${first.slice(
      0,
      2
    )}***`;
  }

  const firstName =
    parts[0];

  const lastName =
    parts[
      parts.length - 1
    ];

  return `${firstName} ${
    lastName[0] ?? ""
  }.`;
}

function maskEmail(
  email: string
) {
  const [local, domain] =
    email.split("@");

  if (
    !local ||
    !domain
  ) {
    return "e-mail informado";
  }

  const visibleStart =
    local.slice(
      0,
      Math.min(
        2,
        local.length
      )
    );

  const domainParts =
    domain.split(".");

  const domainName =
    domainParts[0] ?? "";

  const extension =
    domainParts
      .slice(1)
      .join(".");

  const maskedLocal =
    `${visibleStart}${"*".repeat(
      Math.max(
        3,
        local.length -
          visibleStart.length
      )
    )}`;

  const maskedDomain =
    domainName.length <= 2
      ? `${
          domainName[0] ??
          ""
        }***`
      : `${domainName.slice(
          0,
          2
        )}***`;

  return `${maskedLocal}@${maskedDomain}${
    extension
      ? `.${extension}`
      : ""
  }`;
}

function maskPhone(
  phone: string | null
) {
  if (!phone) {
    return "-";
  }

  const digits =
    phone.replace(
      /\D/g,
      ""
    );

  if (
    digits.length < 4
  ) {
    return "***";
  }

  return `(**) *****-${digits.slice(
    -4
  )}`;
}

function maskDocument(
  document: string | null
) {
  if (!document) {
    return "-";
  }

  const digits =
    document.replace(
      /\D/g,
      ""
    );

  if (
    digits.length !== 11
  ) {
    return "***";
  }

  return `***.***.***-${digits.slice(
    -2
  )}`;
}

function maskStreet(
  street: string
) {
  const trimmed =
    street.trim();

  if (!trimmed) {
    return "Endereço informado";
  }

  const words =
    trimmed
      .split(/\s+/)
      .filter(Boolean);

  if (
    words.length <= 1
  ) {
    return `${trimmed.slice(
      0,
      3
    )}***`;
  }

  return `${words[0]} ${
    words[1]?.slice(
      0,
      2
    ) ?? ""
  }***`;
}

function maskAddressNumber(
  number: string
) {
  const trimmed =
    number.trim();

  if (!trimmed) {
    return "***";
  }

  if (
    trimmed.length <= 2
  ) {
    return "***";
  }

  return `***${trimmed.slice(
    -1
  )}`;
}

function maskZipCode(
  zipCode: string
) {
  const digits =
    zipCode.replace(
      /\D/g,
      ""
    );

  if (
    digits.length !== 8
  ) {
    return "***";
  }

  return `*****-${digits.slice(
    -3
  )}`;
}

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

function getHistoryDateForStatus(
  order:
    PublicOrderDetailsType,

  status:
    string
) {
  const history =
    order.statusHistory.find(
      (item) =>
        item.toStatus ===
          status &&
        item.fromStatus !==
          item.toStatus
    );

  return (
    history?.createdAt ??
    null
  );
}

function getShippingUpdatedDate(
  order:
    PublicOrderDetailsType
) {
  const history =
    order.statusHistory.find(
      (item) =>
        item.fromStatus ===
          "created" &&
        item.toStatus ===
          "pending_payment"
    );

  return (
    history?.createdAt ??
    null
  );
}

function getStatusIndex(
  status: string
) {
  return WORKFLOW_STATUS_ORDER.indexOf(
    status as
      (typeof WORKFLOW_STATUS_ORDER)[number]
  );
}

function getLastStatusBeforeCancel(
  order:
    PublicOrderDetailsType
) {
  if (
    order.status !==
    "canceled"
  ) {
    return order.status;
  }

  const cancellation =
    [...order.statusHistory]
      .reverse()
      .find(
        (history) =>
          history.toStatus ===
          "canceled"
      );

  return (
    cancellation
      ?.fromStatus ??
    "created"
  );
}

function buildTimeline(
  order:
    PublicOrderDetailsType
): TimelineStep[] {
  const effectiveStatus =
    getLastStatusBeforeCancel(
      order
    );

  const effectiveIndex =
    Math.max(
      0,
      getStatusIndex(
        effectiveStatus
      )
    );

  const isCanceled =
    order.status ===
    "canceled";

  const createdDate =
    getHistoryDateForStatus(
      order,
      "created"
    ) ??
    order.createdAt;

  const shippingUpdatedDate =
    getShippingUpdatedDate(
      order
    );

  const confirmedDate =
    getHistoryDateForStatus(
      order,
      "confirmed"
    ) ??
    order.paidAt;

  const processingDate =
    getHistoryDateForStatus(
      order,
      "processing"
    );

  const shippedDate =
    getHistoryDateForStatus(
      order,
      "shipped"
    ) ??
    order.shippedAt;

  function normalStatusState(
    status: string
  ): TimelineStepState {
    const index =
      getStatusIndex(
        status
      );

    if (isCanceled) {
      return index <=
        effectiveIndex
        ? "completed"
        : "future";
    }

    if (
      index <
      effectiveIndex
    ) {
      return "completed";
    }

    if (
      index ===
      effectiveIndex
    ) {
      return "current";
    }

    return "future";
  }

  const shippingState:
    TimelineStepState =
    shippingUpdatedDate
      ? "completed"
      : effectiveStatus ===
          "created"
        ? "future"
        : "completed";

  return [
    {
      id:
        "created",

      label:
        "Pedido criado",

      description:
        "Recebemos os dados do seu pedido.",

      state:
        normalStatusState(
          "created"
        ),

      date:
        createdDate,
    },

    {
      id:
        "shipping_updated",

      label:
        "Frete atualizado",

      description:
        "O valor final do pedido foi atualizado com o frete.",

      state:
        shippingState,

      date:
        shippingUpdatedDate,
    },

    {
      id:
        "pending_payment",

      label:
        "Pagamento pendente",

      description:
        "Aguardando a confirmação do pagamento.",

      state:
        normalStatusState(
          "pending_payment"
        ),

      date:
        shippingUpdatedDate,
    },

    {
      id:
        "confirmed",

      label:
        "Pagamento confirmado",

      description:
        "O pagamento foi confirmado.",

      state:
        normalStatusState(
          "confirmed"
        ),

      date:
        confirmedDate,
    },

    {
      id:
        "processing",

      label:
        "Em produção",

      description:
        "Seu pedido está sendo produzido e preparado.",

      state:
        normalStatusState(
          "processing"
        ),

      date:
        processingDate,
    },

    {
      id:
        "shipped",

      label:
        "Enviado",

      description:
        "Seu pedido foi despachado.",

      state:
        normalStatusState(
          "shipped"
        ),

      date:
        shippedDate,
    },
  ];
}

function getCurrentStatusContent(
  order:
    PublicOrderDetailsType
) {
  switch (
    order.status
  ) {
    case "created":
      return {
        label:
          "Pedido criado",

        title:
          "Recebemos seu pedido",

        description:
          "Seu pedido foi recebido e agora estamos preparando os detalhes do frete. Assim que o valor for definido, o total será atualizado e entraremos em contato para confirmar.",

        badgeClassName:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
      };

    case "pending_payment":
      return {
        label:
          "Pagamento pendente",

        title:
          "Aguardando pagamento",

        description:
          "O frete já foi definido e o valor do pedido está atualizado. Vamos entrar em contato e acertar os detalhes do pagamento. Depois que recebermos a confirmação do pagamento, o pedido entrará em produção.",

        badgeClassName:
          "border-amber-200 bg-amber-50 text-amber-800",
      };

    case "confirmed":
      return {
        label:
          "Pagamento confirmado",

        title:
          "Pagamento confirmado",

        description:
          "Ótima notícia! Seu pagamento foi confirmado. O pedido está pronto e agora vai seguir para produção.",

        badgeClassName:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
      };

    case "processing":
      return {
        label:
          "Em produção",

        title:
          "Seu pedido está em produção",

        description:
          "Estamos produzindo e preparando seu pedido. A próxima etapa será o envio.",

        badgeClassName:
          "border-blue-200 bg-blue-50 text-blue-700",
      };

    case "shipped":
      return {
        label:
          "Enviado",

        title:
          "Seu pedido foi enviado",

        description:
          "Ótima notícia! Seu pedido foi despachado. Se houver rastreamento disponível, você pode consultá-lo logo abaixo.",

        badgeClassName:
          "border-violet-200 bg-violet-50 text-violet-700",
      };

    case "canceled":
      return {
        label:
          "Cancelado",

        title:
          "Pedido cancelado",

        description:
          "Este pedido foi cancelado e não seguirá para as próximas etapas. Caso tenha alguma dúvida, entre em contato conosco.",

        badgeClassName:
          "border-red-200 bg-red-50 text-red-700",
      };

    default:
      return {
        label:
          "Pedido",

        title:
          "Acompanhe seu pedido",

        description:
          "Consulte abaixo o andamento do seu pedido.",

        badgeClassName:
          "border-zinc-200 bg-zinc-50 text-zinc-700",
      };
  }
}

function getNextStepMessage(
  order:
    PublicOrderDetailsType
) {
  switch (
    order.status
  ) {
    case "created":
      return "Estamos definindo o frete. Quando ele for atualizado, o valor final aparecerá nesta página.";

    case "pending_payment":
      return "O pedido está aguardando a confirmação do pagamento.";

    case "confirmed":
      return "O próximo passo é iniciar a produção do seu pedido.";

    case "processing":
      return "Seu pedido está sendo preparado. Avisaremos quando ele for enviado.";

    case "shipped":
      return order.trackingUrl ||
        order.trackingCode
        ? "Use as informações de rastreamento para acompanhar o envio."
        : "Seu pedido já foi enviado. Caso precise de informações sobre a entrega, entre em contato conosco.";

    case "canceled":
      return "O fluxo deste pedido foi interrompido. Caso tenha dúvidas sobre o cancelamento, entre em contato conosco.";

    default:
      return "Acompanhe esta página para consultar as próximas atualizações.";
  }
}

function TimelineIcon({
  state,
}: {
  state:
    TimelineStepState;
}) {
  if (
    state ===
    "completed"
  ) {
    return (
      <Check className="h-4 w-4" />
    );
  }

  if (
    state ===
    "current"
  ) {
    return (
      <Circle className="h-3 w-3 fill-current" />
    );
  }

  return (
    <Circle className="h-3 w-3" />
  );
}

function OrderTimeline({
  order,
}: {
  order:
    PublicOrderDetailsType;
}) {
  const timeline =
    buildTimeline(order);

  const isCanceled =
    order.status ===
    "canceled";

  const canceledDate =
    order.cancelledAt ??
    getHistoryDateForStatus(
      order,
      "canceled"
    );

  return (
    <section className="rounded-[2rem] border border-[var(--rose-100)] bg-white p-5 shadow-sm sm:p-7">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--green-500)]">
          Acompanhamento
        </p>

        <h2 className="mt-2 font-playfair text-2xl font-semibold text-zinc-900 sm:text-3xl">
          Andamento do pedido
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
          Veja o que já foi concluído, a etapa atual e o que ainda vem pela frente.
        </p>
      </div>

      <div className="mt-7">
        {timeline.map(
          (
            step,
            index
          ) => {
            const isLast =
              index ===
              timeline.length -
                1;

            const isCompleted =
              step.state ===
              "completed";

            const isCurrent =
              step.state ===
              "current";

            return (
              <div
                key={
                  step.id
                }
                className="relative flex gap-4"
              >
                {!isLast ? (
                  <div
                    className={[
                      "absolute left-[17px] top-9 h-[calc(100%-12px)] w-px",

                      isCompleted
                        ? "bg-[var(--green-500)]"
                        : "bg-zinc-200",
                    ].join(
                      " "
                    )}
                  />
                ) : null}

                <div
                  className={[
                    "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",

                    isCompleted
                      ? "border-[var(--green-500)] bg-[var(--green-500)] text-white"
                      : isCurrent
                        ? "border-[var(--green-500)] bg-white text-[var(--green-500)] ring-4 ring-[var(--rose-50)]"
                        : "border-zinc-200 bg-white text-zinc-300",
                  ].join(
                    " "
                  )}
                >
                  <TimelineIcon
                    state={
                      step.state
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
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={[
                        "text-sm font-semibold",

                        step.state ===
                        "future"
                          ? "text-zinc-400"
                          : "text-zinc-900",
                      ].join(
                        " "
                      )}
                    >
                      {
                        step.label
                      }
                    </p>

                    {isCurrent ? (
                      <span className="rounded-full bg-[var(--rose-50)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--green-500)]">
                        Etapa atual
                      </span>
                    ) : null}
                  </div>

                  <p
                    className={[
                      "mt-1 text-sm leading-relaxed",

                      step.state ===
                      "future"
                        ? "text-zinc-400"
                        : "text-[var(--text-muted)]",
                    ].join(
                      " "
                    )}
                  >
                    {
                      step.description
                    }
                  </p>

                  {step.date &&
                  step.state !==
                    "future" ? (
                    <p className="mt-1 text-xs text-zinc-400">
                      {formatShortDateTime(
                        step.date
                      )}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          }
        )}

        {isCanceled ? (
          <div className="relative mt-7 flex gap-4 border-t border-red-100 pt-7">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-700">
              <XCircle className="h-4 w-4" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-red-800">
                  Pedido cancelado
                </p>

                <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-red-700">
                  Encerrado
                </span>
              </div>

              <p className="mt-1 text-sm leading-relaxed text-red-700">
                O fluxo do pedido foi interrompido.
              </p>

              {canceledDate ? (
                <p className="mt-1 text-xs text-red-500">
                  {formatShortDateTime(
                    canceledDate
                  )}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon:
    React.ReactNode;

  title:
    string;

  children:
    React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-[var(--rose-100)] bg-white p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--rose-50)] text-[var(--green-500)]">
          {icon}
        </div>

        <h2 className="text-lg font-semibold text-zinc-900">
          {title}
        </h2>
      </div>

      <div className="mt-5">
        {children}
      </div>
    </section>
  );
}

export default function PublicOrderDetails({
  order,
}: PublicOrderDetailsProps) {
  const address =
    order.shippingAddress;

  const statusContent =
    getCurrentStatusContent(
      order
    );

  const hasTracking =
    Boolean(
      order.trackingCode ||
        order.trackingUrl
    );

  const shippingWasDefined =
    order.status !==
    "created";

  const isCanceled =
    order.status ===
    "canceled";

  return (
    <main className="bg-white text-[var(--text-main)]">
      <Container>
        <div className="py-8 sm:py-10">
          <section className="rounded-[2rem] border border-[var(--rose-100)] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div
                  className={[
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold",
                    statusContent.badgeClassName,
                  ].join(
                    " "
                  )}
                >
                  {isCanceled ? (
                    <XCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}

                  {
                    statusContent.label
                  }
                </div>

                <h1 className="mt-4 font-playfair text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
                  {
                    statusContent.title
                  }
                </h1>

                <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
                  {
                    statusContent.description
                  }
                </p>
                {order.status === "created" ? (
                  <div className="mt-5 flex gap-3 rounded-2xl border border-[var(--rose-100)] bg-[var(--rose-50)] p-4">
                    <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[var(--green-500)]" />

                    <div>
                      <p className="text-sm font-semibold text-zinc-900">
                        Enviamos os detalhes do pedido por e-mail
                      </p>

                      <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">
                        Confira sua caixa de entrada. Se não encontrar nossa mensagem,
                        verifique também a pasta de spam ou lixo eletrônico.
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="rounded-3xl border border-[var(--rose-100)] bg-[var(--rose-50)] p-5 lg:min-w-[290px]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--green-500)]">
                  Número do pedido
                </p>

                <p className="mt-2 break-all text-xl font-bold text-zinc-900 sm:text-2xl">
                  {
                    order.publicId
                  }
                </p>

                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                  Criado em{" "}
                  {formatDateTime(
                    order.createdAt
                  )}
                </p>
              </div>
            </div>

            {shippingWasDefined &&
            !isCanceled ? (
              <div className="mt-6 grid gap-3 rounded-3xl border border-[var(--rose-100)] bg-[var(--rose-50)] p-4 sm:grid-cols-3 sm:p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                    Subtotal
                  </p>

                  <p className="mt-1 font-bold text-zinc-900">
                    {formatBRLFromCents(
                      order.subtotalInCents
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                    Frete
                  </p>

                  <p className="mt-1 font-bold text-zinc-900">
                    {order.shippingInCents ===
                    0
                      ? "Grátis"
                      : formatBRLFromCents(
                          order.shippingInCents
                        )}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                    Total atualizado
                  </p>

                  <p className="mt-1 text-lg font-bold text-zinc-900">
                    {formatBRLFromCents(
                      order.totalInCents
                    )}
                  </p>
                </div>
              </div>
            ) : null}

            {hasTracking ? (
              <div className="mt-5 rounded-3xl border border-violet-200 bg-violet-50 p-5 text-sm leading-relaxed text-violet-900">
                <div className="flex items-start gap-3">
                  <Truck className="mt-0.5 h-5 w-5 shrink-0" />

                  <div>
                    <p className="font-semibold">
                      Rastreamento disponível
                    </p>

                    {order.trackingCode ? (
                      <p className="mt-2">
                        Código:{" "}
                        <span className="font-semibold">
                          {
                            order.trackingCode
                          }
                        </span>
                      </p>
                    ) : null}

                    {order.trackingUrl ? (
                      <Link
                        href={
                          order.trackingUrl
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-2 font-semibold text-violet-900 underline-offset-4 hover:underline"
                      >
                        Abrir rastreamento

                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          <div className="mt-6">
            <OrderTimeline
              order={order}
            />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="space-y-6">
              <InfoCard
                icon={
                  <Package className="h-5 w-5" />
                }
                title="Itens do pedido"
              >
                <div className="space-y-4">
                  {order.items.map(
                    (item) => (
                      <div
                        key={
                          item.id
                        }
                        className="rounded-3xl border border-[var(--rose-100)] bg-[var(--rose-50)] p-4"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            {item.productSlugSnapshot ? (
                              <Link
                                href={`/produtos/${item.productSlugSnapshot}`}
                                className="text-base font-semibold text-zinc-900 transition hover:text-[var(--green-500)]"
                              >
                                {
                                  item.productNameSnapshot
                                }
                              </Link>
                            ) : (
                              <p className="text-base font-semibold text-zinc-900">
                                {
                                  item.productNameSnapshot
                                }
                              </p>
                            )}

                            {item.skuSnapshot ? (
                              <p className="mt-1 text-xs text-[var(--text-muted)]">
                                SKU:{" "}
                                {
                                  item.skuSnapshot
                                }
                              </p>
                            ) : null}

                            {item.selectedColorNameSnapshot ? (
                              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-700 ring-1 ring-[var(--rose-100)]">
                                <span
                                  className="h-4 w-4 rounded-full border border-zinc-200"
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

                                Cor:{" "}
                                {
                                  item.selectedColorNameSnapshot
                                }
                              </div>
                            ) : null}
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="text-sm text-[var(--text-muted)]">
                              Quantidade:{" "}
                              {
                                item.quantity
                              }
                            </p>

                            <p className="mt-1 text-sm text-[var(--text-muted)]">
                              Unitário:{" "}
                              {formatBRLFromCents(
                                item.unitPriceInCents
                              )}
                            </p>

                            <p className="mt-2 text-lg font-bold text-zinc-900">
                              {formatBRLFromCents(
                                item.lineTotalInCents
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </InfoCard>

              {order.customerNotes ? (
                <InfoCard
                  icon={
                    <MessageCircle className="h-5 w-5" />
                  }
                  title="Observações recebidas"
                >
                  <div className="rounded-3xl border border-[var(--rose-100)] bg-[var(--rose-50)] p-4">
                    <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                      As observações enviadas no pedido foram recebidas pela Biscuit_eria e serão consideradas no atendimento. Por segurança, o conteúdo completo não é exibido nesta página.
                    </p>
                  </div>
                </InfoCard>
              ) : null}
            </div>

            <aside className="space-y-6">
              <InfoCard
                icon={
                  <ReceiptText className="h-5 w-5" />
                }
                title="Resumo"
              >
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4 text-[var(--text-muted)]">
                    <span>
                      Itens
                    </span>

                    <span>
                      {
                        order.itemsCount
                      }
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 text-[var(--text-muted)]">
                    <span>
                      Subtotal
                    </span>

                    <span>
                      {formatBRLFromCents(
                        order.subtotalInCents
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 text-[var(--text-muted)]">
                    <span>
                      Frete
                    </span>

                    <span className="text-right">
                      {!shippingWasDefined
                        ? "A definir"
                        : order.shippingInCents ===
                            0
                          ? "Grátis"
                          : formatBRLFromCents(
                              order.shippingInCents
                            )}
                    </span>
                  </div>

                  {shippingWasDefined &&
                  order.shippingServiceName ? (
                    <div className="flex items-center justify-between gap-4 text-[var(--text-muted)]">
                      <span>
                        Envio
                      </span>

                      <span className="text-right">
                        {
                          order.shippingServiceName
                        }
                      </span>
                    </div>
                  ) : null}

                  <div className="border-t border-[var(--rose-100)] pt-3">
                    <div className="flex items-center justify-between gap-4 text-base font-semibold text-zinc-900">
                      <span>
                        {shippingWasDefined
                          ? "Total"
                          : "Total parcial"}
                      </span>

                      <span>
                        {formatBRLFromCents(
                          order.totalInCents
                        )}
                      </span>
                    </div>

                    {!shippingWasDefined ? (
                      <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
                        O valor final será atualizado quando o frete for definido.
                      </p>
                    ) : null}
                  </div>
                </div>
              </InfoCard>

              <InfoCard
                icon={
                  <Mail className="h-5 w-5" />
                }
                title="Cliente"
              >
                <div className="space-y-2 text-sm text-[var(--text-muted)]">
                  <p>
                    <span className="font-semibold text-zinc-900">
                      Nome:
                    </span>{" "}
                    {maskName(
                      order.customerName
                    )}
                  </p>

                  <p>
                    <span className="font-semibold text-zinc-900">
                      E-mail:
                    </span>{" "}
                    {maskEmail(
                      order.customerEmail
                    )}
                  </p>

                  <p>
                    <span className="font-semibold text-zinc-900">
                      WhatsApp:
                    </span>{" "}
                    {maskPhone(
                      order.customerPhone
                    )}
                  </p>

                  {order.customerDocument ? (
                    <p>
                      <span className="font-semibold text-zinc-900">
                        CPF:
                      </span>{" "}
                      {maskDocument(
                        order.customerDocument
                      )}
                    </p>
                  ) : null}
                </div>
              </InfoCard>

              <InfoCard
                icon={
                  <MapPin className="h-5 w-5" />
                }
                title="Entrega"
              >
                {address ? (
                  <div className="space-y-2 text-sm leading-relaxed text-[var(--text-muted)]">
                    <p className="font-semibold text-zinc-900">
                      {maskName(
                        address.recipientName
                      )}
                    </p>

                    <p>
                      {maskStreet(
                        address.street
                      )}
                      ,{" "}
                      {maskAddressNumber(
                        address.number
                      )}
                    </p>


                    <p>
                      {
                        maskStreet(address.neighborhood)
                      }
                    </p>


                    <p>
                      CEP:{" "}
                      {maskZipCode(
                        formatZipCode(
                          address.zipCode
                        )
                      )}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">
                    Endereço não informado.
                  </p>
                )}
              </InfoCard>

              <div className="rounded-3xl border border-[var(--rose-100)] bg-white p-5 sm:p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--rose-50)] text-[var(--green-500)]">
                  <Clock3 className="h-5 w-5" />
                </div>

                <h2 className="mt-4 text-lg font-semibold text-zinc-900">
                  Próximo passo
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
                  {getNextStepMessage(
                    order
                  )}
                </p>

                <Link
                  href="/contato"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-2xl border border-[var(--rose-100)] bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-[var(--rose-50)]"
                >
                  Entrar em contato
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </Container>
    </main>
  );
}