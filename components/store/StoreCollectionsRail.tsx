import Image from "next/image";
import Link from "next/link";
import Badge from "@/components/Badge";
import type { StoreCollectionSummary } from "@/lib/server/store";
import { buildStoreHref } from "./store-query";

type StoreCollectionsRailProps = {
  collections: StoreCollectionSummary[];
  activeCollectionSlug?: string | null;
  currentCategorySlug?: string | null;
};

export default function StoreCollectionsRail({
  collections,
  activeCollectionSlug,
  currentCategorySlug,
}: StoreCollectionsRailProps) {
  if (collections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Badge>Coleções</Badge>
          <h2 className="font-playfair text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            Explore por coleções
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
            Descubra seleções especiais para presentear, decorar e encontrar
            rapidamente o estilo que você procura.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {collections.map((collection) => {
          const href = buildStoreHref({
            categoria: currentCategorySlug ?? null,
            colecao: collection.slug,
            sort: null,
          });
          const isActive = activeCollectionSlug === collection.slug;

          return (
            <Link
              key={collection.id}
              href={href}
              className={`group overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                isActive
                  ? "border-[var(--green-300)] ring-2 ring-[var(--green-100)]"
                  : "border-[var(--rose-100)]"
              }`}
            >
              <div className="relative aspect-[16/10] w-full bg-[var(--rose-50)]">
                {collection.coverImageUrl ? (
                  <Image
                    src={collection.coverImageUrl}
                    alt={collection.title}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center text-sm text-[var(--text-muted)]">
                    Coleção sem capa
                  </div>
                )}
              </div>

              <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-playfair text-xl font-semibold text-zinc-900">
                    {collection.title}
                  </h3>
                  {collection.isFeatured ? <Badge>Destaque</Badge> : null}
                </div>

                {collection.description ? (
                  <p className="line-clamp-2 text-sm leading-relaxed text-[var(--text-muted)]">
                    {collection.description}
                  </p>
                ) : null}

                <div className="text-xs font-medium text-[var(--green-500)]">
                  {collection.productCount} produto{collection.productCount === 1 ? "" : "s"}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}