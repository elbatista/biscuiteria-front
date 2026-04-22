export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function generateSku(name: string) {
  const base = slugify(name).replace(/-/g, "").slice(0, 8).toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${base || "PROD"}-${random}`;
}

export function uniqueFileBase(slug: string, index: number) {
  return `${slug}-${Date.now()}-${index + 1}`;
}

export function parsePriceToCents(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const numberValue = Number(normalized);
  if (Number.isNaN(numberValue) || numberValue < 0) return null;
  return Math.round(numberValue * 100);
}