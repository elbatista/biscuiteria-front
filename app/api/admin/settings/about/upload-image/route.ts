import {
  NextRequest,
  NextResponse,
} from "next/server";

import { z } from "zod";

import {
  requireAdminAuth,
} from "@/lib/auth/require-auth";

import {
  uploadOptimizedImage,
} from "@/lib/server/blob-storage";

import {
  uniqueStorageBase,
} from "@/lib/server/product-utils";

const MAX_ABOUT_IMAGE_SIZE =
  5 * 1024 * 1024;

const aboutImageSlotSchema = z.enum([
  "main",
  "second",
  "third",
]);

const ABOUT_IMAGE_NAMES = {
  main: "autora-principal",
  second: "autora-secundaria-1",
  third: "autora-secundaria-2",
} as const;

export async function POST(
  request: NextRequest
) {
  try {
    await requireAdminAuth(request);

    const formData =
      await request.formData();

    const slotResult =
      aboutImageSlotSchema.safeParse(
        String(
          formData.get("slot") || ""
        )
      );

    if (!slotResult.success) {
      return NextResponse.json(
        {
          message:
            "Posição da imagem inválida.",
        },
        {
          status: 400,
        }
      );
    }

    const file =
      formData.get("file");

    if (
      !(file instanceof File) ||
      file.size === 0
    ) {
      return NextResponse.json(
        {
          message:
            "Selecione uma imagem.",
        },
        {
          status: 400,
        }
      );
    }

    const slot =
      slotResult.data;

    const baseName =
      uniqueStorageBase(
        ABOUT_IMAGE_NAMES[slot]
      );

    try {
      const uploaded =
        await uploadOptimizedImage({
          file,

          directory: "about",

          baseName,

          maxWidth: 1600,
          maxHeight: 1600,

          quality: 85,

          maxFileSize:
            MAX_ABOUT_IMAGE_SIZE,

          allowedTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
          ],
        });

      return NextResponse.json({
        success: true,

        image: {
          slot,
          url: uploaded.url,
          width: uploaded.width,
          height: uploaded.height,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.startsWith(
            "INVALID_FILE_TYPE:"
          )
        ) {
          const invalidType =
            error.message
              .split(":")
              .slice(1)
              .join(":");

          return NextResponse.json(
            {
              message:
                `Tipo de imagem não permitido: ${
                  invalidType ||
                  "desconhecido"
                }. Use JPG, PNG ou WebP.`,
            },
            {
              status: 400,
            }
          );
        }

        if (
          error.message.startsWith(
            "FILE_TOO_LARGE:"
          )
        ) {
          return NextResponse.json(
            {
              message:
                "A imagem excede o limite de 5 MB.",
            },
            {
              status: 400,
            }
          );
        }

        if (
          error.message ===
          "INVALID_IMAGE_CONTENT"
        ) {
          return NextResponse.json(
            {
              message:
                "Não foi possível processar essa imagem. Tente outro arquivo JPG, PNG ou WebP.",
            },
            {
              status: 400,
            }
          );
        }
      }

      throw error;
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          message:
            "Não autorizado.",
        },
        {
          status: 401,
        }
      );
    }

    console.error(
      "ADMIN_ABOUT_UPLOAD_IMAGE_ERROR",
      error
    );

    return NextResponse.json(
      {
        message:
          "Erro ao enviar imagem da página Sobre.",
      },
      {
        status: 500,
      }
    );
  }
}