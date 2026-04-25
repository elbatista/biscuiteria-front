import { CalendarX, Store } from "lucide-react";
import type { PublicStoreContactSettings } from "@/lib/server/public-store-settings";

type StoreAvailabilityBannerProps = {
  settings: PublicStoreContactSettings;
};

function formatDateBR(value: string | null) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function StoreAvailabilityBanner({
  settings,
}: StoreAvailabilityBannerProps) {
  if (settings.canAcceptOrders) {
    return null;
  }

  const startsAt = formatDateBR(settings.vacationStartsAt);
  const endsAt = formatDateBR(settings.vacationEndsAt);

  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-950 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100">
          {settings.vacationActive ? (
            <CalendarX className="h-5 w-5" />
          ) : (
            <Store className="h-5 w-5" />
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold">
            {settings.orderUnavailableTitle ||
              "Loja temporariamente indisponível"}
          </h2>

          <p className="mt-2 text-sm leading-relaxed">
            {settings.orderUnavailableReason ||
              "No momento não estamos aceitando novos pedidos."}
          </p>

          {settings.vacationActive && startsAt && endsAt ? (
            <p className="mt-2 text-sm font-medium">
              Período: {startsAt} a {endsAt}
            </p>
          ) : null}

          <p className="mt-3 text-sm leading-relaxed">
            Você ainda pode navegar pelos produtos e revisar seu carrinho, mas o
            checkout está temporariamente bloqueado.
          </p>
        </div>
      </div>
    </div>
  );
}