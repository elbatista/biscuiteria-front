import { prisma } from "@/lib/prisma";
import { quoteShipmentWithMelhorEnvio } from "@/lib/server/melhor-envio";

export type ShippingQuoteInput = {
  zipCode: string;
  items: Array<{
    productId: number;
    quantity: number;
  }>;
};

export type NormalizedShippingOption = {
  serviceCode: string;
  serviceName: string;
  provider: string;
  priceInCents: number;
  deliveryDays: number | null;
  raw: unknown;
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function centsToReais(valueInCents: number) {
  return valueInCents / 100;
}

function gramsToKg(valueInGrams: number) {
  return valueInGrams / 1000;
}

function normalizePriceToCents(value: unknown) {
  if (typeof value === "number") {
    return Math.round(value * 100);
  }

  if (typeof value === "string") {
    const normalized = Number(value.replace(",", "."));
    if (Number.isFinite(normalized)) {
      return Math.round(normalized * 100);
    }
  }

  return 0;
}

function normalizeDeliveryDays(option: any): number | null {
  const candidates = [
    option?.delivery_time,
    option?.custom_delivery_time,
    option?.delivery_range?.max,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return candidate;
    }

    if (typeof candidate === "string" && candidate.trim()) {
      const parsed = Number(candidate);
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  return null;
}

function normalizeProvider(option: any) {
  return (
    option?.company?.name ||
    option?.company?.label ||
    option?.name ||
    "Melhor Envio"
  );
}

function normalizeServiceName(option: any) {
  return (
    option?.name ||
    option?.service_name ||
    option?.company?.name ||
    "Frete"
  );
}

function normalizeServiceCode(option: any) {
  const code =
    option?.id ??
    option?.service ??
    option?.service_code ??
    option?.company?.id;

  return String(code ?? "");
}

export async function getShippingQuote({
  zipCode,
  items,
}: ShippingQuoteInput): Promise<NormalizedShippingOption[]> {
  const destinationZipCode = onlyDigits(zipCode);
  const originZipCode = onlyDigits(process.env.MELHOR_ENVIO_ORIGIN_ZIP_CODE || "");

  if (destinationZipCode.length !== 8) {
    throw new Error("CEP de destino inválido para cotação.");
  }

  if (originZipCode.length !== 8) {
    throw new Error("MELHOR_ENVIO_ORIGIN_ZIP_CODE inválido ou não configurado.");
  }

  if (!items.length) {
    throw new Error("Carrinho vazio para cotação de frete.");
  }

  const uniqueProductIds = [...new Set(items.map((item) => item.productId))];

  const products = await prisma.product.findMany({
    where: {
      id: { in: uniqueProductIds },
      active: true,
    },
    select: {
      id: true,
      name: true,
      priceInCents: true,
      weightGrams: true,
      heightCm: true,
      widthCm: true,
      lengthCm: true,
    },
  });

  if (products.length !== uniqueProductIds.length) {
    throw new Error(
      "Um ou mais produtos do carrinho não estão disponíveis para cotação."
    );
  }

  const productMap = new Map(products.map((product) => [product.id, product]));

  const quoteProducts = items.map((item) => {
    const product = productMap.get(item.productId);

    if (!product) {
      throw new Error("Produto não encontrado para cotação.");
    }

    if (
      !product.weightGrams ||
      !product.heightCm ||
      !product.widthCm ||
      !product.lengthCm
    ) {
      throw new Error(
        `O produto "${product.name}" ainda não possui peso e dimensões cadastrados.`
      );
    }

    return {
      id: String(product.id),
      width: product.widthCm,
      height: product.heightCm,
      length: product.lengthCm,
      weight: gramsToKg(product.weightGrams),
      insurance_value: centsToReais(product.priceInCents),
      quantity: item.quantity,
    };
  });

  const result = await quoteShipmentWithMelhorEnvio({
    from: {
      postal_code: originZipCode,
    },
    to: {
      postal_code: destinationZipCode,
    },
    products: quoteProducts,
  });

  if (!Array.isArray(result)) {
    throw new Error("Resposta inesperada da cotação de frete.");
  }

  const options = result
    .filter((option: any) => !option?.error)
    .map((option: any) => ({
      serviceCode: normalizeServiceCode(option),
      serviceName: normalizeServiceName(option),
      provider: normalizeProvider(option),
      priceInCents: normalizePriceToCents(
        option?.custom_price ?? option?.price
      ),
      deliveryDays: normalizeDeliveryDays(option),
      raw: option,
    }))
    .filter((option) => option.serviceCode && option.priceInCents >= 0)
    .sort((a, b) => a.priceInCents - b.priceInCents);

  return options;
}