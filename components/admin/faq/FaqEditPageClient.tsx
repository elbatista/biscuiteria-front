"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

import FaqForm from "@/components/admin/faq/FaqForm";
import type { AdminFaqItem } from "@/components/admin/faq/types";

type FaqEditPageClientProps = {
  faqItemId: string;
};

export default function FaqEditPageClient({
  faqItemId,
}: FaqEditPageClientProps) {
  const [faqItem, setFaqItem] = useState<AdminFaqItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFaqItem() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/admin/settings/faq/${faqItemId}`, {
          credentials: "include",
        });

        const data = (await response.json().catch(() => null)) as
          | AdminFaqItem
          | { message?: string }
          | null;

        if (!response.ok) {
          setError(
            data && "message" in data && data.message
              ? data.message
              : "Não foi possível carregar a pergunta."
          );
          return;
        }

        setFaqItem(data as AdminFaqItem);
      } catch {
        setError("Erro de conexão ao carregar pergunta.");
      } finally {
        setIsLoading(false);
      }
    }

    loadFaqItem();
  }, [faqItemId]);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/settings/faq"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 transition hover:text-zinc-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para FAQ
        </Link>
      </div>

      <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--rose-500)]">
          FAQ
        </p>

        <h1 className="mt-3 font-playfair text-3xl font-semibold text-zinc-950 sm:text-4xl">
          Editar pergunta
        </h1>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Atualize pergunta, resposta e status de exibição.
        </p>
      </section>

      {isLoading ? (
        <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 text-sm text-zinc-500 shadow-sm">
          Carregando pergunta...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : faqItem ? (
        <FaqForm mode="edit" initialFaqItem={faqItem} />
      ) : null}
    </div>
  );
}