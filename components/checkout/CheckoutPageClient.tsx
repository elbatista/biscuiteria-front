"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import Container from "@/components/Container";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import OrderSummaryCard from "@/components/checkout/OrderSummaryCard";
import ContactSupportCard from "@/components/store/ContactSupportCard";
import StoreUnavailableCard from "@/components/store/StoreUnavailableCard";
import type { PublicStoreSettings } from "@/lib/server/public-store-settings";
import { useCartStore } from "@/stores/cart-store";

type CheckoutPageClientProps = {
  settings: PublicStoreSettings;
};

export default function CheckoutPageClient({
  settings,
}: CheckoutPageClientProps) {
  const items = useCartStore((state) => state.items);

  const subtotalInCents = useCartStore((state) =>
    state.items.reduce(
      (acc, item) => acc + item.priceInCents * item.quantity,
      0
    )
  );

  const totalItems = useCartStore((state) =>
    state.items.reduce((acc, item) => acc + item.quantity, 0)
  );

  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    submitting: false,
    loadingZipCode: false,
    redirecting: false,
  });

  const isBusy =
    formState.submitting || formState.loadingZipCode || formState.redirecting;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!settings.canAcceptOrders) {
    return (
      <main className="bg-[var(--rose-50)] text-[var(--text-main)]">
        <Container>
          <div className="space-y-6 py-10">
            <StoreUnavailableCard settings={settings} />

            <ContactSupportCard
              title="Precisa falar conosco?"
              description="Entre em contato pelo WhatsApp ou e-mail para tirar dúvidas."
            />
          </div>
        </Container>
      </main>
    );
  }

  if (!mounted) {
    return (
      <main className="bg-[var(--rose-50)] text-[var(--text-main)]">
        <Container>
          <div className="py-10">
            <div className="rounded-3xl border border-[var(--rose-100)] bg-white p-8 text-sm text-[var(--text-muted)]">
              Carregando checkout...
            </div>
          </div>
        </Container>
      </main>
    );
  }

  if (items.length === 0 && !isBusy) {
    return (
      <main className="bg-[var(--rose-50)] text-[var(--text-main)]">
        <Container>
          <div className="space-y-6 py-10">
            <div className="rounded-3xl border border-[var(--rose-100)] bg-white p-8 sm:p-10">
              <h1 className="font-playfair text-3xl font-semibold tracking-tight text-zinc-900">
                Seu carrinho está vazio
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
                Adicione produtos antes de enviar seu pedido.
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

            <ContactSupportCard
              title="Está com alguma dúvida?"
              description="Fale conosco se precisar de ajuda antes de montar seu pedido."
            />
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
              Enviar pedido
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
              Preencha seus dados para enviar o pedido. A Biscuit_eria entrará
              em contato o mais breve possível para combinar prazo de produção, envio e pagamento.
            </p>

            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800">
              Nosso checkout não inclui pagamento online e não calcula frete
              automaticamente. O valor do frete e a forma de pagamento serão
              combinados diretamente com a vendedora, e adicionado ao valor total.
            </div>

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
              onStateChange={setFormState}
            />

            <div className="space-y-6">
              <OrderSummaryCard
                items={items}
                subtotalInCents={subtotalInCents}
                totalItems={totalItems}
                submitting={formState.submitting || formState.redirecting}
                loadingZipCode={formState.loadingZipCode}
              />
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}