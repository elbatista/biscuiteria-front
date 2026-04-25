import { NextRequest, NextResponse } from "next/server";

import { requireAdminAuth } from "@/lib/auth/require-auth";
import { getStoreSettings } from "@/lib/server/store-settings";

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const settings = await getStoreSettings();

    return NextResponse.json(settings);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }

    console.error("ADMIN_SETTINGS_GET_ERROR", error);

    return NextResponse.json(
      { message: "Erro ao carregar configurações." },
      { status: 500 }
    );
  }
}