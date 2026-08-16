import { formatBRLFromCents } from "@/lib/format-price";

export function formatOrderCurrency(valueInCents: number) {
  return formatBRLFromCents(valueInCents);
}

export function formatAdminOrderDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(date);
}

export function formatAdminOrderDateLong(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(date);
}

export function formatAdminPhone(phone: string | null) {
  if (!phone) return "-";

  const digits = phone.replace(/\D/g, "");

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return phone;
}

export function formatAdminDocument(document: string | null) {
  if (!document) return "-";

  const digits = document.replace(/\D/g, "");

  if (digits.length !== 11) {
    return document;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(
    6,
    9
  )}-${digits.slice(9)}`;
}

export function formatAdminZipCode(zipCode: string | null) {
  if (!zipCode) return "-";

  const digits = zipCode.replace(/\D/g, "");

  if (digits.length !== 8) {
    return zipCode;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function normalizeAdminPriceInputToCents(value: string) {
  const normalized = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  if (!normalized.trim()) {
    return 0;
  }

  const numberValue = Number(normalized);

  if (!Number.isFinite(numberValue) || numberValue < 0) {
    return null;
  }

  return Math.round(numberValue * 100);
}

export function centsToAdminPriceInput(valueInCents: number | null | undefined) {
  if (!valueInCents) {
    return "";
  }

  return (valueInCents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function buildWhatsAppUrl({
  phone,
  customerName,
  publicId,
}: {
  phone: string | null;
  customerName: string;
  publicId: string;
}) {
  if (!phone) {
    return null;
  }

  const digits = phone.replace(/\D/g, "");

  if (digits.length < 10) {
    return null;
  }

  const phoneWithCountry = digits.startsWith("55") ? digits : `55${digits}`;

  const firstName = customerName.trim().split(/\s+/)[0] || "tudo bem";

  const message = [
    `Olá, ${firstName}!`,
    `Recebemos seu pedido ${publicId} na Biscuit_eria.`,
    "Vou te passar por aqui os detalhes de prazo, frete e pagamento.",
  ].join(" ");

  return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(
    message
  )}`;
}