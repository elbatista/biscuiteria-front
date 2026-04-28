import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/auth/require-auth";
import {
  generateSku,
  parsePriceToCents,
  slugify,
  uniqueFileBase,
} from "@/lib/server/product-utils";
import { uploadImageWithThumb } from "@/lib/server/blob-storage";

const productSchema = z.object({
  name: z.string().min(2, "Nome muito curto."),
  shortDescription: z.string().max(300).optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  price: z.string().min(1, "Preço obrigatório."),
  compareAtPrice: z.string().optional().or(z.literal("")),
  featured: z.enum(["true", "false"]).default("false"),
  active: z.enum(["true", "false"]).default("true"),
  weightGrams: z.string().optional().or(z.literal("")),
  heightCm: z.string().optional().or(z.literal("")),
  widthCm: z.string().optional().or(z.literal("")),
  lengthCm: z.string().optional().or(z.literal("")),
});

function parseIdArray(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return null;
    }

    const ids = parsed.map((item) => Number(item));

    if (ids.some((id) => !Number.isInteger(id) || id <= 0)) {
      return null;
    }

    return [...new Set(ids)];
  } catch {
    return null;
  }
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

async function generateUniqueSlug(name: string) {
  const baseSlug = slugify(name) || "produto";
  let slug = baseSlug;
  let counter = 1;

  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

async function generateUniqueSku(name: string) {
  let sku = generateSku(name);

  while (await prisma.product.findUnique({ where: { sku } })) {
    sku = generateSku(name);
  }

  return sku;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
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
          orderBy: {
            sortOrder: "asc",
          },
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

    return NextResponse.json(products);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }

    console.error("ADMIN_PRODUCTS_GET_ERROR", error);
    return NextResponse.json(
      { message: "Erro ao carregar produtos." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const formData = await request.formData();

    const categoryIds = parseIdArray(formData.get("categoryIds"));
    const collectionIds = parseIdArray(formData.get("collectionIds"));

    if (categoryIds === null) {
      return NextResponse.json(
        { message: "Categorias inválidas." },
        { status: 400 }
      );
    }

    if (collectionIds === null) {
      return NextResponse.json(
        { message: "Coleções inválidas." },
        { status: 400 }
      );
    }

    const [validCategories, validCollections] = await Promise.all([
      validateExistingCategoryIds(categoryIds),
      validateExistingCollectionIds(collectionIds),
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

    const parsed = productSchema.safeParse({
      name: String(formData.get("name") || "").trim(),
      shortDescription: String(formData.get("shortDescription") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      price: String(formData.get("price") || "").trim(),
      compareAtPrice: String(formData.get("compareAtPrice") || "").trim(),
      featured: String(formData.get("featured") || "false"),
      active: String(formData.get("active") || "true"),
      weightGrams: String(formData.get("weightGrams") || ""),
      heightCm: String(formData.get("heightCm") || ""),
      widthCm: String(formData.get("widthCm") || ""),
      lengthCm: String(formData.get("lengthCm") || ""),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Dados inválidos." },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const files = formData
      .getAll("images")
      .filter((item): item is File => item instanceof File && item.size > 0);

    if (files.length === 0) {
      return NextResponse.json(
        { message: "Envie pelo menos uma imagem." },
        { status: 400 }
      );
    }

    const priceInCents = parsePriceToCents(data.price);
    if (priceInCents === null || priceInCents <= 0) {
      return NextResponse.json({ message: "Preço inválido." }, { status: 400 });
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

    const slug = await generateUniqueSlug(data.name);
    const sku = await generateUniqueSku(data.name);

    const savedImages: Array<{
      url: string;
      thumbUrl: string;
      altText: string;
      sortOrder: number;
    }> = [];

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const baseName = uniqueFileBase(slug, index);

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

        savedImages.push({
          url: uploadedImage.url,
          thumbUrl: uploadedImage.thumbUrl,
          altText: data.name,
          sortOrder: index,
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
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        sku,
        shortDescription: data.shortDescription || null,
        description: data.description || null,
        priceInCents,
        compareAtPriceInCents,
        currency: "BRL",
        active: data.active === "true",
        featured: data.featured === "true",
        weightGrams,
        heightCm,
        widthCm,
        lengthCm,
        metaTitle: data.name,
        metaDescription: data.shortDescription || null,
        categories: {
          create: categoryIds.map((categoryId) => ({
            categoryId,
          })),
        },
        collections: {
          create: collectionIds.map((collectionId) => ({
            collectionId,
          })),
        },
        images: {
          create: savedImages.map((image) => ({
            url: image.url,
            thumbUrl: image.thumbUrl,
            altText: image.altText,
            sortOrder: image.sortOrder,
          })),
        },
      },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }

    console.error("ADMIN_PRODUCTS_POST_ERROR", error);
    return NextResponse.json(
      { message: "Erro ao criar produto." },
      { status: 500 }
    );
  }
}