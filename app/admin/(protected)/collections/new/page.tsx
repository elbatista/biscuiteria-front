import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import CollectionForm from "@/components/admin/collections/CollectionForm";

export const metadata: Metadata = {
  title: "Nova coleção | Admin | Biscuiteria",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NewAdminCollectionPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/collections"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 transition hover:text-zinc-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para coleções
        </Link>
      </div>

      <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--rose-500)]">
          Coleções
        </p>

        <h1 className="mt-3 font-playfair text-3xl font-semibold text-zinc-950 sm:text-4xl">
          Nova coleção
        </h1>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Crie uma coleção temática para destacar produtos da loja.
        </p>
      </section>

      <CollectionForm mode="create" />
    </div>
  );
}