export type ShippingOption = {
  serviceCode: string;
  serviceName: string;
  provider: string;
  priceInCents: number;
  deliveryDays: number | null;
  raw: unknown;
};

export function formatShippingLabel(option: ShippingOption) {
  if (option.deliveryDays && option.deliveryDays > 0) {
    return `${option.provider} • ${option.serviceName} • ${option.deliveryDays} dia(s)`;
  }

  return `${option.provider} • ${option.serviceName}`;
}