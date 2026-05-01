export function formatCurrencyFromCents(value: number | null | undefined) {
  const cents = Number(value || 0);

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function centsToPriceInput(value: number | null | undefined) {
  if (!value) {
    return "";
  }

  return String((value / 100).toFixed(2)).replace(".", ",");
}

export function normalizePriceInput(value: string) {
  return value
    .replace(/[^\d,.]/g, "")
    .replace(/\./g, ",")
    .replace(/,+/g, ",");
}

export function slugifyPreview(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function sortCategoryOptions<T extends { name: string; sortOrder: number }>(
  items: T[]
) {
  return [...items].sort((a, b) => {
    const orderDiff = a.sortOrder - b.sortOrder;

    if (orderDiff !== 0) {
      return orderDiff;
    }

    return a.name.localeCompare(b.name, "pt-BR");
  });
}

export function sortCollectionOptions<
  T extends { title: string; sortOrder: number },
>(items: T[]) {
  return [...items].sort((a, b) => {
    const orderDiff = a.sortOrder - b.sortOrder;

    if (orderDiff !== 0) {
      return orderDiff;
    }

    return a.title.localeCompare(b.title, "pt-BR");
  });
}