import Link from "next/link";

import Container from "@/components/Container";
import Section from "@/components/Section";

export default function CollectionNotFoundPage() {
  return (
    <div className="bg-[var(--rose-50)] text-[var(--text-main)]">
      <Section>
        <Container>
          <div className="rounded-3xl border border-[var(--rose-100)] bg-white/80 p-8 shadow-sm sm:p-10">
            <div className="space-y-4">
              <h1 className="font-playfair text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
                Coleção não encontrada
              </h1>

              <p className="max-w-2xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
                A coleção que você tentou acessar não existe, foi removida ou
                ainda não está disponível.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/loja"
                  className="inline-flex items-center rounded-2xl border border-[var(--rose-200)] bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-[var(--rose-50)]"
                >
                  Ir para a loja
                </Link>

                <Link
                  href="/"
                  className="inline-flex items-center rounded-2xl border border-[var(--rose-200)] bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-[var(--rose-50)]"
                >
                  Voltar para a home
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}