import { prisma } from "@/lib/prisma";

export async function getStoreSettings() {
  return prisma.storeSettings.upsert({
    where: {
      id: 1,
    },
    update: {},
    create: {
      id: 1,
      storeStatus: "open",
      announcementEnabled: false,
    },
  });
}

export async function assertStoreCanAcceptOrders() {
  const settings = await getStoreSettings();

  if (settings.storeStatus === "closed") {
    throw new Error(
      settings.storeClosedMessage ||
        "A loja não está aceitando pedidos no momento."
    );
  }

  return settings;
}