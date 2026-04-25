import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";

const updateAnnouncementSettingsSchema = z.object({
  announcementEnabled: z.boolean(),
  announcementMessage: z.string().trim().optional().nullable(),
  announcementLinkLabel: z.string().trim().optional().nullable(),
  announcementLinkUrl: z.string().trim().optional().nullable(),
});

function emptyToNull(value?: string | null) {
  if (!value) return null;

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const body = await request.json();
    const data = updateAnnouncementSettingsSchema.parse(body);

    if (data.announcementEnabled && !emptyToNull(data.announcementMessage)) {
      return NextResponse.json(
        { message: "Informe a mensagem do aviso." },
        { status: 400 }
      );
    }

    const updated = await prisma.storeSettings.upsert({
      where: {
        id: 1,
      },
      update: {
        announcementEnabled: data.announcementEnabled,
        announcementMessage: emptyToNull(data.announcementMessage),
        announcementLinkLabel: emptyToNull(data.announcementLinkLabel),
        announcementLinkUrl: emptyToNull(data.announcementLinkUrl),
      },
      create: {
        id: 1,
        storeStatus: "open",
        vacationEnabled: false,

        announcementEnabled: data.announcementEnabled,
        announcementMessage: emptyToNull(data.announcementMessage),
        announcementLinkLabel: emptyToNull(data.announcementLinkLabel),
        announcementLinkUrl: emptyToNull(data.announcementLinkUrl),

        originCountry: "BR",
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message ?? "Dados inválidos." },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }

    console.error("ADMIN_SETTINGS_ANNOUNCEMENT_PUT_ERROR", error);

    return NextResponse.json(
      { message: "Erro ao salvar aviso do site." },
      { status: 500 }
    );
  }
}