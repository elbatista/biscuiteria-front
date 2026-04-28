import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";

const updateStoreSettingsSchema = z.object({
  storeStatus: z.enum(["open", "closed"]),
  storeClosedMessage: z.string().trim().optional().nullable(),
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
    const data = updateStoreSettingsSchema.parse(body);

    const updated = await prisma.storeSettings.upsert({
      where: {
        id: 1,
      },
      update: {
        storeStatus: data.storeStatus,
        storeClosedMessage: emptyToNull(data.storeClosedMessage),
      },
      create: {
        id: 1,
        storeStatus: data.storeStatus,
        storeClosedMessage: emptyToNull(data.storeClosedMessage),
        announcementEnabled: false,
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

    console.error("ADMIN_SETTINGS_STORE_PUT_ERROR", error);

    return NextResponse.json(
      { message: "Erro ao salvar configurações da loja." },
      { status: 500 }
    );
  }
}