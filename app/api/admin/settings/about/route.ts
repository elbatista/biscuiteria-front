import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import { getAboutPageSettings } from "@/lib/server/about-page-settings";

const requiredShortText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} é obrigatório.`)
    .max(max, `${label} é muito longo.`);

const requiredLongText = (label: string, max = 5000) =>
  z
    .string()
    .trim()
    .min(1, `${label} é obrigatório.`)
    .max(max, `${label} é muito longo.`);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, "Texto muito longo.")
    .optional()
    .nullable();

const optionalImageUrl = z
  .string()
  .trim()
  .max(2000, "URL da imagem é muito longa.")
  .refine(
    (value) =>
      value.length === 0 ||
      value.startsWith("/") ||
      value.startsWith("https://"),
    "URL de imagem inválida."
  )
  .optional()
  .nullable();

const updateAboutPageSettingsSchema = z.object({
  // Autora
  authorBadge: requiredShortText("Identificação da autora", 80),
  authorTitle: requiredShortText("Título da autora", 160),

  authorDescription1: requiredLongText(
    "Primeira descrição da autora"
  ),

  authorDescription2: requiredLongText(
    "Segunda descrição da autora"
  ),

  authorHighlight: requiredLongText(
    "Destaque da autora",
    1000
  ),

  // Fotos
  authorImageMainUrl: optionalImageUrl,
  authorImageMainAlt: optionalText(300),

  authorImageSecondUrl: optionalImageUrl,
  authorImageSecondAlt: optionalText(300),

  authorImageThirdUrl: optionalImageUrl,
  authorImageThirdAlt: optionalText(300),

  // Biscuit_eria
  brandBadge: requiredShortText(
    "Identificação da Biscuit_eria",
    80
  ),

  brandTitle: requiredShortText(
    "Título da Biscuit_eria",
    160
  ),

  brandDescription1: requiredLongText(
    "Primeira descrição da Biscuit_eria"
  ),

  brandDescription2: requiredLongText(
    "Segunda descrição da Biscuit_eria"
  ),

  makerName: requiredShortText(
    "Nome da autora",
    120
  ),

  city: requiredShortText(
    "Cidade",
    160
  ),

  sinceText: requiredShortText(
    "Texto de início",
    80
  ),

  // História
  historyEyebrow: requiredShortText(
    "Identificação da história",
    80
  ),

  historyTitle: requiredShortText(
    "Título da história",
    180
  ),

  historySubtitle: requiredLongText(
    "Subtítulo da história",
    1000
  ),

  historyDescription1: requiredLongText(
    "Primeiro texto da história"
  ),

  historyDescription2: requiredLongText(
    "Segundo texto da história"
  ),

  // SEO
  metaTitle: requiredShortText(
    "Título SEO",
    180
  ),

  metaDescription: requiredLongText(
    "Descrição SEO",
    500
  ),
});

function emptyToNull(value?: string | null) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0
    ? trimmed
    : null;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const settings = await getAboutPageSettings();

    return NextResponse.json(settings);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          message: "Não autorizado.",
        },
        {
          status: 401,
        }
      );
    }

    console.error(
      "ADMIN_ABOUT_SETTINGS_GET_ERROR",
      error
    );

    return NextResponse.json(
      {
        message:
          "Erro ao carregar configurações da página Sobre.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const body = await request.json();

    const data =
      updateAboutPageSettingsSchema.parse(body);

    const updated =
      await prisma.aboutPageSettings.upsert({
        where: {
          id: 1,
        },

        update: {
          // Autora
          authorBadge: data.authorBadge,
          authorTitle: data.authorTitle,
          authorDescription1:
            data.authorDescription1,
          authorDescription2:
            data.authorDescription2,
          authorHighlight:
            data.authorHighlight,

          // Fotos
          authorImageMainUrl:
            emptyToNull(
              data.authorImageMainUrl
            ),

          authorImageMainAlt:
            emptyToNull(
              data.authorImageMainAlt
            ),

          authorImageSecondUrl:
            emptyToNull(
              data.authorImageSecondUrl
            ),

          authorImageSecondAlt:
            emptyToNull(
              data.authorImageSecondAlt
            ),

          authorImageThirdUrl:
            emptyToNull(
              data.authorImageThirdUrl
            ),

          authorImageThirdAlt:
            emptyToNull(
              data.authorImageThirdAlt
            ),

          // Biscuit_eria
          brandBadge:
            data.brandBadge,

          brandTitle:
            data.brandTitle,

          brandDescription1:
            data.brandDescription1,

          brandDescription2:
            data.brandDescription2,

          makerName:
            data.makerName,

          city:
            data.city,

          sinceText:
            data.sinceText,

          // História
          historyEyebrow:
            data.historyEyebrow,

          historyTitle:
            data.historyTitle,

          historySubtitle:
            data.historySubtitle,

          historyDescription1:
            data.historyDescription1,

          historyDescription2:
            data.historyDescription2,

          // SEO
          metaTitle:
            data.metaTitle,

          metaDescription:
            data.metaDescription,
        },

        create: {
          id: 1,

          // Autora
          authorBadge:
            data.authorBadge,

          authorTitle:
            data.authorTitle,

          authorDescription1:
            data.authorDescription1,

          authorDescription2:
            data.authorDescription2,

          authorHighlight:
            data.authorHighlight,

          // Fotos
          authorImageMainUrl:
            emptyToNull(
              data.authorImageMainUrl
            ),

          authorImageMainAlt:
            emptyToNull(
              data.authorImageMainAlt
            ),

          authorImageSecondUrl:
            emptyToNull(
              data.authorImageSecondUrl
            ),

          authorImageSecondAlt:
            emptyToNull(
              data.authorImageSecondAlt
            ),

          authorImageThirdUrl:
            emptyToNull(
              data.authorImageThirdUrl
            ),

          authorImageThirdAlt:
            emptyToNull(
              data.authorImageThirdAlt
            ),

          // Biscuit_eria
          brandBadge:
            data.brandBadge,

          brandTitle:
            data.brandTitle,

          brandDescription1:
            data.brandDescription1,

          brandDescription2:
            data.brandDescription2,

          makerName:
            data.makerName,

          city:
            data.city,

          sinceText:
            data.sinceText,

          // História
          historyEyebrow:
            data.historyEyebrow,

          historyTitle:
            data.historyTitle,

          historySubtitle:
            data.historySubtitle,

          historyDescription1:
            data.historyDescription1,

          historyDescription2:
            data.historyDescription2,

          // SEO
          metaTitle:
            data.metaTitle,

          metaDescription:
            data.metaDescription,
        },
      });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message:
            error.issues[0]?.message ??
            "Dados inválidos.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          message: "Não autorizado.",
        },
        {
          status: 401,
        }
      );
    }

    console.error(
      "ADMIN_ABOUT_SETTINGS_PUT_ERROR",
      error
    );

    return NextResponse.json(
      {
        message:
          "Erro ao salvar configurações da página Sobre.",
      },
      {
        status: 500,
      }
    );
  }
}