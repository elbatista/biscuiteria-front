import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import { parsePriceToCents, slugify } from "@/lib/server/product-utils";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const updateProductSchema = z.object({
  name: z.string().min(2, "Nome muito curto."),
  shortDescription: z.string().max(300).optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  price: z.string().min(1, "Preço obrigatório."),
  compareAtPrice: z.string().optional().or(z.literal("")),
  featured: z.boolean(),
  active: z.boolean(),
  weightGrams: z.string().optional().or(z.literal("")),
  heightCm: z.string().optional().or(z.literal("")),
  widthCm: z.string().optional().or(z.literal("")),
  lengthCm: z.string().optional().or(z.literal("")),
  colors: z
    .array(
      z.object({
        id: z.number().int().positive().optional(),
        name: z.string().trim().min(1, "Informe o nome de todas as cores."),
        hex: z
          .string()
          .trim()
          .regex(
            /^#[0-9A-Fa-f]{6}$/,
            "Informe cores em HEX válido, como #F4A7B9."
          ),
        active: z.boolean().default(true),
        sortOrder: z.number().int().positive().optional(),
      })
    )
    .default([]),
  categoryIds: z.array(z.number().int().positive()).default([]),
  collectionIds: z.array(z.number().int().positive()).default([]),
});

const patchProductSchema = z.object({
  active: z.boolean().optional(),
});

function parseProductId(value: string) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function normalizeProductColors(
  colors: z.infer<typeof updateProductSchema>["colors"]
) {
  const names = new Set<string>();

  return colors.map((color, index) => {
    const name = color.name.trim();
    const normalizedName = name.toLowerCase();

    if (names.has(normalizedName)) {
      throw new Error("DUPLICATED_COLOR_NAME");
    }

    names.add(normalizedName);

    return {
      name,
      hex: color.hex.toUpperCase(),
      active: color.active,
      sortOrder: index + 1,
    };
  });
}

