import Link from "next/link";

import type { StoreCategorySummary } from "@/lib/server/store";
import { buildCollectionHref } from "./collection-query";

type CollectionCategoryFiltersProps = {
  collectionSlug: string;
  categories: StoreCategorySummary[];
  activeCategorySlug?: string | null;
  currentSort?: string | null;
};

export default function CollectionCategoryFilters({
  collectionSlug,
  categories,
  activeCategorySlug,
  currentSort,
}: CollectionCategoryFiltersProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-900">
          Categorias dentro da coleção
        </h3>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Refine os produtos desta coleção por categoria.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={buildCollectionHref(collectionSlug, {
            categoria: null,
            sort: currentSort ?? null,
          })}
          className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition ${
            !activeCategorySlug
              ? "border-[var(--green-300)] bg-[var(--green-50)] text-[var(--green-500)]"
              : "border-[var(--rose-100)] bg-white text-zinc-700 hover:bg-[var(--rose-50)]"
          }`}
        >
          Todas
        </Link>

        {categories.map((category) => {
          const isActive = activeCategorySlug === category.slug;

          return (
            <Link
              key={category.id}
              href={buildCollectionHref(collectionSlug, {
                categoria: category.slug,
                sort: currentSort ?? null,
              })}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "border-[var(--green-300)] bg-[var(--green-50)] text-[var(--green-500)]"
                  : "border-[var(--rose-100)] bg-white text-zinc-700 hover:bg-[var(--rose-50)]"
              }`}
            >
              <span>{category.name}</span>
              <span className="text-xs opacity-80">({category.productCount})</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}