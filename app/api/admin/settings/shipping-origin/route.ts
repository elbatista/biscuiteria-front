import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";

const updateShippingOriginSettingsSchema = z.object({
  originZipCode: z.string().trim().optional().nullable(),
  originStreet: z.string().trim().optional().nullable(),
  originNumber: z.string().trim().optional().nullable(),
  originDistrict: z.string().trim().optional().nullable(),
  originCity: z.string().trim().optional().nullable(),
  originState: z.string().trim().optional().nullable(),
});

function emptyToNull(value?: string | null) {
  if (!value) return null;

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function onlyDigits(value?: string | null) {
  return value?.replace(/\D/g, "") ?? "";
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const body = await request.json();
    const data = updateShippingOriginSettingsSchema.parse(body);

    const normalizedZipCode = onlyDigits(data.originZipCode);

    if (normalizedZipCode && normalizedZipCode.length !== 8) {
      return NextResponse.json(
        { message: "CEP de origem inválido." },
        { status: 400 }
      );
    }

    const updated = await prisma.storeSettings.upsert({
      where: {
        id: 1,
      },
      update: {
        originZipCode: normalizedZipCode || null,
        originStreet: emptyToNull(data.originStreet),
        originNumber: emptyToNull(data.originNumber),
        originDistrict: emptyToNull(data.originDistrict),
        originCity: emptyToNull(data.originCity),
        originState: emptyToNull(data.originState)?.toUpperCase() || null,
      },
      create: {
        id: 1,
        storeStatus: "open",
        announcementEnabled: false,

        originZipCode: normalizedZipCode || null,
        originStreet: emptyToNull(data.originStreet),
        originNumber: emptyToNull(data.originNumber),
        originDistrict: emptyToNull(data.originDistrict),
        originCity: emptyToNull(data.originCity),
        originState: emptyToNull(data.originState)?.toUpperCase() || null,
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

    console.error("ADMIN_SETTINGS_SHIPPING_ORIGIN_PUT_ERROR", error);

    return NextResponse.json(
      { message: "Erro ao salvar endereço de origem." },
      { status: 500 }
    );
  }
}