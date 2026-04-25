import { prisma } from "@/lib/prisma";

type VacationSettings = {
  vacationEnabled: boolean;
  vacationStartsAt: Date | null;
  vacationEndsAt: Date | null;
};

export async function getStoreSettings() {
  return prisma.storeSettings.upsert({
    where: {
      id: 1,
    },
    update: {},
    create: {
      id: 1,
      storeStatus: "open",
      vacationEnabled: false,
      announcementEnabled: false,
      originCountry: "BR",
    },
  });
}

export function isStoreInVacation(settings: VacationSettings) {
  if (!settings.vacationEnabled) {
    return false;
  }

  if (!settings.vacationStartsAt || !settings.vacationEndsAt) {
    return false;
  }

  const now = new Date();

  return now >= settings.vacationStartsAt && now <= settings.vacationEndsAt;
}

export async function assertStoreCanAcceptOrders() {
  const settings = await getStoreSettings();

  if (settings.storeStatus === "closed") {
    throw new Error(
      settings.storeClosedMessage ||
        "A loja não está aceitando pedidos no momento."
    );
  }

  if (isStoreInVacation(settings)) {
    throw new Error(
      settings.vacationMessage ||
        "A loja está em período de férias no momento."
    );
  }

  return settings;
}