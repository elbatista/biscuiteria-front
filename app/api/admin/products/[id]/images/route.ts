import { del } from "@vercel/blob";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import { requireAdminAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";
import {
  slugify,
  uniqueFileBase,
} from "@/lib/server/product-utils";
import { uploadImageWithThumb } from "@/lib/server/blob-storage";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function safeDeleteBlobUrls(
  urls: Array<string | null | undefined>
) {
  const uniqueUrls = [
    ...new Set(
      urls.filter(
        (url): url is string =>
          Boolean(url)
      )
    ),
  ];

  if (
    uniqueUrls.length === 0
  ) {
    return;
  }

  await Promise.all(
    uniqueUrls.map(
      async (url) => {
        try {
          await del(url);
        } catch (error) {
          /**
           * Uma falha no cleanup não deve
           * esconder o erro original.
           */
          console.error(
            "ADMIN_PRODUCT_IMAGE_BLOB_ROLLBACK_ERROR",
            {
              url,
              error,
            }
          );
        }
      }
    )
  );
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await requireAdminAuth(
      request
    );

    const { id } =
      await context.params;

    const productId =
      Number(id);

    if (
      !Number.isInteger(
        productId
      ) ||
      productId <= 0
    ) {
      return NextResponse.json(
        {
          message:
            "ID do produto inválido.",
        },
        {
          status: 400,
        }
      );
    }

    const product =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },

        select: {
          id: true,
          name: true,
          slug: true,

          images: {
            orderBy: {
              sortOrder:
                "asc",
            },

            select: {
              id: true,
              sortOrder: true,
            },
          },
        },
      });

    if (!product) {
      return NextResponse.json(
        {
          message:
            "Produto não encontrado.",
        },
        {
          status: 404,
        }
      );
    }

    const formData =
      await request.formData();

    const files =
      formData
        .getAll(
          "images"
        )
        .filter(
          (
            item
          ): item is File =>
            item instanceof
              File &&
            item.size > 0
        );

    if (
      files.length === 0
    ) {
      return NextResponse.json(
        {
          message:
            "Envie pelo menos uma imagem.",
        },
        {
          status: 400,
        }
      );
    }

    const baseSlug =
      product.slug ||
      slugify(
        product.name
      ) ||
      "produto";

    let nextSortOrder =
      product.images.length >
      0
        ? Math.max(
            ...product.images.map(
              (img) =>
                img.sortOrder
            )
          ) + 1
        : 0;

    const createdImages =
      [];

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
          baseSlug,
          nextSortOrder
        );

      /**
       * Estes valores representam apenas
       * os blobs da imagem atualmente sendo
       * processada.
       */
      let uploadedOriginalUrl:
        string | null = null;

      let uploadedThumbUrl:
        string | null = null;

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

              maxFileSize:
                20 *
                1024 *
                1024,

              optimizeOriginal: {
                maxWidth:
                  2000,

                maxHeight:
                  2000,

                targetFileSize:
                  900 *
                  1024,

                initialQuality:
                  85,

                minQuality:
                  50,
              },
            }
          );

        /**
         * O upload terminou.
         *
         * A partir daqui, se o Prisma falhar,
         * precisamos remover estes dois arquivos.
         */
        uploadedOriginalUrl =
          uploadedImage.url;

        uploadedThumbUrl =
          uploadedImage.thumbUrl;

        const created =
          await prisma.productImage.create(
            {
              data: {
                productId,

                url:
                  uploadedImage.url,

                thumbUrl:
                  uploadedImage.thumbUrl,

                altText:
                  product.name,

                sortOrder:
                  nextSortOrder,
              },

              select: {
                id: true,
                url: true,
                thumbUrl: true,
                altText: true,
                sortOrder: true,
              },
            }
          );

        /**
         * Se chegamos aqui, a imagem já está
         * persistida no banco.
         *
         * Portanto não deve mais ser apagada
         * em caso de erro posterior.
         */
        uploadedOriginalUrl =
          null;

        uploadedThumbUrl =
          null;

        createdImages.push(
          created
        );

        nextSortOrder += 1;
      } catch (error) {
        /**
         * uploadImageWithThumb já possui rollback
         * interno caso o próprio upload ou geração
         * da thumbnail falhe.
         *
         * Aqui estamos cobrindo principalmente:
         *
         * upload ✅
         * prisma.productImage.create ❌
         */
        await safeDeleteBlobUrls([
          uploadedOriginalUrl,
          uploadedThumbUrl,
        ]);

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
                message:
                  `Tipo não permitido: ${invalidType}`,
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
                message:
                  `A imagem "${fileName}" é muito grande. Envie um arquivo de até 20MB.`,
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

    const images =
      await prisma.productImage.findMany(
        {
          where: {
            productId,
          },

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
        }
      );

    return NextResponse.json({
      success: true,
      images,
    });
  } catch (error) {
    if (
      error instanceof
        Error &&
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
      "ADMIN_PRODUCT_ADD_IMAGES_ERROR",
      error
    );

    return NextResponse.json(
      {
        message:
          "Erro ao adicionar imagens.",
      },
      {
        status: 500,
      }
    );
  }
}