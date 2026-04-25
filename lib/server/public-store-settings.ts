import {
  getStoreSettings,
  isStoreInVacation,
} from "@/lib/server/store-settings";

export type PublicStoreContactSettings = {
  storeName: string;
  whatsapp: string | null;
  whatsappUrl: string | null;
  instagramUrl: string | null;
  contactEmail: string | null;
  contactEmailUrl: string | null;

  announcementEnabled: boolean;
  announcementMessage: string | null;
  announcementLinkLabel: string | null;
  announcementLinkUrl: string | null;

  storeStatus: "open" | "closed";
  storeClosedMessage: string | null;

  vacationEnabled: boolean;
  vacationActive: boolean;
  vacationStartsAt: string | null;
  vacationEndsAt: string | null;
  vacationMessage: string | null;

  canAcceptOrders: boolean;
  orderUnavailableTitle: string | null;
  orderUnavailableReason: string | null;
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function normalizeWhatsappUrl(value: string | null | undefined) {
  if (!value) return null;

  const cleanValue = value.trim();

  if (!cleanValue) return null;

  if (cleanValue.startsWith("http://") || cleanValue.startsWith("https://")) {
    return cleanValue;
  }

  const digits = onlyDigits(cleanValue);

  if (!digits) return null;

  return `https://wa.me/${digits}`;
}

function normalizeInstagramUrl(value: string | null | undefined) {
  if (!value) return null;

  const cleanValue = value.trim();

  if (!cleanValue) return null;

  if (cleanValue.startsWith("http://") || cleanValue.startsWith("https://")) {
    return cleanValue;
  }

  if (cleanValue.startsWith("@")) {
    return `https://instagram.com/${cleanValue.slice(1)}`;
  }

  return `https://instagram.com/${cleanValue.replace(/^instagram\.com\//, "")}`;
}

function normalizeEmail(value: string | null | undefined) {
  if (!value) return null;

  const cleanValue = value.trim().toLowerCase();

  return cleanValue || null;
}

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

export async function getPublicStoreContactSettings(): Promise<PublicStoreContactSettings> {
  const settings = await getStoreSettings();

  const whatsapp =
    settings.whatsapp || process.env.NEXT_PUBLIC_WHATSAPP_URL || null;

  const instagramUrl =
    settings.instagramUrl || process.env.NEXT_PUBLIC_INSTAGRAM_URL || null;

  const contactEmail =
    settings.contactEmail || process.env.NEXT_PUBLIC_CONTACT_EMAIL || null;

  const normalizedEmail = normalizeEmail(contactEmail);

  const vacationActive = isStoreInVacation(settings);
  const storeStatus = settings.storeStatus === "closed" ? "closed" : "open";
  const canAcceptOrders = storeStatus === "open" && !vacationActive;

  const orderUnavailableTitle =
    storeStatus === "closed"
      ? "Loja temporariamente fechada"
      : vacationActive
        ? "Estamos em férias"
        : null;

  const orderUnavailableReason =
    storeStatus === "closed"
      ? settings.storeClosedMessage ||
        "No momento não estamos aceitando novos pedidos."
      : vacationActive
        ? settings.vacationMessage ||
          "Estamos em férias no momento. Os produtos continuam disponíveis para visualização, mas novos pedidos estão temporariamente pausados."
        : null;

  return {
    storeName: settings.storeName?.trim() || "Biscuit_eria",

    whatsapp,
    whatsappUrl: normalizeWhatsappUrl(whatsapp),
    instagramUrl: normalizeInstagramUrl(instagramUrl),
    contactEmail: normalizedEmail,
    contactEmailUrl: normalizedEmail ? `mailto:${normalizedEmail}` : null,

    announcementEnabled: settings.announcementEnabled,
    announcementMessage: settings.announcementMessage,
    announcementLinkLabel: settings.announcementLinkLabel,
    announcementLinkUrl: normalizeAnnouncementLinkUrl(
      settings.announcementLinkUrl
    ),

    storeStatus,
    storeClosedMessage: settings.storeClosedMessage,

    vacationEnabled: settings.vacationEnabled,
    vacationActive,
    vacationStartsAt: settings.vacationStartsAt?.toISOString() ?? null,
    vacationEndsAt: settings.vacationEndsAt?.toISOString() ?? null,
    vacationMessage: settings.vacationMessage,

    canAcceptOrders,
    orderUnavailableTitle,
    orderUnavailableReason,
  };
}