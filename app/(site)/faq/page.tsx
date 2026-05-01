// app/faq/page.tsx

import type { Metadata } from "next";
import Container from "@/components/Container";
import Section from "@/components/Section";
import FaqList from "@/components/faq/FaqList";
import { getPublicFaqItems } from "@/lib/server/public-faq";

export const metadata: Metadata = {
  title: "Perguntas frequentes | Biscuit_eria",
  description:
    "Veja respostas para dúvidas frequentes sobre produtos, pedidos, produção, personalização, pagamento e envio.",
};

export default async function FaqPage() {
  const items = await getPublicFaqItems();

  return (
    <main className="bg-[var(--rose-50)] text-[var(--text-main)]">
      <Section>
        <Container>
          <div className="mx-auto max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--green-500)]">
              FAQ
            </p>

            <h1 className="mt-3 font-playfair text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
              Perguntas frequentes
            </h1>

            <p className="mt-4 text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
              Encontre respostas rápidas sobre pedidos, produção, personalização
              e envio.
            </p>

            <div className="mt-8">
              <FaqList items={items} />
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}