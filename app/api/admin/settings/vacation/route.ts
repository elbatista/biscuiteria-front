import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";

const updateVacationSettingsSchema = z.object({
  vacationEnabled: z.boolean(),
  vacationStartsAt: z.string().trim().optional().nullable(),
  vacationEndsAt: z.string().trim().optional().nullable(),
  vacationMessage: z.string().trim().optional().nullable(),
});

function emptyToNull(value?: string | null) {
  if (!value) return null;

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function parseOptionalDate(value?: string | null) {
  const cleanValue = emptyToNull(value);

  if (!cleanValue) {
    return null;
  }

  const date = new Date(cleanValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const body = await request.json();
    const data = updateVacationSettingsSchema.parse(body);

    const vacationStartsAt = parseOptionalDate(data.vacationStartsAt);
    const vacationEndsAt = parseOptionalDate(data.vacationEndsAt);

    if (data.vacationEnabled && (!vacationStartsAt || !vacationEndsAt)) {
      return NextResponse.json(
        { message: "Informe datas válidas para início e fim das férias." },
        { status: 400 }
      );
    }

    if (
      data.vacationEnabled &&
      vacationStartsAt &&
      vacationEndsAt &&
      vacationStartsAt > vacationEndsAt
    ) {
      return NextResponse.json(
        { message: "A data inicial das férias deve ser anterior à data final." },
        { status: 400 }
      );
    }

    const updated = await prisma.storeSettings.upsert({
      where: {
        id: 1,
      },
      update: {
        vacationEnabled: data.vacationEnabled,
        vacationStartsAt,
        vacationEndsAt,
        vacationMessage: emptyToNull(data.vacationMessage),
      },
      create: {
        id: 1,
        storeStatus: "open",
        vacationEnabled: data.vacationEnabled,
        vacationStartsAt,
        vacationEndsAt,
        vacationMessage: emptyToNull(data.vacationMessage),
        announcementEnabled: false,
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

    console.error("ADMIN_SETTINGS_VACATION_PUT_ERROR", error);

    return NextResponse.json(
      { message: "Erro ao salvar configurações de férias." },
      { status: 500 }
    );
  }
}