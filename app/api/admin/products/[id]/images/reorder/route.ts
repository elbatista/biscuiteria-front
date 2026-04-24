import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const reorderSchema = z.object({
  imageIds: z.array(z.number().int().positive()).min(1),
});

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminAuth(request);

    const { id } = await context.params;
    const productId = Number(id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json({ message: "ID do produto inválido." }, { status: 400 });
    }

    const body = await request.json();
    const data = reorderSchema.parse(body);

    const currentImages = await prisma.productImage.findMany({
      where: { productId },
      select: { id: true },
      orderBy: { sortOrder: "asc" },
    });

    if (currentImages.length !== data.imageIds.length) {
      return NextResponse.json(
        { message: "A lista de imagens está incompleta." },
        { status: 400 }
      );
    }

    const currentIds = currentImages.map((img) => img.id).sort((a, b) => a - b);
    const nextIds = [...data.imageIds].sort((a, b) => a - b);

    if (JSON.stringify(currentIds) !== JSON.stringify(nextIds)) {
      return NextResponse.json(
        { message: "As imagens informadas não correspondem ao produto." },
        { status: 400 }
      );
    }

    await Promise.all(
      data.imageIds.map((imageId, index) =>
        prisma.productImage.update({
          where: { id: imageId },
          data: { sortOrder: index },
        })
      )
    );

    const images = await prisma.productImage.findMany({
      where: { productId },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        url: true,
        thumbUrl: true,
        altText: true,
        sortOrder: true,
      },
    });

    return NextResponse.json({
      success: true,
      images,
    });
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

    console.error("ADMIN_PRODUCT_REORDER_IMAGES_ERROR", error);
    return NextResponse.json(
      { message: "Erro ao reordenar imagens." },
      { status: 500 }
    );
  }
}