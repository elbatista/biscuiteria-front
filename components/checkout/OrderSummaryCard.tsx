import Link from "next/link";

import { formatBRLFromCents } from "@/lib/format-price";
import type { CartItem } from "@/stores/cart-store";

type OrderSummaryCardProps = {
  items: CartItem[];
  subtotalInCents: number;
  totalItems: number;
  submitting: boolean;
  loadingZipCode: boolean;
};

function isValidHex(value: string | null) {
  return Boolean(value && /^#[0-9A-Fa-f]{6}$/.test(value));
}

export default function OrderSummaryCard({
  items,
  subtotalInCents,
  totalItems,
  submitting,
  loadingZipCode,
}: OrderSummaryCardProps) {
  const isBusy = submitting || loadingZipCode;

  return (
    <aside className="h-fit rounded-3xl border border-[var(--rose-100)] bg-white p-5 sm:sticky sm:top-24 sm:self-start sm:p-6">
      <h2 className="text-lg font-semibold text-zinc-900">Resumo do pedido</h2>

      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-start justify-between gap-3 border-b border-[var(--rose-100)] pb-4"
          >
            <div>
              <div className="text-sm font-medium text-zinc-900">
                {item.name}
              </div>

              {item.selectedColorName ? (
                <div className="mt-1 inline-flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-zinc-200"
                    style={{
                      backgroundColor: isValidHex(item.selectedColorHex)
                        ? item.selectedColorHex ?? "#E4E4E7"
                        : "#E4E4E7",
                    }}
                    aria-hidden="true"
                  />
                  Cor: {item.selectedColorName}
                </div>
              ) : null}

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
          <span>A combinar</span>
        </div>

        <div className="flex items-center justify-between text-[var(--text-muted)]">
          <span>Pagamento</span>
          <span>A combinar</span>
        </div>

        <div className="border-t border-[var(--rose-100)] pt-3">
          <div className="flex items-center justify-between text-base font-semibold text-zinc-900">
            <span>Total parcial</span>
            <span>{formatBRLFromCents(subtotalInCents)}</span>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
            O total final pode mudar após combinar frete, prazo e forma de
            pagamento com a vendedora.
          </p>
        </div>
      </div>

      <button
        type="submit"
        form="checkout-form"
        disabled={isBusy}
        className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[var(--green-500)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--green-300)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting
          ? "Enviando pedido..."
          : loadingZipCode
            ? "Aguardando CEP..."
            : "Enviar pedido"}
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