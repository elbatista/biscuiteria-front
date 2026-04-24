import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";

import { requireAdminAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
    imageId: string;
  }>;
};

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminAuth(request);

    const { id, imageId } = await context.params;
    const productId = Number(id);
    const parsedImageId = Number(imageId);

    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json({ message: "ID do produto inválido." }, { status: 400 });
    }

    if (!Number.isInteger(parsedImageId) || parsedImageId <= 0) {
      return NextResponse.json({ message: "ID da imagem inválido." }, { status: 400 });
    }

    const image = await prisma.productImage.findFirst({
      where: {
        id: parsedImageId,
        productId: productId,
      },
      select: {
        id: true,
        url: true,
        thumbUrl: true,
      },
    });

    if (!image) {
      return NextResponse.json({ message: "Imagem não encontrada." }, { status: 404 });
    }

    const imageCount = await prisma.productImage.count({
      where: {
        productId: productId,
      },
    });

    if (imageCount <= 1) {
      return NextResponse.json(
        { message: "O produto deve ter pelo menos uma imagem." },
        { status: 400 }
      );
    }

    await prisma.productImage.delete({
      where: {
        id: parsedImageId,
      },
    });

    try {
      await del(image.url);
      if (image.thumbUrl) {
        await del(image.thumbUrl);
      }
    } catch (blobError) {
      console.error("BLOB_DELETE_ERROR", blobError);
    }

    const remainingImages = await prisma.productImage.findMany({
      where: { productId },
      orderBy: { sortOrder: "asc" },
      select: { id: true },
    });

    await Promise.all(
      remainingImages.map((img, index) =>
        prisma.productImage.update({
          where: { id: img.id },
          data: { sortOrder: index },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: "Imagem removida com sucesso.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }

    console.error("ADMIN_PRODUCT_DELETE_IMAGE_ERROR", error);
    return NextResponse.json(
      { message: "Erro ao remover imagem." },
      { status: 500 }
    );
  }
}