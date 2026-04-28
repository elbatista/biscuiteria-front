import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminAuth } from "@/lib/auth/require-auth";
import { uploadImageWithThumb } from "@/lib/server/blob-storage";
import { slugify, uniqueStorageBase } from "@/lib/server/product-utils";

const uploadCollectionCoverSchema = z.object({
  title: z.string().min(2, "Título da coleção é obrigatório."),
});

export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const formData = await request.formData();

    const parsed = uploadCollectionCoverSchema.safeParse({
      title: String(formData.get("title") || "").trim(),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Dados inválidos." },
        { status: 400 }
      );
    }

    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { message: "Envie uma imagem de capa." },
        { status: 400 }
      );
    }

    const title = parsed.data.title;
    const titleSlug = slugify(title) || "colecao";
    const baseName = uniqueStorageBase(titleSlug);

    try {
      const uploadedImage = await uploadImageWithThumb({
        file,
        directory: "collections",
        baseName,
        thumb: {
          width: 400,
          height: 400,
          fit: "cover",
          quality: 82,
        },
      });

      return NextResponse.json({
        success: true,
        url: uploadedImage.url,
        thumbUrl: uploadedImage.thumbUrl,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.startsWith("INVALID_FILE_TYPE:")) {
          const invalidType = error.message.split(":")[1];
          return NextResponse.json(
            { message: `Tipo não permitido: ${invalidType}` },
            { status: 400 }
          );
        }

        if (error.message.startsWith("FILE_TOO_LARGE:")) {
          const fileName = error.message.split(":")[1];
          return NextResponse.json(
            { message: `A imagem "${fileName}" excede 1MB.` },
            { status: 400 }
          );
        }
      }

      throw error;
    }
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }

    console.error("ADMIN_COLLECTION_UPLOAD_COVER_ERROR", error);
    return NextResponse.json(
      { message: "Erro ao enviar a capa da coleção." },
      { status: 500 }
    );
  }
}