"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Container from "@/components/Container";
import CartLineItem from "@/components/cart/CartLineItem";
import ContactSupportCard from "@/components/store/ContactSupportCard";
import StoreAvailabilityBanner from "@/components/store/StoreAvailabilityBanner";
import { formatBRLFromCents } from "@/lib/format-price";
import type { PublicStoreSettings } from "@/lib/server/public-store-settings";
import { useCartStore } from "@/stores/cart-store";

type CartPageClientProps = {
  settings: PublicStoreSettings;
};

export default function CartPageClient({ settings }: CartPageClientProps) {
  const items = useCartStore((state) => state.items);
  const subtotalInCents = useCartStore((state) => state.subtotalInCents);
  const totalItems = useCartStore((state) => state.totalItems);
  const clearCart = useCartStore((state) => state.clearCart);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = mounted ? subtotalInCents() : 0;
  const total = mounted ? totalItems() : 0;

  return (
    <main className="bg-[var(--rose-50)] text-[var(--text-main)]">
      <Container>
        <div className="py-10">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--green-500)]">
                Carrinho
              </p>

              <h1 className="font-playfair text-4xl font-semibold tracking-tight text-zinc-900">
                Seus produtos
              </h1>

              <p className="mt-2 text-sm text-[var(--text-muted)] sm:text-base">
                Revise os itens adicionados antes de seguir para o checkout.
              </p>
            </div>

            {mounted && items.length > 0 ? (
              <button
                type="button"
                onClick={clearCart}
                className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-[var(--rose-200)] bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-[var(--rose-50)]"
              >
                Limpar carrinho
              </button>
            ) : null}
          </div>

          {!mounted ? (
            <div className="rounded-3xl border border-[var(--rose-100)] bg-white p-6">
              <p className="text-sm text-[var(--text-muted)]">
                Carregando carrinho...
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="space-y-6">
              <StoreAvailabilityBanner settings={settings} />

              <div className="rounded-3xl border border-[var(--rose-100)] bg-white p-8 sm:p-10">
                <h2 className="text-2xl font-semibold text-zinc-900">
                  Seu carrinho está vazio
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
                  Adicione produtos da loja para começar a montar seu pedido.
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
                title="Dúvidas antes de escolher?"
                description="Fale conosco se quiser ajuda para encontrar o produto ideal."
              />
            </div>
          ) : (
            <div className="space-y-6">
              <StoreAvailabilityBanner settings={settings} />

              <div className="grid gap-6 lg:grid-cols-[1.6fr_0.8fr]">
                <div className="space-y-4">
                  {items.map((item) => (
                    <CartLineItem key={item.productId} item={item} />
                  ))}
                </div>

                <aside className="h-fit space-y-6">
                  <div className="rounded-3xl border border-[var(--rose-100)] bg-white p-5 sm:p-6">
                    <h2 className="text-lg font-semibold text-zinc-900">
                      Resumo do pedido
                    </h2>

                    <div className="mt-5 space-y-3 text-sm">
                      <div className="flex items-center justify-between text-[var(--text-muted)]">
                        <span>Itens</span>
                        <span>{total}</span>
                      </div>

                      <div className="flex items-center justify-between text-[var(--text-muted)]">
                        <span>Subtotal</span>
                        <span>{formatBRLFromCents(subtotal)}</span>
                      </div>

                      <div className="border-t border-[var(--rose-100)] pt-3">
                        <div className="flex items-center justify-between text-base font-semibold text-zinc-900">
                          <span>Total</span>
                          <span>{formatBRLFromCents(subtotal)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <Link
                        href="/loja"
                        className="inline-flex w-full items-center justify-center rounded-2xl border border-[var(--rose-100)] bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-[var(--rose-50)]"
                      >
                        Continuar comprando
                      </Link>

                      {settings.canAcceptOrders ? (
                        <Link
                          href="/checkout"
                          className="inline-flex w-full items-center justify-center rounded-2xl bg-[var(--green-500)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--green-300)]"
                        >
                          Ir para checkout
                        </Link>
                      ) : (
                        <div className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-2xl bg-zinc-200 px-5 py-3 text-center text-sm font-semibold text-zinc-500">
                          Checkout indisponível
                        </div>
                      )}
                    </div>
                  </div>

                  <ContactSupportCard
                    title="Precisa de ajuda com o pedido?"
                    description="Chame no WhatsApp ou envie um e-mail antes de finalizar."
                    compact
                  />
                </aside>
              </div>
            </div>
          )}
        </div>
      </Container>
    </main>
  );
}