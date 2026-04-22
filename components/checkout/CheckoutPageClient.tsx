"use client";

import { useState } from "react";
import Link from "next/link";
import Container from "@/components/Container";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import OrderSummaryCard from "@/components/checkout/OrderSummaryCard";
import { useCartStore } from "@/stores/cart-store";
import type { ShippingOption } from "@/lib/checkout/shipping";

export default function CheckoutPageClient() {
  const items = useCartStore((state) => state.items);

  const subtotalInCents = useCartStore((state) =>
    state.items.reduce((acc, item) => acc + item.priceInCents * item.quantity, 0)
  );

  const totalItems = useCartStore((state) =>
    state.items.reduce((acc, item) => acc + item.quantity, 0)
  );

  const [error, setError] = useState<string | null>(null);
  const [shippingOption, setShippingOption] = useState<ShippingOption | null>(null);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    submitting: false,
    loadingZipCode: false,
    redirecting: false,
    quotingShipping: false,
  });

  const isBusy =
    formState.submitting ||
    formState.loadingZipCode ||
    formState.redirecting ||
    formState.quotingShipping;

  if (items.length === 0 && !isBusy) {
    return (
      <main className="bg-[var(--rose-50)] text-[var(--text-main)]">
        <Container>
          <div className="py-10">
            <div className="rounded-3xl border border-[var(--rose-100)] bg-white p-8 sm:p-10">
              <h1 className="font-playfair text-3xl font-semibold tracking-tight text-zinc-900">
                Seu carrinho está vazio
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
                Adicione produtos antes de seguir para o checkout.
              </p>

              <div className="mt-6">
                <Link
                  href="/loja"
                  className="inline-flex items-center justify-center rounded-2xl bg-[var(--green-500)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--green-300)]"
                >
                  Ir para a loja
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="bg-[var(--rose-50)] text-[var(--text-main)]">
      <Container>
        <div className="py-10">
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--green-500)]">
              Checkout
            </p>

            <h1 className="font-playfair text-4xl font-semibold tracking-tight text-zinc-900">
              Finalizar pedido
            </h1>

            <p className="mt-2 text-sm text-[var(--text-muted)] sm:text-base">
              Preencha seus dados, escolha o frete e finalize seu pedido.
            </p>

            {error ? (
              <div
                className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            ) : null}
          </div>

          <div
            className={[
              "grid gap-6 lg:grid-cols-[1.3fr_0.7fr]",
              isBusy ? "pointer-events-none select-none" : "",
            ].join(" ")}
            aria-hidden={isBusy ? "true" : undefined}
          >
            <CheckoutForm
              onErrorChange={setError}
              onShippingErrorChange={setShippingError}
              onShippingOptionChange={setShippingOption}
              onStateChange={setFormState}
            />

            <OrderSummaryCard
              items={items}
              subtotalInCents={subtotalInCents}
              totalItems={totalItems}
              shippingOption={shippingOption}
              isShippingRequired
              shippingError={shippingError}
              submitting={formState.submitting || formState.redirecting}
              loadingZipCode={formState.loadingZipCode}
              quotingShipping={formState.quotingShipping}
            />
          </div>
        </div>
      </Container>
    </main>
  );
}