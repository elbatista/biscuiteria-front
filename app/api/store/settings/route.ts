import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  getStoreSettings,
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

      storeStatus: settings.storeStatus,
      storeClosedMessage: settings.storeClosedMessage,

      announcementEnabled: settings.announcementEnabled,
      announcementMessage: settings.announcementMessage,
      announcementLinkLabel: settings.announcementLinkLabel,
      announcementLinkUrl: settings.announcementLinkUrl,

      faqItems,
    });

    return response;

  } catch (error) {
    console.error("STORE_SETTINGS_GET_ERROR", error);

    return NextResponse.json(
      { message: "Erro ao carregar configurações da loja." },
      { status: 500 }
    );
  }
}