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

const updateCollectionSchema = z
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
    isActive: z.boolean(),
    isFeatured: z.boolean(),
    sortOrder: z.coerce.number().int().min(0, "Ordem inválida."),
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

function parseCollectionId(value: string) {
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
    const collectionId = parseCollectionId(id);

    if (!collectionId) {
      return NextResponse.json(
        { message: "ID da coleção inválido." },
        { status: 400 }
      );
    }

    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!collection) {
      return NextResponse.json(
        { message: "Coleção não encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json(collection);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }

    console.error("ADMIN_COLLECTION_GET_ERROR", error);
    return NextResponse.json(
      { message: "Erro ao carregar coleção." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminAuth(request);

    const { id } = await context.params;
    const collectionId = parseCollectionId(id);

    if (!collectionId) {
      return NextResponse.json(
        { message: "ID da coleção inválido." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const data = updateCollectionSchema.parse(body);

    const existing = await prisma.collection.findUnique({
      where: { id: collectionId },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Coleção não encontrada." },
        { status: 404 }
      );
    }

    const normalizedTitle = data.title.trim();
    const normalizedSlug = slugify(data.slug?.trim() || normalizedTitle);

    if (!normalizedSlug) {
      return NextResponse.json(
        { message: "Slug inválido." },
        { status: 400 }
      );
    }

    const conflict = await prisma.collection.findFirst({
      where: {
        id: { not: collectionId },
        OR: [{ title: normalizedTitle }, { slug: normalizedSlug }],
      },
      select: { id: true },
    });

    if (conflict) {
      return NextResponse.json(
        { message: "Já existe outra coleção com este título ou slug." },
        { status: 409 }
      );
    }

    const updated = await prisma.collection.update({
      where: { id: collectionId },
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

    console.error("ADMIN_COLLECTION_PUT_ERROR", error);
    return NextResponse.json(
      { message: "Erro ao atualizar coleção." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminAuth(request);

    const { id } = await context.params;
    const collectionId = parseCollectionId(id);

    if (!collectionId) {
      return NextResponse.json(
        { message: "ID da coleção inválido." },
        { status: 400 }
      );
    }

    const existing = await prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Coleção não encontrada." },
        { status: 404 }
      );
    }

    if (existing._count.products > 0) {
      return NextResponse.json(
        {
          message:
            "Esta coleção não pode ser excluída porque está vinculada a produtos.",
        },
        { status: 409 }
      );
    }

    await prisma.collection.delete({
      where: { id: collectionId },
    });

    return NextResponse.json({
      success: true,
      message: "Coleção excluída com sucesso.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }

    console.error("ADMIN_COLLECTION_DELETE_ERROR", error);
    return NextResponse.json(
      { message: "Erro ao excluir coleção." },
      { status: 500 }
    );
  }
}