import { formatBRLFromCents } from "@/lib/format-price";
import { sendEmail } from "@/lib/server/email";

export type OrderWorkflowEmailEvent =
  | "shipping_updated"
  | "payment_confirmed"
  | "production_started"
  | "order_shipped"
  | "tracking_updated"
  | "order_canceled";

export type OrderWorkflowEmailData = {
  publicId: string;

  customerName: string;
  customerEmail: string;

  subtotalInCents: number;
  shippingInCents: number;
  totalInCents: number;

  shippingServiceName: string | null;

  trackingCode: string | null;
  trackingUrl: string | null;

  status: string;
};

function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getOrderUrl(
  order: OrderWorkflowEmailData
) {
  return `${getSiteUrl()}/pedido/${order.publicId}`;
}

function getEmailContent({
  event,
  order,
}: {
  event: OrderWorkflowEmailEvent;
  order: OrderWorkflowEmailData;
}) {
  switch (event) {
    case "shipping_updated":
      return {
        subject: `Frete atualizado — ${order.publicId}`,

        title: "Frete atualizado",

        intro:
          "O valor do frete do seu pedido foi atualizado. Seu pedido agora está aguardando pagamento.",

        highlightTitle:
          "Total do pedido",

        highlightValue:
          formatBRLFromCents(
            order.totalInCents
          ),

        details: [
          {
            label: "Subtotal",
            value:
              formatBRLFromCents(
                order.subtotalInCents
              ),
          },

          {
            label: "Frete",
            value:
              formatBRLFromCents(
                order.shippingInCents
              ),
          },

          {
            label: "Forma de envio",
            value:
              order.shippingServiceName ||
              "Frete combinado",
          },
        ],

        text: [
          `Olá, ${order.customerName}.`,
          "",
          "O frete do seu pedido foi atualizado.",
          "",
          `Pedido: ${order.publicId}`,
          `Subtotal: ${formatBRLFromCents(
            order.subtotalInCents
          )}`,
          `Frete: ${formatBRLFromCents(
            order.shippingInCents
          )}`,
          `Total: ${formatBRLFromCents(
            order.totalInCents
          )}`,
          "",
          "Seu pedido agora está aguardando pagamento.",
        ].join("\n"),
      };

    case "payment_confirmed":
      return {
        subject: `Pagamento confirmado — ${order.publicId}`,

        title: "Pagamento confirmado",

        intro:
          "Recebemos a confirmação do pagamento do seu pedido.",

        highlightTitle:
          "Pagamento",

        highlightValue:
          "Confirmado",

        details: [
          {
            label: "Total",
            value:
              formatBRLFromCents(
                order.totalInCents
              ),
          },

          {
            label: "Próxima etapa",
            value:
              "Preparação para produção",
          },
        ],

        text: [
          `Olá, ${order.customerName}.`,
          "",
          "O pagamento do seu pedido foi confirmado.",
          "",
          `Pedido: ${order.publicId}`,
          `Total: ${formatBRLFromCents(
            order.totalInCents
          )}`,
          "",
          "Seu pedido seguirá para a próxima etapa.",
        ].join("\n"),
      };

    case "production_started":
      return {
        subject: `Seu pedido está em produção — ${order.publicId}`,

        title: "Seu pedido está em produção",

        intro:
          "Seu pedido entrou na etapa de produção e preparação.",

        highlightTitle:
          "Etapa atual",

        highlightValue:
          "Em produção",

        details: [
          {
            label: "Pedido",
            value:
              order.publicId,
          },

          {
            label: "Próxima etapa",
            value:
              "Envio",
          },
        ],

        text: [
          `Olá, ${order.customerName}.`,
          "",
          "Seu pedido entrou em produção.",
          "",
          `Pedido: ${order.publicId}`,
          "",
          "Avisaremos quando ele for enviado.",
        ].join("\n"),
      };

    case "order_shipped":
      return {
        subject: `Seu pedido foi enviado — ${order.publicId}`,

        title: "Seu pedido foi enviado",

        intro:
          "Seu pedido saiu para entrega e o fluxo de produção foi concluído.",

        highlightTitle:
          "Etapa atual",

        highlightValue:
          "Enviado",

        details: [
          ...(order.trackingCode
            ? [
                {
                  label:
                    "Código de rastreamento",
                  value:
                    order.trackingCode,
                },
              ]
            : []),

          ...(order.shippingServiceName
            ? [
                {
                  label:
                    "Forma de envio",
                  value:
                    order.shippingServiceName,
                },
              ]
            : []),
        ],

        text: [
          `Olá, ${order.customerName}.`,
          "",
          "Seu pedido foi enviado.",
          "",
          `Pedido: ${order.publicId}`,
          order.trackingCode
            ? `Código de rastreamento: ${order.trackingCode}`
            : null,
          order.trackingUrl
            ? `Rastreamento: ${order.trackingUrl}`
            : null,
        ]
          .filter(Boolean)
          .join("\n"),
      };

    case "tracking_updated":
      return {
        subject: `Rastreamento atualizado — ${order.publicId}`,

        title: "Rastreamento atualizado",

        intro:
          "As informações de rastreamento do seu pedido foram atualizadas.",

        highlightTitle:
          "Pedido",

        highlightValue:
          order.publicId,

        details: [
          ...(order.trackingCode
            ? [
                {
                  label:
                    "Código de rastreamento",
                  value:
                    order.trackingCode,
                },
              ]
            : []),

          ...(order.shippingServiceName
            ? [
                {
                  label:
                    "Forma de envio",
                  value:
                    order.shippingServiceName,
                },
              ]
            : []),
        ],

        text: [
          `Olá, ${order.customerName}.`,
          "",
          "As informações de rastreamento do seu pedido foram atualizadas.",
          "",
          `Pedido: ${order.publicId}`,
          order.trackingCode
            ? `Código de rastreamento: ${order.trackingCode}`
            : null,
          order.trackingUrl
            ? `Rastreamento: ${order.trackingUrl}`
            : null,
        ]
          .filter(Boolean)
          .join("\n"),
      };

    case "order_canceled":
      return {
        subject: `Pedido cancelado — ${order.publicId}`,

        title: "Pedido cancelado",

        intro:
          "O seu pedido foi cancelado e não seguirá para as próximas etapas.",

        highlightTitle:
          "Situação",

        highlightValue:
          "Cancelado",

        details: [
          {
            label: "Pedido",
            value:
              order.publicId,
          },
        ],

        text: [
          `Olá, ${order.customerName}.`,
          "",
          "Seu pedido foi cancelado.",
          "",
          `Pedido: ${order.publicId}`,
          "",
          "Caso tenha alguma dúvida, entre em contato conosco.",
        ].join("\n"),
      };
  }
}

