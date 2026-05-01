import { prisma } from "@/lib/prisma";

export async function getAdminGlobalStatus() {
  const settings = await prisma.storeSettings.findFirst({
    orderBy: {
      id: "asc",
    },
    select: {
      storeStatus: true,
      storeClosedMessage: true,
      announcementEnabled: true,
      announcementMessage: true,
      announcementLinkLabel: true,
      announcementLinkUrl: true,
    },
  });

  return {
    storeStatus: settings?.storeStatus ?? "open",
    storeClosedMessage: settings?.storeClosedMessage ?? "",
    announcementEnabled: settings?.announcementEnabled ?? false,
    announcementMessage: settings?.announcementMessage ?? "",
    announcementLinkLabel: settings?.announcementLinkLabel ?? "",
    announcementLinkUrl: settings?.announcementLinkUrl ?? "",
  };
}