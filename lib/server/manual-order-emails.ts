import { formatBRLFromCents } from "@/lib/format-price";
import { sendEmail } from "@/lib/server/email";

type ManualOrderEmailItem = {
  productNameSnapshot: string;
  productSlugSnapshot: string | null;
  skuSnapshot: string | null;
  selectedColorNameSnapshot: string | null;
  selectedColorHexSnapshot: string | null;
  unitPriceInCents: number;
  quantity: number;
  lineTotalInCents: number;
};

type ManualOrderEmailAddress = {
  recipientName: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
};

type ManualOrderEmailData = {
  publicId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  customerDocument: string | null;
  customerNotes: string | null;
  subtotalInCents: number;
  totalInCents: number;
  createdAt: Date;
  items: ManualOrderEmailItem[];
  shippingAddress: ManualOrderEmailAddress | null;
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

function formatDateTimeBR(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(date);
}

function formatZipCode(zipCode: string) {
  const digits = zipCode.replace(/\D/g, "");

  if (digits.length !== 8) {
    return zipCode;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function renderAddressText(
  address: ManualOrderEmailAddress | null
) {
  if (!address) {
    return "Endereço não informado.";
  }

  const lines = [
    address.recipientName,
    `${address.street}, ${address.number}`,
    address.complement || null,
    address.neighborhood,
    `${address.city} - ${address.state}`,
    `CEP: ${formatZipCode(address.zipCode)}`,
    address.country,
  ].filter(Boolean);

  return lines.join("\n");
}

function renderAddressHtml(
  address: ManualOrderEmailAddress | null
) {
  if (!address) {
    return "<p>Endereço não informado.</p>";
  }

  return `
    <p style="margin:0 0 6px;"><strong>${escapeHtml(
      address.recipientName
    )}</strong></p>

    <p style="margin:0 0 6px;">${escapeHtml(
      address.street
    )}, ${escapeHtml(
      address.number
    )}</p>

    ${
      address.complement
        ? `<p style="margin:0 0 6px;">${escapeHtml(
            address.complement
          )}</p>`
        : ""
    }

    <p style="margin:0 0 6px;">${escapeHtml(
      address.neighborhood
    )}</p>

    <p style="margin:0 0 6px;">${escapeHtml(
      address.city
    )} - ${escapeHtml(
      address.state
    )}</p>

    <p style="margin:0;">CEP: ${escapeHtml(
      formatZipCode(
        address.zipCode
      )
    )}</p>
  `;
}

function renderItemsText(
  items: ManualOrderEmailItem[]
) {
  return items
    .map((item) => {
      const colorLine =
        item.selectedColorNameSnapshot
          ? `\n  Cor: ${item.selectedColorNameSnapshot}${
              item.selectedColorHexSnapshot
                ? ` (${item.selectedColorHexSnapshot})`
                : ""
            }`
          : "";

      return [
        `- ${item.productNameSnapshot}`,

        item.skuSnapshot
          ? `  SKU: ${item.skuSnapshot}`
          : null,

        colorLine.trim()
          ? `  ${colorLine.trim()}`
          : null,

        `  Quantidade: ${item.quantity}`,

        `  Unitário: ${formatBRLFromCents(
          item.unitPriceInCents
        )}`,

        `  Total: ${formatBRLFromCents(
          item.lineTotalInCents
        )}`,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
}

function renderItemsHtml(
  items: ManualOrderEmailItem[]
) {
  return items
    .map((item) => {
      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #f4d7de;">
            <div style="font-weight:700;color:#18181b;">
              ${escapeHtml(
                item.productNameSnapshot
              )}
            </div>

            ${
              item.skuSnapshot
                ? `
                  <div style="font-size:12px;color:#71717a;margin-top:4px;">
                    SKU: ${escapeHtml(
                      item.skuSnapshot
                    )}
                  </div>
                `
                : ""
            }

            ${
              item.selectedColorNameSnapshot
                ? `
                  <div style="font-size:12px;color:#71717a;margin-top:6px;">
                    Cor:
                    <strong>
                      ${escapeHtml(
                        item.selectedColorNameSnapshot
                      )}
                    </strong>

                    ${
                      item.selectedColorHexSnapshot
                        ? `
                          <span
                            style="
                              display:inline-block;
                              width:10px;
                              height:10px;
                              border-radius:999px;
                              border:1px solid #d4d4d8;
                              background:${escapeHtml(
                                item.selectedColorHexSnapshot
                              )};
                              vertical-align:middle;
                            "
                          ></span>
                        `
                        : ""
                    }
                  </div>
                `
                : ""
            }
          </td>

          <td
            style="
              padding:12px 0;
              border-bottom:1px solid #f4d7de;
              text-align:center;
              color:#18181b;
            "
          >
            ${item.quantity}
          </td>

          <td
            style="
              padding:12px 0;
              border-bottom:1px solid #f4d7de;
              text-align:right;
              color:#18181b;
            "
          >
            ${formatBRLFromCents(
              item.lineTotalInCents
            )}
          </td>
        </tr>
      `;
    })
    .join("");
}

function baseEmailHtml({
  title,
  intro,
  order,
  orderUrl,
  showSellerInstructions,
}: {
  title: string;
  intro: string;
  order: ManualOrderEmailData;
  orderUrl: string;
  showSellerInstructions: boolean;
}) {
  return `
    <div style="margin:0;padding:0;background:#fff7f8;font-family:Arial,sans-serif;color:#18181b;">
      <div style="max-width:680px;margin:0 auto;padding:32px 16px;">
        <div style="background:#ffffff;border:1px solid #f4d7de;border-radius:28px;padding:28px;">
          <div style="font-size:13px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#6a9f58;">
            Biscuit_eria
          </div>

          <h1 style="margin:12px 0 0;font-size:28px;line-height:1.2;color:#18181b;">
            ${escapeHtml(
              title
            )}
          </h1>

          <p style="margin:16px 0 0;font-size:15px;line-height:1.7;color:#52525b;">
            ${escapeHtml(
              intro
            )}
          </p>

          <div style="margin-top:22px;background:#fff7f8;border:1px solid #f4d7de;border-radius:20px;padding:16px;">
            <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.14em;color:#71717a;">
              Pedido
            </div>

            <div style="margin-top:4px;font-size:22px;font-weight:700;color:#18181b;">
              ${escapeHtml(
                order.publicId
              )}
            </div>

            <div style="margin-top:4px;font-size:13px;color:#71717a;">
              Criado em ${escapeHtml(
                formatDateTimeBR(
                  order.createdAt
                )
              )}
            </div>
          </div>

          <h2 style="margin:28px 0 12px;font-size:18px;color:#18181b;">
            Itens
          </h2>

          <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="width:100%;border-collapse:collapse;"
          >
            <thead>
              <tr>
                <th style="padding-bottom:8px;text-align:left;font-size:12px;color:#71717a;">
                  Produto
                </th>

                <th style="padding-bottom:8px;text-align:center;font-size:12px;color:#71717a;">
                  Qtd.
                </th>

                <th style="padding-bottom:8px;text-align:right;font-size:12px;color:#71717a;">
                  Total
                </th>
              </tr>
            </thead>

            <tbody>
              ${renderItemsHtml(
                order.items
              )}
            </tbody>
          </table>

          <div style="margin-top:18px;border-top:1px solid #f4d7de;padding-top:16px;">
            <table
              role="presentation"
              width="100%"
              cellpadding="0"
              cellspacing="0"
              border="0"
              style="width:100%;border-collapse:collapse;"
            >
              <tbody>
                <tr>
                  <td
                    style="
                      padding:4px 12px 4px 0;
                      font-size:15px;
                      line-height:1.5;
                      color:#52525b;
                      vertical-align:top;
                    "
                  >
                    Subtotal
                  </td>

                  <td
                    align="right"
                    style="
                      padding:4px 0;
                      font-size:15px;
                      line-height:1.5;
                      font-weight:700;
                      color:#18181b;
                      text-align:right;
                      vertical-align:top;
                    "
                  >
                    ${formatBRLFromCents(
                      order.subtotalInCents
                    )}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding:4px 12px 4px 0;
                      font-size:15px;
                      line-height:1.5;
                      color:#52525b;
                      vertical-align:top;
                    "
                  >
                    Frete
                  </td>

                  <td
                    align="right"
                    style="
                      padding:4px 0;
                      font-size:15px;
                      line-height:1.5;
                      font-weight:700;
                      color:#18181b;
                      text-align:right;
                      vertical-align:top;
                    "
                  >
                    A combinar
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding:8px 12px 0 0;
                      font-size:18px;
                      line-height:1.5;
                      color:#18181b;
                      vertical-align:top;
                    "
                  >
                    Total parcial
                  </td>

                  <td
                    align="right"
                    style="
                      padding:8px 0 0;
                      font-size:18px;
                      line-height:1.5;
                      font-weight:700;
                      color:#18181b;
                      text-align:right;
                      vertical-align:top;
                    "
                  >
                    ${formatBRLFromCents(
                      order.totalInCents
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 style="margin:28px 0 12px;font-size:18px;color:#18181b;">
            Cliente
          </h2>

          <div style="font-size:14px;line-height:1.7;color:#52525b;">
            <p style="margin:0 0 6px;">
              <strong style="color:#18181b;">
                Nome:
              </strong>

              ${escapeHtml(
                order.customerName
              )}
            </p>

            <p style="margin:0 0 6px;">
              <strong style="color:#18181b;">
                E-mail:
              </strong>

              ${escapeHtml(
                order.customerEmail
              )}
            </p>

            ${
              order.customerPhone
                ? `
                  <p style="margin:0 0 6px;">
                    <strong style="color:#18181b;">
                      Telefone/WhatsApp:
                    </strong>

                    ${escapeHtml(
                      order.customerPhone
                    )}
                  </p>
                `
                : ""
            }

            ${
              order.customerDocument
                ? `
                  <p style="margin:0;">
                    <strong style="color:#18181b;">
                      CPF:
                    </strong>

                    ${escapeHtml(
                      order.customerDocument
                    )}
                  </p>
                `
                : ""
            }
          </div>

          <h2 style="margin:28px 0 12px;font-size:18px;color:#18181b;">
            Entrega
          </h2>

          <div style="font-size:14px;line-height:1.7;color:#52525b;">
            ${renderAddressHtml(
              order.shippingAddress
            )}
          </div>

          ${
            order.customerNotes
              ? `
                <h2 style="margin:28px 0 12px;font-size:18px;color:#18181b;">
                  Observações
                </h2>

                <p style="margin:0;font-size:14px;line-height:1.7;color:#52525b;white-space:pre-line;">
                  ${escapeHtml(
                    order.customerNotes
                  )}
                </p>
              `
              : ""
          }

          ${
            showSellerInstructions
              ? `
                <div style="margin-top:28px;background:#fef3c7;border:1px solid #fcd34d;border-radius:20px;padding:16px;font-size:14px;line-height:1.7;color:#92400e;">
                  <strong>Ação necessária:</strong>
                  entre em contato com o cliente para combinar prazo de produção, frete e pagamento.
                </div>
              `
              : `
                <div style="margin-top:28px;background:#fff7f8;border:1px solid #f4d7de;border-radius:20px;padding:16px;font-size:14px;line-height:1.7;color:#52525b;">
                  Seu pedido foi recebido. A vendedora entrará em contato para combinar prazo de produção, envio e pagamento.
                </div>
              `
          }

          <div style="margin-top:28px;">
            <a
              href="${escapeHtml(
                orderUrl
              )}"
              style="display:inline-block;background:#6a9f58;color:#ffffff;text-decoration:none;font-weight:700;border-radius:16px;padding:12px 18px;"
            >
              Ver detalhes do pedido
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}

function sellerText(
  order: ManualOrderEmailData,
  orderUrl: string
) {
  return `
Novo pedido recebido na Biscuit_eria.

Pedido: ${order.publicId}
Criado em: ${formatDateTimeBR(order.createdAt)}

Cliente:
Nome: ${order.customerName}
E-mail: ${order.customerEmail}
Telefone/WhatsApp: ${order.customerPhone || "-"}
CPF: ${order.customerDocument || "-"}

Endereço:
${renderAddressText(order.shippingAddress)}

Itens:
${renderItemsText(order.items)}

Subtotal: ${formatBRLFromCents(order.subtotalInCents)}
Frete: A combinar
Total parcial: ${formatBRLFromCents(order.totalInCents)}

Observações:
${order.customerNotes || "-"}

Ação necessária:
Entre em contato com o cliente para combinar prazo de produção, frete e pagamento.

Abrir pedido:
${orderUrl}
`.trim();
}

function customerText(
  order: ManualOrderEmailData,
  orderUrl: string
) {
  return `
Olá, ${order.customerName}.

Recebemos seu pedido na Biscuit_eria.

Pedido: ${order.publicId}

A vendedora entrará em contato para combinar:
- prazo de produção
- envio
- pagamento

Itens:
${renderItemsText(order.items)}

Subtotal: ${formatBRLFromCents(order.subtotalInCents)}
Frete: A combinar
Total parcial: ${formatBRLFromCents(order.totalInCents)}

Acompanhar pedido:
${orderUrl}
`.trim();
}

export async function sendManualOrderEmails(
  order: ManualOrderEmailData
) {
  const sellerEmail =
    process.env.ORDER_NOTIFICATION_EMAIL;

  if (!sellerEmail) {
    throw new Error(
      "Variável de ambiente ausente: ORDER_NOTIFICATION_EMAIL"
    );
  }

  const orderUrl =
    `${getSiteUrl()}/pedido/${order.publicId}`;

  const sellerSubject =
    `Novo pedido recebido — ${order.publicId}`;

  const customerSubject =
    `Recebemos seu pedido — ${order.publicId}`;

  await Promise.all([
    sendEmail({
      to:
        sellerEmail,

      subject:
        sellerSubject,

      replyTo:
        order.customerEmail,

      text:
        sellerText(
          order,
          orderUrl
        ),

      html:
        baseEmailHtml({
          title:
            "Novo pedido recebido",

          intro:
            "Um novo pedido foi criado manualmente na loja. Entre em contato com o cliente para combinar envio, prazo e pagamento.",

          order,
          orderUrl,

          showSellerInstructions:
            true,
        }),
    }),

    sendEmail({
      to:
        order.customerEmail,

      subject:
        customerSubject,

      text:
        customerText(
          order,
          orderUrl
        ),

      html:
        baseEmailHtml({
          title:
            "Recebemos seu pedido",

          intro:
            "Obrigada pelo pedido! A Biscuit_eria entrará em contato para combinar envio, prazo de produção e pagamento.",

          order,
          orderUrl,

          showSellerInstructions:
            false,
        }),
    }),
  ]);
}