import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/server/product-utils";
import { getIntSearchParam } from "@/lib/server/request-utils";

const createCategorySchema = z.object({
  name: z.string().min(2, "Nome da categoria é obrigatório."),
  slug: z.string().optional().or(z.literal("")),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.coerce.number().int().min(0, "Ordem inválida.").default(0),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q")?.trim() || "";
    const active = searchParams.get("active");
    const page = Math.max(1, getIntSearchParam(searchParams, "page", 1));
    const pageSize = Math.min(
      100,
      Math.max(1, getIntSearchParam(searchParams, "pageSize", 20))
    );

    const where = {
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { slug: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(active === "true"
        ? { isActive: true }
        : active === "false"
          ? { isActive: false }
          : {}),
    };

    const [items, total] = await Promise.all([
      prisma.category.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: {
            select: { products: true },
          },
        },
      }),
      prisma.category.count({ where }),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }

    console.error("ADMIN_CATEGORIES_GET_ERROR", error);
    return NextResponse.json(
      { message: "Erro ao carregar categorias." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const body = await request.json();
    const data = createCategorySchema.parse(body);

    const normalizedName = data.name.trim();
    const normalizedSlug = slugify(data.slug?.trim() || normalizedName);

    if (!normalizedSlug) {
      return NextResponse.json(
        { message: "Slug inválido." },
        { status: 400 }
      );
    }

    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ name: normalizedName }, { slug: normalizedSlug }],
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Já existe uma categoria com este nome ou slug." },
        { status: 409 }
      );
    }

    const created = await prisma.category.create({
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

    return NextResponse.json(created, { status: 201 });
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

    console.error("ADMIN_CATEGORIES_POST_ERROR", error);
    return NextResponse.json(
      { message: "Erro ao criar categoria." },
      { status: 500 }
    );
  }
}