import { Store } from "lucide-react";
import type { PublicStoreSettings } from "@/lib/server/public-store-settings";

type StoreAvailabilityBannerProps = {
  settings: PublicStoreSettings;
};

export default function StoreAvailabilityBanner({
  settings,
}: StoreAvailabilityBannerProps) {
  if (settings.canAcceptOrders) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-950 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100">
            <Store className="h-5 w-5" />
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

          <p className="mt-3 text-sm leading-relaxed">
            Você ainda pode navegar pelos produtos e revisar seu carrinho, mas o
            checkout está temporariamente bloqueado.
          </p>
        </div>
      </div>
    </div>
  );
}