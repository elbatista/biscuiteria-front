"use client";

import Link from "next/link";
import {
  useState,
} from "react";
import {
  Check,
  ClipboardCopy,
  ExternalLink,
  Link2,
} from "lucide-react";

import {
  formatAdminPhone,
  formatOrderCurrency,
} from "@/lib/admin/orders/order-format";

import type { AdminOrderDetails } from "@/lib/admin/orders/get-admin-order";

type AdminOrderUtilityActionsProps = {
  order: Pick<
    AdminOrderDetails,
    | "publicId"
    | "customerName"
    | "customerEmail"
    | "customerPhone"
    | "subtotalInCents"
    | "shippingInCents"
    | "totalInCents"
    | "trackingCode"
    | "trackingUrl"
    | "items"
  >;
};

type CopiedTarget =
  | "summary"
  | "public_link"
  | null;

/**
 * Este caminho é usado durante a renderização.
 *
 * Ele é deliberadamente relativo para que servidor
 * e navegador produzam exatamente o mesmo HTML.
 */
function buildPublicOrderPath(
  publicId: string
) {
  return `/pedido/${publicId}`;
}

/**
 * A URL absoluta só é criada dentro de eventos
 * executados no navegador.
 *
 * Nunca chamamos esta função durante o render.
 */
function buildBrowserPublicOrderUrl(
  publicId: string
) {
  const path =
    buildPublicOrderPath(
      publicId
    );

  if (
    typeof window ===
    "undefined"
  ) {
    return path;
  }

  return `${window.location.origin}${path}`;
}

function buildOrderSummary(
  order:
    AdminOrderUtilityActionsProps["order"],

  publicUrl:
    string
) {
  const lines = [
    `Pedido: ${order.publicId}`,

    `Cliente: ${order.customerName}`,

    `E-mail: ${order.customerEmail}`,

    `WhatsApp: ${formatAdminPhone(
      order.customerPhone
    )}`,

    "",

    "Itens:",

    ...order.items.map(
      (item) => {
        const color =
          item.selectedColorNameSnapshot
            ? ` — Cor: ${item.selectedColorNameSnapshot}`
            : "";

        return `- ${item.quantity}x ${item.productNameSnapshot}${color} — ${formatOrderCurrency(
          item.lineTotalInCents
        )}`;
      }
    ),

    "",

    `Subtotal: ${formatOrderCurrency(
      order.subtotalInCents
    )}`,

    `Frete: ${
      order.shippingInCents >
      0
        ? formatOrderCurrency(
            order.shippingInCents
          )
        : "A combinar"
    }`,

    `Total parcial: ${formatOrderCurrency(
      order.totalInCents
    )}`,

    "",

    `Link do pedido: ${publicUrl}`,
  ];

  if (
    order.trackingCode ||
    order.trackingUrl
  ) {
    lines.push("");

    lines.push(
      "Rastreamento:"
    );

    if (
      order.trackingCode
    ) {
      lines.push(
        `Código: ${order.trackingCode}`
      );
    }

    if (
      order.trackingUrl
    ) {
      lines.push(
        `URL: ${order.trackingUrl}`
      );
    }
  }

  return lines.join(
    "\n"
  );
}

function UtilityCard({
  title,
  description,
  children,
}: {
  title: string;

  description?: string;

  children:
    React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-zinc-900">
        {title}
      </h2>

      {description ? (
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          {
            description
          }
        </p>
      ) : null}

      <div className="mt-5">
        {children}
      </div>
    </section>
  );
}

export default function AdminOrderUtilityActions({
  order,
}: AdminOrderUtilityActionsProps) {
  const [
    copiedTarget,
    setCopiedTarget,
  ] = useState<CopiedTarget>(
    null
  );

  const [
    copyError,
    setCopyError,
  ] = useState<
    string | null
  >(null);

  /**
   * Este valor é estável no SSR e no cliente.
   */
  const publicOrderPath =
    buildPublicOrderPath(
      order.publicId
    );

  async function copyText(
    text: string,

    target: Exclude<
      CopiedTarget,
      null
    >
  ) {
    setCopyError(null);

    try {
      await navigator.clipboard.writeText(
        text
      );

      setCopiedTarget(
        target
      );

      window.setTimeout(
        () => {
          setCopiedTarget(
            null
          );
        },
        2000
      );
    } catch {
      setCopyError(
        "Não foi possível copiar automaticamente. Selecione o texto manualmente."
      );
    }
  }

  async function handleCopyPublicLink() {
    /**
     * window.location.origin só é usado depois
     * do clique, portanto não participa da
     * renderização/hidratação.
     */
    const publicUrl =
      buildBrowserPublicOrderUrl(
        order.publicId
      );

    await copyText(
      publicUrl,
      "public_link"
    );
  }

  async function handleCopySummary() {
    const publicUrl =
      buildBrowserPublicOrderUrl(
        order.publicId
      );

    const summary =
      buildOrderSummary(
        order,
        publicUrl
      );

    await copyText(
      summary,
      "summary"
    );
  }

  return (
    <div className="space-y-6">
      {copyError ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
          {copyError}
        </div>
      ) : null}

      <UtilityCard
        title="Copiar informações"
        description="Use estes atalhos para compartilhar dados do pedido com o cliente."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={
              handleCopySummary
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
          >
            {copiedTarget ===
            "summary" ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <ClipboardCopy className="h-4 w-4" />
            )}

            {copiedTarget ===
            "summary"
              ? "Resumo copiado"
              : "Copiar resumo"}
          </button>

          <button
            type="button"
            onClick={
              handleCopyPublicLink
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
          >
            {copiedTarget ===
            "public_link" ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <Link2 className="h-4 w-4" />
            )}

            {copiedTarget ===
            "public_link"
              ? "Link copiado"
              : "Copiar link"}
          </button>
        </div>

        <Link
          href={
            publicOrderPath
          }
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 text-sm font-semibold text-white transition hover:bg-zinc-700"
        >
          <ExternalLink className="h-4 w-4" />

          Abrir página pública
        </Link>
      </UtilityCard>
    </div>
  );
}