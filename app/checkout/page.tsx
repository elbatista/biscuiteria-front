// import type { Metadata } from "next";
// import CheckoutPageClient from "@/components/checkout/CheckoutPageClient";
// import { getPublicStoreSettings } from "@/lib/server/public-store-settings";
// import AnnouncementBar from "@/components/AnnouncementBar";

// export const metadata: Metadata = {
//   title: "Checkout | Biscuit_eria",
//   description: "Finalize seu pedido na Biscuit_eria.",
// };

// export default async function CheckoutPage() {
//   const settings = await getPublicStoreSettings()
//   return (
//     <>
//     <AnnouncementBar/>
//     <CheckoutPageClient settings={settings} />
//     </>
//   );
// }

import type { Metadata } from "next";
import Link from "next/link";
import { Clock, ShoppingBag } from "lucide-react";

import AnnouncementBar from "@/components/AnnouncementBar";
import Container from "@/components/Container";

export const metadata: Metadata = {
  title: "Checkout em breve | Biscuit_eria",
  description: "O checkout da Biscuit_eria ainda está em implementação.",
};

export default function CheckoutPage() {
  return (
    <>
      <AnnouncementBar />

      <main className="bg-[var(--rose-50)] text-[var(--text-main)]">
        <Container>
          <div className="flex min-h-[70vh] items-center justify-center py-10">
            <section className="w-full max-w-3xl rounded-3xl border border-[var(--rose-100)] bg-white p-8 text-center shadow-sm sm:p-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--rose-50)] text-[var(--green-500)]">
                <Clock className="h-8 w-8" aria-hidden="true" />
              </div>

              <p className="mt-6 text-sm font-medium uppercase tracking-[0.18em] text-[var(--green-500)]">
                Checkout em implementação
              </p>

              <h1 className="mt-3 font-playfair text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
                Estamos preparando o checkout
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
                Ainda estamos implementando a finalização de pedidos na
                Biscuit_eria. Em breve você poderá concluir sua compra
                diretamente por aqui.
              </p>

              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
                Volte em breve para finalizar seu pedido. Obrigado pela
                compreensão!
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/loja"
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-[var(--green-500)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--green-300)] sm:w-auto"
                >
                  <ShoppingBag className="mr-2 h-4 w-4" aria-hidden="true" />
                  Voltar para a loja
                </Link>

                <Link
                  href="/"
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-[var(--rose-100)] bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-[var(--rose-50)] sm:w-auto"
                >
                  Ir para a página inicial
                </Link>
              </div>
            </section>
          </div>
        </Container>
      </main>
    </>
  );
}