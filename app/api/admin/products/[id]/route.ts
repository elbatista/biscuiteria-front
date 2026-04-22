import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import { parsePriceToCents } from "@/lib/server/product-utils";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const updateProductSchema = z.object({
  name: z.string().min(2, "Nome do produto é obrigatório."),
  shortDescription: z
    .string()
    .min(1, "Descrição curta é obrigatória.")
    .max(300, "Descrição curta muito longa."),
  description: z.string().min(1, "Descrição completa é obrigatória."),
  price: z.string().min(1, "Preço obrigatório."),
  compareAtPrice: z.string().optional().or(z.literal("")),
  featured: z.boolean(),
  active: z.boolean(),
  weightGrams: z.string().min(1, "Peso é obrigatório."),
  heightCm: z.string().min(1, "Altura é obrigatória."),
  widthCm: z.string().min(1, "Largura é obrigatória."),
  lengthCm: z.string().min(1, "Comprimento é obrigatório."),
});

function parsePositiveInteger(value: string) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export async function GET(request: NextRequest, context: RouteContext) {
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
        slug: true,
        sku: true,
        name: true,
        shortDescription: true,
        description: true,
        priceInCents: true,
        compareAtPriceInCents: true,
        currency: true,
        active: true,
        featured: true,
        weightGrams: true,
        heightCm: true,
        widthCm: true,
        lengthCm: true,
        images: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            url: true,
            thumbUrl: true,
            altText: true,
            sortOrder: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Produto não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }

    console.error("ADMIN_PRODUCT_GET_ERROR", error);
    return NextResponse.json(
      { message: "Erro ao carregar produto." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
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

    const body = await request.json();
    const data = updateProductSchema.parse(body);

    const existing = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Produto não encontrado." },
        { status: 404 }
      );
    }

    const priceInCents = parsePriceToCents(data.price);
    if (priceInCents === null || priceInCents <= 0) {
      return NextResponse.json(
        { message: "Preço inválido." },
        { status: 400 }
      );
    }

    const compareAtPriceInCents = data.compareAtPrice
      ? parsePriceToCents(data.compareAtPrice)
      : null;

    if (
      data.compareAtPrice &&
      (compareAtPriceInCents === null || compareAtPriceInCents <= 0)
    ) {
      return NextResponse.json(
        { message: "Preço comparativo inválido." },
        { status: 400 }
      );
    }

    const weightGrams = parsePositiveInteger(data.weightGrams);
    const heightCm = parsePositiveInteger(data.heightCm);
    const widthCm = parsePositiveInteger(data.widthCm);
    const lengthCm = parsePositiveInteger(data.lengthCm);

    if (!weightGrams || !heightCm || !widthCm || !lengthCm) {
      return NextResponse.json(
        {
          message:
            "Peso e dimensões devem ser números inteiros maiores que zero.",
        },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        shortDescription: data.shortDescription,
        description: data.description,
        priceInCents,
        compareAtPriceInCents,
        active: data.active,
        featured: data.featured,
        weightGrams,
        heightCm,
        widthCm,
        lengthCm,
        metaTitle: data.name,
        metaDescription: data.shortDescription,
      },
      select: {
        id: true,
        slug: true,
        sku: true,
        name: true,
        shortDescription: true,
        description: true,
        priceInCents: true,
        compareAtPriceInCents: true,
        currency: true,
        active: true,
        featured: true,
        weightGrams: true,
        heightCm: true,
        widthCm: true,
        lengthCm: true,
        images: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            url: true,
            thumbUrl: true,
            altText: true,
            sortOrder: true,
          },
        },
      },
    });

    return NextResponse.json(product);
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

    console.error("ADMIN_PRODUCT_PUT_ERROR", error);
    return NextResponse.json(
      { message: "Erro ao atualizar produto." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
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

    const existing = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Produto não encontrado." },
        { status: 404 }
      );
    }

    const soldOrderItem = await prisma.orderItem.findFirst({
      where: {
        productId: productId,
      },
      select: {
        id: true,
      },
    });

    if (soldOrderItem) {
      return NextResponse.json(
        {
          message:
            "Este produto não pode ser excluído porque já foi vendido. Mas você pode desativá-lo para que não apareça mais na loja.",
        },
        { status: 409 }
      );
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({
      success: true,
      message: "Produto excluído com sucesso.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }

    console.error("ADMIN_PRODUCT_DELETE_ERROR", error);
    return NextResponse.json(
      { message: "Erro ao excluir produto." },
      { status: 500 }
    );
  }
}