async function generateUniqueSlug(name: string, currentProductId: number) {
  const baseSlug = slugify(name) || "produto";
  let slug = baseSlug;
  let counter = 1;

  while (
    await prisma.product.findFirst({
      where: {
        slug,
        id: { not: currentProductId },
      },
      select: { id: true },
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

async function validateExistingCategoryIds(categoryIds: number[]) {
  if (categoryIds.length === 0) return true;

  const found = await prisma.category.findMany({
    where: {
      id: { in: categoryIds },
    },
    select: { id: true },
  });

  return found.length === categoryIds.length;
}

async function validateExistingCollectionIds(collectionIds: number[]) {
  if (collectionIds.length === 0) return true;

  const found = await prisma.collection.findMany({
    where: {
      id: { in: collectionIds },
    },
    select: { id: true },
  });

  return found.length === collectionIds.length;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminAuth(request);

    const { id } = await context.params;
    const productId = parseProductId(id);

    if (!productId) {
      return NextResponse.json(
        { message: "ID do produto inválido." },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
        colors: {
          orderBy: { sortOrder: "asc" },
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
          orderBy: {
            categoryId: "asc",
          },
        },
        collections: {
          include: {
            collection: {
              select: {
                id: true,
                title: true,
                slug: true,
                coverImageUrl: true,
                coverImageThumbUrl: true,
              },
            },
          },
          orderBy: {
            collectionId: "asc",
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
    const productId = parseProductId(id);

    if (!productId) {
      return NextResponse.json(
        { message: "ID do produto inválido." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const data = updateProductSchema.parse(body);
    const colors = normalizeProductColors(data.colors);

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!existingProduct) {
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

    const weightGrams = data.weightGrams ? Number(data.weightGrams) : null;
    const heightCm = data.heightCm ? Number(data.heightCm) : null;
    const widthCm = data.widthCm ? Number(data.widthCm) : null;
    const lengthCm = data.lengthCm ? Number(data.lengthCm) : null;

    const logisticsValues = [weightGrams, heightCm, widthCm, lengthCm];

    if (
      logisticsValues.some(
        (value) => value !== null && (!Number.isInteger(value) || value <= 0)
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Peso e dimensões devem ser números inteiros maiores que zero.",
        },
        { status: 400 }
      );
    }

    const [validCategories, validCollections] = await Promise.all([
      validateExistingCategoryIds(data.categoryIds),
      validateExistingCollectionIds(data.collectionIds),
    ]);

    if (!validCategories) {
      return NextResponse.json(
        { message: "Uma ou mais categorias informadas não existem." },
        { status: 400 }
      );
    }

    if (!validCollections) {
      return NextResponse.json(
        { message: "Uma ou mais coleções informadas não existem." },
        { status: 400 }
      );
    }

    const slug = await generateUniqueSlug(data.name, productId);

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: {
          name: data.name,
          slug,
          shortDescription: data.shortDescription || null,
          description: data.description || null,
          priceInCents,
          compareAtPriceInCents,
          active: data.active,
          featured: data.featured,
          weightGrams,
          heightCm,
          widthCm,
          lengthCm,
          metaTitle: data.name,
          metaDescription: data.shortDescription || null,
        },
      });

      await tx.productCategory.deleteMany({
        where: { productId },
      });

      await tx.productCollection.deleteMany({
        where: { productId },
      });

      await tx.productColor.deleteMany({
        where: { productId },
      });

      if (data.categoryIds.length > 0) {
        await tx.productCategory.createMany({
          data: data.categoryIds.map((categoryId) => ({
            productId,
            categoryId,
          })),
        });
      }

      if (data.collectionIds.length > 0) {
        await tx.productCollection.createMany({
          data: data.collectionIds.map((collectionId) => ({
            productId,
            collectionId,
          })),
        });
      }

      if (colors.length > 0) {
        await tx.productColor.createMany({
          data: colors.map((color) => ({
            productId,
            name: color.name,
            hex: color.hex,
            sortOrder: color.sortOrder,
            active: color.active,
          })),
        });
      }
    });

    const updatedProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
        colors: {
          orderBy: { sortOrder: "asc" },
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
          orderBy: {
            categoryId: "asc",
          },
        },
        collections: {
          include: {
            collection: {
              select: {
                id: true,
                title: true,
                slug: true,
                coverImageUrl: true,
                coverImageThumbUrl: true,
              },
            },
          },
          orderBy: {
            collectionId: "asc",
          },
        },
      },
    });

    if (!updatedProduct) {
      return NextResponse.json(
        { message: "Produto não encontrado após atualização." },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedProduct);
  } catch (error) {
    if (error instanceof Error && error.message === "DUPLICATED_COLOR_NAME") {
      return NextResponse.json(
        { message: "Não cadastre duas cores com o mesmo nome." },
        { status: 400 }
      );
    }

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

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminAuth(request);

    const { id } = await context.params;
    const productId = parseProductId(id);

    if (!productId) {
      return NextResponse.json(
        { message: "ID do produto inválido." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const data = patchProductSchema.parse(body);

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { message: "Nenhum campo informado para atualização." },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { message: "Produto não encontrado." },
        { status: 404 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(typeof data.active === "boolean" ? { active: data.active } : {}),
      },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
        colors: {
          orderBy: { sortOrder: "asc" },
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
          orderBy: {
            categoryId: "asc",
          },
        },
        collections: {
          include: {
            collection: {
              select: {
                id: true,
                title: true,
                slug: true,
                coverImageUrl: true,
                coverImageThumbUrl: true,
              },
            },
          },
          orderBy: {
            collectionId: "asc",
          },
        },
      },
    });

    return NextResponse.json(updatedProduct);
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

    console.error("ADMIN_PRODUCT_PATCH_ERROR", error);

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
    const productId = parseProductId(id);

    if (!productId) {
      return NextResponse.json(
        { message: "ID do produto inválido." },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        orderItems: {
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { message: "Produto não encontrado." },
        { status: 404 }
      );
    }

    if (existingProduct.orderItems.length > 0) {
      return NextResponse.json(
        {
          message:
            "Este produto não pode ser excluído porque já foi usado em pedidos.",
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