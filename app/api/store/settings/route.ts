import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  getStoreSettings,
  isStoreInVacation,
} from "@/lib/server/store-settings";

export async function GET() {
  try {
    const settings = await getStoreSettings();

    const faqItems = await prisma.faqItem.findMany({
      where: {
        active: true,
      },
      orderBy: [{ position: "asc" }, { id: "asc" }],
      select: {
        id: true,
        question: true,
        answer: true,
        position: true,
      },
    });

    const response = NextResponse.json({
      storeName: settings.storeName,

      storeStatus: settings.storeStatus,
      storeClosedMessage: settings.storeClosedMessage,

      vacationEnabled: settings.vacationEnabled,
      vacationActive: isStoreInVacation(settings),
      vacationStartsAt: settings.vacationStartsAt,
      vacationEndsAt: settings.vacationEndsAt,
      vacationMessage: settings.vacationMessage,

      announcementEnabled: settings.announcementEnabled,
      announcementMessage: settings.announcementMessage,
      announcementLinkLabel: settings.announcementLinkLabel,
      announcementLinkUrl: settings.announcementLinkUrl,

      whatsapp: settings.whatsapp,
      instagramUrl: settings.instagramUrl,
      contactEmail: settings.contactEmail,

      faqItems,
    });

    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, max-age=0"
    );

    return response;

  } catch (error) {
    console.error("STORE_SETTINGS_GET_ERROR", error);

    return NextResponse.json(
      { message: "Erro ao carregar configurações da loja." },
      { status: 500 }
    );
  }
}