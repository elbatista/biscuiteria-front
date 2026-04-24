import Link from "next/link";

type CatalogToolbarSortOption = {
  label: string;
  href: string;
  active: boolean;
};

type CatalogToolbarFilterChip = {
  label: string;
};

type CatalogToolbarProps = {
  totalItems: number;
  itemLabelSingular?: string;
  itemLabelPlural?: string;
  sortOptions: CatalogToolbarSortOption[];
  activeFilters?: CatalogToolbarFilterChip[];
  clearFiltersHref?: string | null;
};

export default function CatalogToolbar({
  totalItems,
  itemLabelSingular = "produto",
  itemLabelPlural = "produtos",
  sortOptions,
  activeFilters = [],
  clearFiltersHref,
}: CatalogToolbarProps) {
  const itemLabel = totalItems === 1 ? itemLabelSingular : itemLabelPlural;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[var(--rose-100)] bg-white/80 p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-2">
        <div className="text-sm font-semibold text-zinc-900">
          {totalItems} {itemLabel} encontrado{totalItems === 1 ? "" : "s"}
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {activeFilters.map((filter) => (
            <span
              key={filter.label}
              className="rounded-full bg-[var(--green-50)] px-3 py-1 font-medium text-[var(--green-500)]"
            >
              {filter.label}
            </span>
          ))}

          {clearFiltersHref ? (
            <Link
              href={clearFiltersHref}
              className="rounded-full border border-[var(--rose-200)] bg-white px-3 py-1 font-medium text-zinc-700 transition hover:bg-[var(--rose-50)]"
            >
              Limpar filtros
            </Link>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {sortOptions.map((option) => (
          <Link
            key={option.label}
            href={option.href}
            className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition ${
              option.active
                ? "border-[var(--green-300)] bg-[var(--green-50)] text-[var(--green-500)]"
                : "border-[var(--rose-100)] bg-white text-zinc-700 hover:bg-[var(--rose-50)]"
            }`}
          >
            {option.label}
          </Link>
        ))}
      </div>
    </div>
  );
}