export type StoreQueryInput = {
  categoria?: string | null;
  colecao?: string | null;
  sort?: string | null;
};

export function buildStoreHref(input: StoreQueryInput) {
  const params = new URLSearchParams();

  if (input.categoria) {
    params.set("categoria", input.categoria);
  }

  if (input.colecao) {
    params.set("colecao", input.colecao);
  }

  if (input.sort) {
    params.set("sort", input.sort);
  }

  const query = params.toString();
  return query ? `/loja?${query}` : "/loja";
}