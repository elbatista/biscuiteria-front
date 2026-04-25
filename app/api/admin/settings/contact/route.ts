import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";

const updateContactSettingsSchema = z.object({
  whatsapp: z.string().trim().optional().nullable(),
  instagramUrl: z.string().trim().optional().nullable(),
  contactEmail: z.string().trim().email("E-mail inválido.").optional().nullable().or(z.literal("")),
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
    const data = updateContactSettingsSchema.parse(body);

    const updated = await prisma.storeSettings.upsert({
      where: {
        id: 1,
      },
      update: {
        whatsapp: emptyToNull(data.whatsapp),
        instagramUrl: emptyToNull(data.instagramUrl),
        contactEmail: emptyToNull(data.contactEmail)?.toLowerCase() || null,
      },
      create: {
        id: 1,
        storeStatus: "open",
        vacationEnabled: false,
        announcementEnabled: false,
        originCountry: "BR",

        whatsapp: emptyToNull(data.whatsapp),
        instagramUrl: emptyToNull(data.instagramUrl),
        contactEmail: emptyToNull(data.contactEmail)?.toLowerCase() || null,
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

    console.error("ADMIN_SETTINGS_CONTACT_PUT_ERROR", error);

    return NextResponse.json(
      { message: "Erro ao salvar informações de contato." },
      { status: 500 }
    );
  }
}