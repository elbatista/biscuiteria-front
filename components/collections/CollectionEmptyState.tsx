import Link from "next/link";

type CollectionEmptyStateProps = {
  collectionSlug: string;
  hasCategoryFilter: boolean;
};

export default function CollectionEmptyState({
  collectionSlug,
  hasCategoryFilter,
}: CollectionEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-[var(--rose-100)] bg-white/70 p-6">
      <div className="space-y-3">
        <h3 className="font-playfair text-2xl font-semibold text-zinc-900">
          Nenhum produto encontrado
        </h3>

        <p className="text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
          {hasCategoryFilter
            ? "Não encontramos produtos dessa categoria dentro desta coleção. Tente remover o filtro para ver todos os itens."
            : "Ainda não há produtos ativos disponíveis nesta coleção. Volte em breve para conferir as novidades."}
        </p>

        {hasCategoryFilter ? (
          <Link
            href={`/colecoes/${collectionSlug}`}
            className="inline-flex items-center rounded-2xl border border-[var(--rose-200)] bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-[var(--rose-50)]"
          >
            Ver toda a coleção
          </Link>
        ) : null}
      </div>
    </div>
  );
}