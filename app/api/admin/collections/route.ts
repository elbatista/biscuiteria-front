import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/server/product-utils";
import { getIntSearchParam } from "@/lib/server/request-utils";

const createCollectionSchema = z
  .object({
    title: z.string().min(2, "Título da coleção é obrigatório."),
    slug: z.string().optional().or(z.literal("")),
    description: z.string().optional().or(z.literal("")),
    coverImageUrl: z.string().url("URL da capa inválida.").optional().or(z.literal("")),
    coverImageThumbUrl: z
      .string()
      .url("URL da thumb da capa inválida.")
      .optional()
      .or(z.literal("")),
    coverImageAlt: z.string().optional().or(z.literal("")),
    isActive: z.boolean().optional().default(true),
    isFeatured: z.boolean().optional().default(false),
    sortOrder: z.coerce.number().int().min(0, "Ordem inválida.").default(0),
    startsAt: z.string().optional().or(z.literal("")),
    endsAt: z.string().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    const startsAt = data.startsAt ? new Date(data.startsAt) : null;
    const endsAt = data.endsAt ? new Date(data.endsAt) : null;

    if (data.startsAt && Number.isNaN(startsAt?.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startsAt"],
        message: "Data inicial inválida.",
      });
    }

    if (data.endsAt && Number.isNaN(endsAt?.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endsAt"],
        message: "Data final inválida.",
      });
    }

    if (
      startsAt &&
      endsAt &&
      !Number.isNaN(startsAt.getTime()) &&
      !Number.isNaN(endsAt.getTime()) &&
      endsAt < startsAt
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endsAt"],
        message: "A data final não pode ser menor que a inicial.",
      });
    }
  });

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q")?.trim() || "";
    const active = searchParams.get("active");
    const featured = searchParams.get("featured");
    const page = Math.max(1, getIntSearchParam(searchParams, "page", 1));
    const pageSize = Math.min(
      100,
      Math.max(1, getIntSearchParam(searchParams, "pageSize", 20))
    );

    const where = {
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" as const } },
              { slug: { contains: q, mode: "insensitive" as const } },
              { description: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(active === "true"
        ? { isActive: true }
        : active === "false"
          ? { isActive: false }
          : {}),
      ...(featured === "true"
        ? { isFeatured: true }
        : featured === "false"
          ? { isFeatured: false }
          : {}),
    };

    const [items, total] = await Promise.all([
      prisma.collection.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: {
            select: { products: true },
          },
        },
      }),
      prisma.collection.count({ where }),
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

    console.error("ADMIN_COLLECTIONS_GET_ERROR", error);
    return NextResponse.json(
      { message: "Erro ao carregar coleções." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const body = await request.json();
    const data = createCollectionSchema.parse(body);

    const normalizedTitle = data.title.trim();
    const normalizedSlug = slugify(data.slug?.trim() || normalizedTitle);

    if (!normalizedSlug) {
      return NextResponse.json(
        { message: "Slug inválido." },
        { status: 400 }
      );
    }

    const existing = await prisma.collection.findFirst({
      where: {
        OR: [{ title: normalizedTitle }, { slug: normalizedSlug }],
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Já existe uma coleção com este título ou slug." },
        { status: 409 }
      );
    }

    const created = await prisma.collection.create({
      data: {
        title: normalizedTitle,
        slug: normalizedSlug,
        description: data.description?.trim() || null,
        coverImageUrl: data.coverImageUrl?.trim() || null,
        coverImageThumbUrl: data.coverImageThumbUrl?.trim() || null,
        coverImageAlt: data.coverImageAlt?.trim() || null,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        sortOrder: data.sortOrder,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
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

    console.error("ADMIN_COLLECTIONS_POST_ERROR", error);
    return NextResponse.json(
      { message: "Erro ao criar coleção." },
      { status: 500 }
    );
  }
}