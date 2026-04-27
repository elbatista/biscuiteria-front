import {
  getStoreSettings,
} from "@/lib/server/store-settings";

export type PublicStoreSettings = {
  storeStatus: "open" | "closed";
  storeClosedMessage: string | null;

  announcementEnabled: boolean;
  announcementMessage: string | null;
  announcementLinkLabel: string | null;
  announcementLinkUrl: string | null;

  canAcceptOrders: boolean;
  orderUnavailableTitle: string | null;
  orderUnavailableReason: string | null;
};

function normalizeAnnouncementLinkUrl(value: string | null | undefined) {
  if (!value) return null;

  const cleanValue = value.trim();

  if (!cleanValue) return null;

  if (
    cleanValue.startsWith("/") ||
    cleanValue.startsWith("http://") ||
    cleanValue.startsWith("https://")
  ) {
    return cleanValue;
  }

  return null;
}

export async function getPublicStoreSettings(): Promise<PublicStoreSettings> {
  const settings = await getStoreSettings();

  const storeStatus = settings.storeStatus === "closed" ? "closed" : "open";
  const canAcceptOrders = storeStatus === "open";

  const orderUnavailableTitle =
    storeStatus === "closed"
      ? "Loja temporariamente fechada"
      : null;

  const orderUnavailableReason =
    storeStatus === "closed"
      ? settings.storeClosedMessage ||
        "No momento não estamos aceitando novos pedidos."
      : null;

  return {
    announcementEnabled: settings.announcementEnabled,
    announcementMessage: settings.announcementMessage,
    announcementLinkLabel: settings.announcementLinkLabel,
    announcementLinkUrl: normalizeAnnouncementLinkUrl(settings.announcementLinkUrl),

    storeStatus,
    storeClosedMessage: settings.storeClosedMessage,

    canAcceptOrders,
    orderUnavailableTitle,
    orderUnavailableReason,
  };
}