export type CollectionQueryInput = {
  categoria?: string | null;
  sort?: string | null;
};

export function buildCollectionHref(
  collectionSlug: string,
  input: CollectionQueryInput
) {
  const params = new URLSearchParams();

  if (input.categoria) {
    params.set("categoria", input.categoria);
  }

  if (input.sort) {
    params.set("sort", input.sort);
  }

  const query = params.toString();
  return query ? `/colecoes/${collectionSlug}?${query}` : `/colecoes/${collectionSlug}`;
}