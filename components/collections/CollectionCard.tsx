import Image from "next/image";
import Link from "next/link";

import Badge from "@/components/Badge";
import type { StoreCollectionSummary } from "@/lib/server/store";

type CollectionCardProps = {
  collection: StoreCollectionSummary;
};

export default function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <Link
      href={`/colecoes/${collection.slug}`}
      className="group overflow-hidden rounded-3xl border border-[var(--rose-100)] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
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
}