import Badge from "@/components/Badge";
import type { StoreCollectionSummary } from "@/lib/server/store";
import CollectionsGrid from "@/components/collections/CollectionsGrid";

type LatestCollectionsPreviewProps = {
  collections: StoreCollectionSummary[];
};

export default function LatestCollectionsPreview({
  collections,
}: LatestCollectionsPreviewProps) {
  if (collections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Badge>Novas coleções</Badge>
        <h2 className="font-playfair text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Últimas coleções adicionadas
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
          Descubra novas seleções para navegar por tema, ocasião ou estilo.
        </p>
      </div>

      <CollectionsGrid collections={collections} />
    </div>
  );
}