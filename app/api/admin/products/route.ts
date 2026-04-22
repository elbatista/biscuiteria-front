import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { z } from "zod";
import { put } from "@vercel/blob";

import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/auth/require-auth";
import {
  generateSku,
  parsePriceToCents,
  slugify,
  uniqueFileBase,
} from "@/lib/server/product-utils";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 1 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

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

function getExtensionFromMime(type: string) {
  switch (type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "bin";
  }
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

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { message: `Tipo não permitido: ${file.type}` },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { message: `A imagem "${file.name}" excede 1MB.` },
          { status: 400 }
        );
      }
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
      const ext = getExtensionFromMime(file.type);
      const baseName = uniqueFileBase(slug, index);

      const originalFilename = `products/${baseName}.${ext}`;
      const thumbFilename = `products/thumbs/${baseName}.webp`;

      const originalBlob = await put(originalFilename, file, {
        access: "public",
        addRandomSuffix: false,
      });

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const thumbBuffer = await sharp(buffer)
        .resize({
          width: 400,
          height: 400,
          fit: "cover",
        })
        .webp({ quality: 82 })
        .toBuffer();

      const thumbBlob = await put(thumbFilename, thumbBuffer, {
        access: "public",
        contentType: "image/webp",
        addRandomSuffix: false,
      });

      savedImages.push({
        url: originalBlob.url,
        thumbUrl: thumbBlob.url,
        altText: data.name,
        sortOrder: index,
      });
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