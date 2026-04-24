import { NextRequest, NextResponse } from "next/server";

import { requireAdminAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import { slugify, uniqueFileBase } from "@/lib/server/product-utils";
import { uploadImageWithThumb } from "@/lib/server/blob-storage";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminAuth(request);

    const { id } = await context.params;
    const productId = Number(id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json(
        { message: "ID do produto inválido." },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        slug: true,
        images: {
          orderBy: { sortOrder: "asc" },
          select: { id: true, sortOrder: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Produto não encontrado." },
        { status: 404 }
      );
    }

    const formData = await request.formData();

    const files = formData
      .getAll("images")
      .filter((item): item is File => item instanceof File && item.size > 0);

    if (files.length === 0) {
      return NextResponse.json(
        { message: "Envie pelo menos uma imagem." },
        { status: 400 }
      );
    }

    const baseSlug = product.slug || slugify(product.name) || "produto";
    let nextSortOrder =
      product.images.length > 0
        ? Math.max(...product.images.map((img) => img.sortOrder)) + 1
        : 0;

    const createdImages = [];

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const baseName = uniqueFileBase(baseSlug, nextSortOrder);

      try {
        const uploadedImage = await uploadImageWithThumb({
          file,
          directory: "products",
          baseName,
          thumb: {
            width: 400,
            height: 400,
            fit: "cover",
            quality: 82,
          },
        });

        const created = await prisma.productImage.create({
          data: {
            productId,
            url: uploadedImage.url,
            thumbUrl: uploadedImage.thumbUrl,
            altText: product.name,
            sortOrder: nextSortOrder,
          },
          select: {
            id: true,
            url: true,
            thumbUrl: true,
            altText: true,
            sortOrder: true,
          },
        });

        createdImages.push(created);
        nextSortOrder += 1;
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
    }

    return NextResponse.json({
      success: true,
      images: createdImages,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }

    console.error("ADMIN_PRODUCT_ADD_IMAGES_ERROR", error);
    return NextResponse.json(
      { message: "Erro ao adicionar imagens." },
      { status: 500 }
    );
  }
}