import Link from "next/link";

type StoreEmptyStateProps = {
  hasFilters: boolean;
};

export default function StoreEmptyState({ hasFilters }: StoreEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-[var(--rose-100)] bg-white/70 p-6">
      <div className="space-y-3">
        <h3 className="font-playfair text-2xl font-semibold text-zinc-900">
          Nenhum produto encontrado
        </h3>

        <p className="text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
          {hasFilters
            ? "Não encontramos produtos para a combinação escolhida. Tente remover um dos filtros ou explorar outra coleção."
            : "Ainda estamos cadastrando os primeiros produtos. Volte em breve ou fale comigo no WhatsApp para ver opções disponíveis."}
        </p>

        {hasFilters ? (
          <Link
            href="/loja"
            className="inline-flex items-center rounded-2xl border border-[var(--rose-200)] bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-[var(--rose-50)]"
          >
            Limpar filtros
          </Link>
        ) : null}
      </div>
    </div>
  );
}