import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/server/product-utils";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const updateCategorySchema = z.object({
  name: z.string().min(2, "Nome da categoria é obrigatório."),
  slug: z.string().optional().or(z.literal("")),
  isActive: z.boolean(),
  sortOrder: z.coerce.number().int().min(0, "Ordem inválida."),
});

function parseCategoryId(value: string) {
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
    const categoryId = parseCategoryId(id);

    if (!categoryId) {
      return NextResponse.json(
        { message: "ID da categoria inválido." },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Categoria não encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }

    console.error("ADMIN_CATEGORY_GET_ERROR", error);
    return NextResponse.json(
      { message: "Erro ao carregar categoria." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminAuth(request);

    const { id } = await context.params;
    const categoryId = parseCategoryId(id);

    if (!categoryId) {
      return NextResponse.json(
        { message: "ID da categoria inválido." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const data = updateCategorySchema.parse(body);

    const existing = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Categoria não encontrada." },
        { status: 404 }
      );
    }

    const normalizedName = data.name.trim();
    const normalizedSlug = slugify(data.slug?.trim() || normalizedName);

    if (!normalizedSlug) {
      return NextResponse.json(
        { message: "Slug inválido." },
        { status: 400 }
      );
    }

    const conflict = await prisma.category.findFirst({
      where: {
        id: { not: categoryId },
        OR: [{ name: normalizedName }, { slug: normalizedSlug }],
      },
      select: { id: true },
    });

    if (conflict) {
      return NextResponse.json(
        { message: "Já existe outra categoria com este nome ou slug." },
        { status: 409 }
      );
    }

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: normalizedName,
        slug: normalizedSlug,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
      include: {
        _count: {
          select: { products: true },
        },
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

    console.error("ADMIN_CATEGORY_PUT_ERROR", error);
    return NextResponse.json(
      { message: "Erro ao atualizar categoria." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminAuth(request);

    const { id } = await context.params;
    const categoryId = parseCategoryId(id);

    if (!categoryId) {
      return NextResponse.json(
        { message: "ID da categoria inválido." },
        { status: 400 }
      );
    }

    const existing = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Categoria não encontrada." },
        { status: 404 }
      );
    }

    if (existing._count.products > 0) {
      return NextResponse.json(
        {
          message:
            "Esta categoria não pode ser excluída porque está vinculada a produtos.",
        },
        { status: 409 }
      );
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({
      success: true,
      message: "Categoria excluída com sucesso.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }

    console.error("ADMIN_CATEGORY_DELETE_ERROR", error);
    return NextResponse.json(
      { message: "Erro ao excluir categoria." },
      { status: 500 }
    );
  }
}