import Link from "next/link";
import { formatBRLFromCents } from "@/lib/format-price";
import type { CartItem } from "@/stores/cart-store";
import type { ShippingOption } from "@/lib/checkout/shipping";

type OrderSummaryCardProps = {
  items: CartItem[];
  subtotalInCents: number;
  totalItems: number;
  shippingOption: ShippingOption | null;
  isShippingRequired: boolean;
  shippingError: string | null;
  submitting: boolean;
  loadingZipCode: boolean;
  quotingShipping: boolean;
};

export default function OrderSummaryCard({
  items,
  subtotalInCents,
  totalItems,
  shippingOption,
  isShippingRequired,
  shippingError,
  submitting,
  loadingZipCode,
  quotingShipping,
}: OrderSummaryCardProps) {
  const shippingInCents = shippingOption?.priceInCents ?? 0;
  const totalInCents = subtotalInCents + shippingInCents;
  const isBusy = submitting || loadingZipCode || quotingShipping;
  const canSubmit = !isBusy && (!isShippingRequired || Boolean(shippingOption));

  return (
    <aside className="h-fit rounded-3xl border border-[var(--rose-100)] bg-white p-5 sm:sticky sm:top-24 sm:self-start sm:p-6">
      <h2 className="text-lg font-semibold text-zinc-900">Resumo do pedido</h2>

      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-start justify-between gap-3 border-b border-[var(--rose-100)] pb-4"
          >
            <div>
              <div className="text-sm font-medium text-zinc-900">{item.name}</div>
              <div className="mt-1 text-xs text-[var(--text-muted)]">
                Quantidade: {item.quantity}
              </div>
            </div>

            <div className="text-sm font-semibold text-zinc-900">
              {formatBRLFromCents(item.priceInCents * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between text-[var(--text-muted)]">
          <span>Itens</span>
          <span>{totalItems}</span>
        </div>

        <div className="flex items-center justify-between text-[var(--text-muted)]">
          <span>Subtotal</span>
          <span>{formatBRLFromCents(subtotalInCents)}</span>
        </div>

        <div className="flex items-center justify-between text-[var(--text-muted)]">
          <span>Frete</span>
          <span>
            {shippingOption
              ? formatBRLFromCents(shippingOption.priceInCents)
              : quotingShipping
                ? "Calculando..."
                : "Selecione uma opção"}
          </span>
        </div>

        {shippingOption ? (
          <div className="rounded-2xl border border-[var(--rose-100)] bg-[var(--rose-50)] px-3 py-2 text-xs text-[var(--text-muted)]">
            <div className="font-medium text-zinc-900">
              {shippingOption.provider} • {shippingOption.serviceName}
            </div>
            <div className="mt-1">
              {shippingOption.deliveryDays
                ? `Prazo estimado: ${shippingOption.deliveryDays} dia(s)`
                : "Prazo estimado indisponível"}
            </div>
          </div>
        ) : null}

        <div className="border-t border-[var(--rose-100)] pt-3">
          <div className="flex items-center justify-between text-base font-semibold text-zinc-900">
            <span>Total</span>
            <span>{formatBRLFromCents(totalInCents)}</span>
          </div>
        </div>
      </div>

      {isShippingRequired && !shippingOption && !quotingShipping ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
          Escolha uma opção de frete para continuar.
        </div>
      ) : null}

      {shippingError ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {shippingError}
        </div>
      ) : null}

      <button
        type="submit"
        form="checkout-form"
        disabled={!canSubmit}
        className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[var(--green-500)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--green-300)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting
          ? "Criando pedido..."
          : loadingZipCode
            ? "Aguardando CEP..."
            : quotingShipping
              ? "Calculando frete..."
              : "Finalizar pedido"}
      </button>

      <Link
        href="/carrinho"
        className="mt-3 inline-flex w-full items-center justify-center rounded-2xl border border-[var(--rose-100)] bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-[var(--rose-50)]"
      >
        Voltar ao carrinho
      </Link>
    </aside>
  );
}