"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

import CollectionForm from "@/components/admin/collections/CollectionForm";
import type { AdminCollection } from "@/components/admin/collections/types";

type CollectionEditPageClientProps = {
  collectionId: string;
};

export default function CollectionEditPageClient({
  collectionId,
}: CollectionEditPageClientProps) {
  const [collection, setCollection] = useState<AdminCollection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCollection() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/admin/collections/${collectionId}`, {
          credentials: "include",
        });

        const data = (await response.json().catch(() => null)) as
          | AdminCollection
          | { message?: string }
          | null;

        if (!response.ok) {
          setError(
            data && "message" in data && data.message
              ? data.message
              : "Não foi possível carregar a coleção."
          );
          return;
        }

        setCollection(data as AdminCollection);
      } catch {
        setError("Erro de conexão ao carregar coleção.");
      } finally {
        setIsLoading(false);
      }
    }

    loadCollection();
  }, [collectionId]);

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
          Editar coleção
        </h1>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Atualize título, capa, período, destaque e status da coleção.
        </p>
      </section>

      {isLoading ? (
        <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 text-sm text-zinc-500 shadow-sm">
          Carregando coleção...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : collection ? (
        <CollectionForm mode="edit" initialCollection={collection} />
      ) : null}
    </div>
  );
}