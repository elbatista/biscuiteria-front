import Link from "next/link";

type ProductCollectionLink = {
  title: string;
  slug: string;
};

type ProductCategoryLink = {
  name: string;
  slug: string;
};

type ProductContextLinksProps = {
  collection: ProductCollectionLink | null;
  categories: ProductCategoryLink[];
};

export default function ProductContextLinks({
  collection,
  categories,
}: ProductContextLinksProps) {
  if (!collection && categories.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-3">
      {collection ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Coleção
          </span>
          <Link
            href={`/colecoes/${collection.slug}`}
            className="inline-flex items-center rounded-full border border-[var(--green-200)] bg-[var(--green-50)] px-3 py-1 text-sm font-medium text-[var(--green-500)] transition hover:bg-[var(--green-100)]"
          >
            {collection.title}
          </Link>
        </div>
      ) : null}

      {categories.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Categorias
          </span>

          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/loja?categoria=${category.slug}`}
              className="inline-flex items-center rounded-full border border-[var(--rose-200)] bg-white px-3 py-1 text-sm font-medium text-zinc-700 transition hover:bg-[var(--rose-50)]"
            >
              {category.name}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}