function renderHtml({
  event,
  order,
}: {
  event: OrderWorkflowEmailEvent;
  order: OrderWorkflowEmailData;
}) {
  const content =
    getEmailContent({
      event,
      order,
    });

  const orderUrl =
    getOrderUrl(order);

  const detailsHtml =
    content.details.length > 0
      ? `
        <div style="margin-top:20px;border-top:1px solid #f4d7de;padding-top:16px;">
          ${content.details
            .map(
              (detail) => `
                <div style="display:flex;justify-content:space-between;gap:20px;margin-top:8px;font-size:14px;line-height:1.5;">
                  <span style="color:#71717a;">
                    ${escapeHtml(
                      detail.label
                    )}
                  </span>

                  <strong style="color:#18181b;text-align:right;">
                    ${escapeHtml(
                      detail.value
                    )}
                  </strong>
                </div>
              `
            )
            .join("")}
        </div>
      `
      : "";

  const trackingButton =
    (
      event === "order_shipped" ||
      event === "tracking_updated"
    ) &&
    order.trackingUrl
      ? `
        <div style="margin-top:12px;">
          <a
            href="${escapeHtml(
              order.trackingUrl
            )}"
            style="display:inline-block;border:1px solid #d4d4d8;color:#18181b;text-decoration:none;font-weight:700;border-radius:16px;padding:12px 18px;"
          >
            Abrir rastreamento
          </a>
        </div>
      `
      : "";

  return `
    <div style="margin:0;padding:0;background:#fff7f8;font-family:Arial,sans-serif;color:#18181b;">
      <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
        <div style="background:#ffffff;border:1px solid #f4d7de;border-radius:28px;padding:28px;">
          <div style="font-size:13px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#6a9f58;">
            Biscuit_eria
          </div>

          <h1 style="margin:12px 0 0;font-size:28px;line-height:1.2;color:#18181b;">
            ${escapeHtml(
              content.title
            )}
          </h1>

          <p style="margin:16px 0 0;font-size:15px;line-height:1.7;color:#52525b;">
            Olá, ${escapeHtml(
              order.customerName
            )}.
          </p>

          <p style="margin:8px 0 0;font-size:15px;line-height:1.7;color:#52525b;">
            ${escapeHtml(
              content.intro
            )}
          </p>

          <div style="margin-top:24px;background:#fff7f8;border:1px solid #f4d7de;border-radius:20px;padding:18px;">
            <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.14em;color:#71717a;">
              ${escapeHtml(
                content.highlightTitle
              )}
            </div>

            <div style="margin-top:6px;font-size:22px;font-weight:700;color:#18181b;">
              ${escapeHtml(
                content.highlightValue
              )}
            </div>

            ${detailsHtml}
          </div>

          <div style="margin-top:28px;">
            <a
              href="${escapeHtml(
                orderUrl
              )}"
              style="display:inline-block;background:#6a9f58;color:#ffffff;text-decoration:none;font-weight:700;border-radius:16px;padding:12px 18px;"
            >
              Acompanhar pedido
            </a>
          </div>

          ${trackingButton}

          <p style="margin:28px 0 0;font-size:12px;line-height:1.6;color:#a1a1aa;">
            Pedido ${escapeHtml(
              order.publicId
            )}
          </p>
        </div>
      </div>
    </div>
  `;
}

export async function sendOrderWorkflowEmail({
  event,
  order,
}: {
  event: OrderWorkflowEmailEvent;
  order: OrderWorkflowEmailData;
}) {
  const content =
    getEmailContent({
      event,
      order,
    });

  const orderUrl =
    getOrderUrl(order);

  const text = [
    content.text,
    "",
    `Acompanhar pedido: ${orderUrl}`,
  ].join("\n");

  return sendEmail({
    to: order.customerEmail,

    subject:
      content.subject,

    text,

    html: renderHtml({
      event,
      order,
    }),
  });
}