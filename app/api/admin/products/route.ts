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

function createRequestId() {
  return `product-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getErrorDetails(error: unknown) {
  if (error instanceof Error) {
    const value = error as Error & {
      code?: string;
      meta?: unknown;
      cause?: unknown;
      clientVersion?: string;
    };

    return {
      name: value.name,
      message: value.message,
      code: value.code,
      meta: value.meta,
      cause: value.cause,
      clientVersion: value.clientVersion,
      stack: value.stack,
    };
  }

  return {
    value: String(error),
  };
}

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

const productColorSchema = z.object({
  id: z.number().int().positive().optional(),

  name: z
    .string()
    .trim()
    .min(1, "Informe o nome de todas as cores."),

  hex: z
    .string()
    .trim()
    .regex(
      /^#[0-9A-Fa-f]{6}$/,
      "Informe cores em HEX válido, como #F4A7B9."
    ),

  active: z.boolean().default(true),

  sortOrder: z
    .number()
    .int()
    .positive()
    .optional(),
});

function parseProductColors(
  value: FormDataEntryValue | null
) {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return null;
    }

    const colors = parsed
      .map((item, index) =>
        productColorSchema.parse({
          ...item,
          sortOrder: index + 1,
        })
      )
      .map((color, index) => ({
        name: color.name.trim(),
        hex: color.hex.toUpperCase(),
        active: color.active,
        sortOrder: index + 1,
      }));

    const names = new Set<string>();

    for (const color of colors) {
      const normalizedName =
        color.name.toLowerCase();

      if (names.has(normalizedName)) {
        return null;
      }

      names.add(normalizedName);
    }

    return colors;
  } catch {
    return null;
  }
}

function parseIdArray(
  value: FormDataEntryValue | null
) {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return null;
    }

    const ids = parsed.map((item) =>
      Number(item)
    );

    if (
      ids.some(
        (id) =>
          !Number.isInteger(id) ||
          id <= 0
      )
    ) {
      return null;
    }

    return [...new Set(ids)];
  } catch {
    return null;
  }
}

async function validateExistingCategoryIds(
  categoryIds: number[]
) {
  if (categoryIds.length === 0) {
    return true;
  }

  const found =
    await prisma.category.findMany({
      where: {
        id: {
          in: categoryIds,
        },
      },

      select: {
        id: true,
      },
    });

  return (
    found.length ===
    categoryIds.length
  );
}

async function validateExistingCollectionIds(
  collectionIds: number[]
) {
  if (collectionIds.length === 0) {
    return true;
  }

  const found =
    await prisma.collection.findMany({
      where: {
        id: {
          in: collectionIds,
        },
      },

      select: {
        id: true,
      },
    });

  return (
    found.length ===
    collectionIds.length
  );
}

async function generateUniqueSlug(
  name: string
) {
  const baseSlug =
    slugify(name) || "produto";

  let slug = baseSlug;
  let counter = 1;

  while (
    await prisma.product.findUnique({
      where: {
        slug,
      },
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

async function generateUniqueSku(
  name: string
) {
  let sku =
    generateSku(name);

  while (
    await prisma.product.findUnique({
      where: {
        sku,
      },
    })
  ) {
    sku =
      generateSku(name);
  }

  return sku;
}

export async function GET(
  request: NextRequest
) {
  try {
    await requireAdminAuth(request);

    const products =
      await prisma.product.findMany({
        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,

          shortDescription:
            true,

          description:
            true,

          priceInCents:
            true,

          compareAtPriceInCents:
            true,

          currency: true,

          active: true,
          featured: true,

          weightGrams:
            true,

          heightCm: true,
          widthCm: true,
          lengthCm: true,

          images: {
            orderBy: {
              sortOrder:
                "asc",
            },

            select: {
              id: true,
              url: true,
              thumbUrl: true,
              altText: true,
              sortOrder: true,
            },
          },

          colors: {
            orderBy: {
              sortOrder:
                "asc",
            },

            select: {
              id: true,
              name: true,
              hex: true,
              sortOrder: true,
              active: true,
            },
          },
        },
      });

    return NextResponse.json(
      products
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          message:
            "Não autorizado.",
        },
        {
          status: 401,
        }
      );
    }

    console.error(
      "ADMIN_PRODUCTS_GET_ERROR",
      error
    );

    return NextResponse.json(
      {
        message:
          "Erro ao carregar produtos.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: NextRequest
) {
  const requestId =
    createRequestId();

  let stage = "start";

  try {
    console.log(
      "[ADMIN_PRODUCT_CREATE]",
      {
        requestId,
        stage,
        message:
          "Iniciando criação do produto",
      }
    );

    stage = "auth";

    await requireAdminAuth(
      request
    );

    console.log(
      "[ADMIN_PRODUCT_CREATE]",
      {
        requestId,
        stage,
        message:
          "Autenticação OK",
      }
    );

    stage = "form-data";

    const formData =
      await request.formData();

    const rawName =
      String(
        formData.get(
          "name"
        ) || ""
      ).trim();

    const rawImages =
      formData.getAll(
        "images"
      );

    console.log(
      "[ADMIN_PRODUCT_CREATE]",
      {
        requestId,
        stage,
        message:
          "FormData recebido",

        productName:
          rawName,

        imageEntries:
          rawImages.length,

        hasCategories:
          Boolean(
            formData.get(
              "categoryIds"
            )
          ),

        hasCollections:
          Boolean(
            formData.get(
              "collectionIds"
            )
          ),

        hasColors:
          Boolean(
            formData.get(
              "colors"
            )
          ),
      }
    );

    stage =
      "parse-relations";

    const categoryIds =
      parseIdArray(
        formData.get(
          "categoryIds"
        )
      );

    const collectionIds =
      parseIdArray(
        formData.get(
          "collectionIds"
        )
      );

    const colors =
      parseProductColors(
        formData.get(
          "colors"
        )
      );

    console.log(
      "[ADMIN_PRODUCT_CREATE]",
      {
        requestId,
        stage,

        categoryIds,

        collectionIds,

        colorCount:
          Array.isArray(
            colors
          )
            ? colors.length
            : null,
      }
    );

    if (
      categoryIds === null
    ) {
      console.warn(
        "[ADMIN_PRODUCT_CREATE_VALIDATION]",
        {
          requestId,
          stage,
          error:
            "INVALID_CATEGORIES",
        }
      );

      return NextResponse.json(
        {
          message:
            "Categorias inválidas.",
          requestId,
        },
        {
          status: 400,
        }
      );
    }

    if (
      collectionIds ===
      null
    ) {
      console.warn(
        "[ADMIN_PRODUCT_CREATE_VALIDATION]",
        {
          requestId,
          stage,
          error:
            "INVALID_COLLECTIONS",
        }
      );

      return NextResponse.json(
        {
          message:
            "Coleções inválidas.",
          requestId,
        },
        {
          status: 400,
        }
      );
    }

    if (colors === null) {
      console.warn(
        "[ADMIN_PRODUCT_CREATE_VALIDATION]",
        {
          requestId,
          stage,
          error:
            "INVALID_COLORS",
        }
      );

      return NextResponse.json(
        {
          message:
            "Cores inválidas. Confira nomes únicos e códigos HEX.",
          requestId,
        },
        {
          status: 400,
        }
      );
    }

    stage =
      "validate-relations";

    console.log(
      "[ADMIN_PRODUCT_CREATE]",
      {
        requestId,
        stage,

        message:
          "Validando categorias e coleções no banco",
      }
    );

    const [
      validCategories,
      validCollections,
    ] =
      await Promise.all([
        validateExistingCategoryIds(
          categoryIds
        ),

        validateExistingCollectionIds(
          collectionIds
        ),
      ]);

    console.log(
      "[ADMIN_PRODUCT_CREATE]",
      {
        requestId,
        stage,
        validCategories,
        validCollections,
      }
    );

    if (!validCategories) {
      return NextResponse.json(
        {
          message:
            "Uma ou mais categorias informadas não existem.",

          requestId,
        },

        {
          status: 400,
        }
      );
    }

    if (!validCollections) {
      return NextResponse.json(
        {
          message:
            "Uma ou mais coleções informadas não existem.",

          requestId,
        },

        {
          status: 400,
        }
      );
    }

    stage =
      "validate-product-data";

    const parsed =
      productSchema.safeParse({
        name: rawName,

        shortDescription:
          String(
            formData.get(
              "shortDescription"
            ) || ""
          ).trim(),

        description:
          String(
            formData.get(
              "description"
            ) || ""
          ).trim(),

        price:
          String(
            formData.get(
              "price"
            ) || ""
          ).trim(),

        compareAtPrice:
          String(
            formData.get(
              "compareAtPrice"
            ) || ""
          ).trim(),

        featured:
          String(
            formData.get(
              "featured"
            ) || "false"
          ),

        active:
          String(
            formData.get(
              "active"
            ) || "true"
          ),

        weightGrams:
          String(
            formData.get(
              "weightGrams"
            ) || ""
          ),

        heightCm:
          String(
            formData.get(
              "heightCm"
            ) || ""
          ),

        widthCm:
          String(
            formData.get(
              "widthCm"
            ) || ""
          ),

        lengthCm:
          String(
            formData.get(
              "lengthCm"
            ) || ""
          ),
      });

    if (
      !parsed.success
    ) {
      console.warn(
        "[ADMIN_PRODUCT_CREATE_VALIDATION]",
        {
          requestId,
          stage,
          issues:
            parsed.error
              .issues,
        }
      );

      return NextResponse.json(
        {
          message:
            parsed.error
              .issues[0]
              ?.message ||
            "Dados inválidos.",

          requestId,
        },

        {
          status: 400,
        }
      );
    }

    const data =
      parsed.data;

    console.log(
      "[ADMIN_PRODUCT_CREATE]",
      {
        requestId,
        stage,

        message:
          "Dados principais validados",

        productName:
          data.name,

        active:
          data.active,

        featured:
          data.featured,
      }
    );

    stage =
      "validate-images";

    const files =
      rawImages.filter(
        (
          item
        ): item is File =>
          item instanceof
            File &&
          item.size > 0
      );

    console.log(
      "[ADMIN_PRODUCT_CREATE]",
      {
        requestId,
        stage,

        files:
          files.map(
            (file) => ({
              name:
                file.name,

              type:
                file.type,

              size:
                file.size,
            })
          ),
      }
    );

    if (
      files.length === 0
    ) {
      return NextResponse.json(
        {
          message:
            "Envie pelo menos uma imagem.",

          requestId,
        },

        {
          status: 400,
        }
      );
    }

    stage =
      "parse-prices";

    const priceInCents =
      parsePriceToCents(
        data.price
      );

    if (
      priceInCents ===
        null ||
      priceInCents <= 0
    ) {
      console.warn(
        "[ADMIN_PRODUCT_CREATE_VALIDATION]",
        {
          requestId,
          stage,
          rawPrice:
            data.price,
        }
      );

      return NextResponse.json(
        {
          message:
            "Preço inválido.",

          requestId,
        },

        {
          status: 400,
        }
      );
    }

    const compareAtPriceInCents =
      data.compareAtPrice
        ? parsePriceToCents(
            data.compareAtPrice
          )
        : null;

    if (
      data.compareAtPrice &&
      (compareAtPriceInCents ===
        null ||
        compareAtPriceInCents <=
          0)
    ) {
      return NextResponse.json(
        {
          message:
            "Preço comparativo inválido.",

          requestId,
        },

        {
          status: 400,
        }
      );
    }

    stage =
      "parse-logistics";

    const weightGrams =
      data.weightGrams
        ? Number(
            data.weightGrams
          )
        : null;

    const heightCm =
      data.heightCm
        ? Number(
            data.heightCm
          )
        : null;

    const widthCm =
      data.widthCm
        ? Number(
            data.widthCm
          )
        : null;

    const lengthCm =
      data.lengthCm
        ? Number(
            data.lengthCm
          )
        : null;

    console.log(
      "[ADMIN_PRODUCT_CREATE]",
      {
        requestId,
        stage,
        weightGrams,
        heightCm,
        widthCm,
        lengthCm,
      }
    );

    const logisticsValues =
      [
        weightGrams,
        heightCm,
        widthCm,
        lengthCm,
      ];

    if (
      logisticsValues.some(
        (value) =>
          value !== null &&
          (!Number.isInteger(
            value
          ) ||
            value <= 0)
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Peso e dimensões devem ser números inteiros maiores que zero.",

          requestId,
        },

        {
          status: 400,
        }
      );
    }

    stage =
      "generate-identifiers";

    console.log(
      "[ADMIN_PRODUCT_CREATE]",
      {
        requestId,
        stage,

        message:
          "Gerando slug e SKU",
      }
    );

    const slug =
      await generateUniqueSlug(
        data.name
      );

    const sku =
      await generateUniqueSku(
        data.name
      );

    console.log(
      "[ADMIN_PRODUCT_CREATE]",
      {
        requestId,
        stage,
        slug,
        sku,
      }
    );

    stage =
      "upload-images";

    const savedImages: Array<{
      url: string;
      thumbUrl: string;
      altText: string;
      sortOrder: number;
    }> = [];

    for (
      let index = 0;
      index <
      files.length;
      index++
    ) {
      const file =
        files[index];

      const baseName =
        uniqueFileBase(
          slug,
          index
        );

      console.log(
        "[ADMIN_PRODUCT_IMAGE_UPLOAD]",
        {
          requestId,
          stage,
          index,

          fileName:
            file.name,

          fileType:
            file.type,

          fileSize:
            file.size,

          baseName,

          message:
            "Iniciando upload",
        }
      );

      try {
        const uploadedImage =
          await uploadImageWithThumb(
            {
              file,

              directory:
                "products",

              baseName,

              thumb: {
                width: 400,
                height: 400,
                fit: "cover",
                quality: 82,
              },

              // Aceita imagens maiores e salva a imagem principal
              // já otimizada em WebP, próxima de 900 KB.
              maxFileSize:
                20 * 1024 * 1024,

              optimizeOriginal: {
                maxWidth: 2000,
                maxHeight: 2000,
                targetFileSize:
                  900 * 1024,
                initialQuality: 85,
                minQuality: 50,
              },
            }
          );

        console.log(
          "[ADMIN_PRODUCT_IMAGE_UPLOAD]",
          {
            requestId,
            stage,
            index,

            fileName:
              file.name,

            message:
              "Upload concluído",

            hasOriginalUrl:
              Boolean(
                uploadedImage.url
              ),

            hasThumbUrl:
              Boolean(
                uploadedImage.thumbUrl
              ),
          }
        );

        savedImages.push({
          url:
            uploadedImage.url,

          thumbUrl:
            uploadedImage.thumbUrl,

          altText:
            data.name,

          sortOrder:
            index,
        });
      } catch (error) {
        console.error(
          "[ADMIN_PRODUCT_IMAGE_UPLOAD_ERROR]",
          {
            requestId,
            stage,
            index,

            fileName:
              file.name,

            fileType:
              file.type,

            fileSize:
              file.size,

            error:
              getErrorDetails(
                error
              ),
          }
        );

        if (
          error instanceof
          Error
        ) {
          if (
            error.message.startsWith(
              "INVALID_FILE_TYPE:"
            )
          ) {
            const invalidType =
              error.message.split(
                ":"
              )[1];

            return NextResponse.json(
              {
                message: `Tipo não permitido: ${invalidType}`,
                requestId,
              },

              {
                status: 400,
              }
            );
          }

          if (
            error.message ===
            "INVALID_IMAGE_CONTENT"
          ) {
            return NextResponse.json(
              {
                message:
                  "Não foi possível processar uma das imagens. Verifique se o arquivo é uma imagem válida.",
                requestId,
              },

              {
                status: 400,
              }
            );
          }

          if (
            error.message.startsWith(
              "FILE_TOO_LARGE:"
            )
          ) {
            const fileName =
              error.message.split(
                ":"
              )[1];

            return NextResponse.json(
              {
                message: `A imagem "${fileName}" é muito grande. Envie um arquivo de até 20MB.`,
                requestId,
              },

              {
                status: 400,
              }
            );
          }
        }

        throw error;
      }
    }

    stage =
      "prisma-create";

    console.log(
      "[ADMIN_PRODUCT_CREATE]",
      {
        requestId,
        stage,

        message:
          "Iniciando prisma.product.create",

        productName:
          data.name,

        slug,
        sku,

        categoryCount:
          categoryIds.length,

        collectionCount:
          collectionIds.length,

        colorCount:
          colors.length,

        imageCount:
          savedImages.length,
      }
    );

    const product =
      await prisma.product.create({
        data: {
          name:
            data.name,

          slug,
          sku,

          shortDescription:
            data.shortDescription ||
            null,

          description:
            data.description ||
            null,

          priceInCents,

          compareAtPriceInCents,

          currency:
            "BRL",

          active:
            data.active ===
            "true",

          featured:
            data.featured ===
            "true",

          weightGrams,
          heightCm,
          widthCm,
          lengthCm,

          metaTitle:
            data.name,

          metaDescription:
            data.shortDescription ||
            null,

          categories: {
            create:
              categoryIds.map(
                (
                  categoryId
                ) => ({
                  categoryId,
                })
              ),
          },

          collections: {
            create:
              collectionIds.map(
                (
                  collectionId
                ) => ({
                  collectionId,
                })
              ),
          },

          colors: {
            create:
              colors.map(
                (color) => ({
                  name:
                    color.name,

                  hex:
                    color.hex,

                  sortOrder:
                    color.sortOrder,

                  active:
                    color.active,
                })
              ),
          },

          images: {
            create:
              savedImages.map(
                (image) => ({
                  url:
                    image.url,

                  thumbUrl:
                    image.thumbUrl,

                  altText:
                    image.altText,

                  sortOrder:
                    image.sortOrder,
                })
              ),
          },
        },

        include: {
          images: {
            orderBy: {
              sortOrder:
                "asc",
            },
          },

          colors: {
            orderBy: {
              sortOrder:
                "asc",
            },
          },
        },
      });

    stage = "success";

    console.log(
      "[ADMIN_PRODUCT_CREATE_SUCCESS]",
      {
        requestId,
        stage,

        productId:
          product.id,

        slug:
          product.slug,

        sku:
          product.sku,

        imageCount:
          product.images
            .length,

        colorCount:
          product.colors
            .length,
      }
    );

    return NextResponse.json({
      success: true,
      product,
      requestId,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "UNAUTHORIZED"
    ) {
      console.warn(
        "[ADMIN_PRODUCT_CREATE_UNAUTHORIZED]",
        {
          requestId,
          stage,
        }
      );

      return NextResponse.json(
        {
          message:
            "Não autorizado.",

          requestId,
        },

        {
          status: 401,
        }
      );
    }

    console.error(
      "[ADMIN_PRODUCT_CREATE_ERROR]",
      {
        requestId,
        stage,

        error:
          getErrorDetails(
            error
          ),
      }
    );

    return NextResponse.json(
      {
        message:
          `Erro ao criar produto. Etapa: ${stage}.`,

        requestId,
      },

      {
        status: 500,
      }
    );
  }
}