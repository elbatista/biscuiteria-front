import type { StoreCollectionSummary } from "@/lib/server/store";
import CollectionCard from "./CollectionCard";

type CollectionsGridProps = {
  collections: StoreCollectionSummary[];
};

export default function CollectionsGrid({ collections }: CollectionsGridProps) {
  if (collections.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {collections.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  );
}