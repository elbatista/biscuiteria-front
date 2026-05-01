import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import FaqForm from "@/components/admin/faq/FaqForm";

export const metadata: Metadata = {
  title: "Nova pergunta | Admin | Biscuiteria",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NewAdminFaqPage() {
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
          Nova pergunta
        </h1>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Adicione uma pergunta frequente para ajudar os clientes da loja.
        </p>
      </section>

      <FaqForm mode="create" />
    </div>
  );
}