import {
  NextRequest,
  NextResponse,
} from "next/server";

import { requireAdminAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/orders/products
 *
 * Retorna somente as informações necessárias
 * para montar o seletor de produtos na criação
 * manual de pedidos.
 *
 * Apenas produtos ativos são retornados.
 */
export async function GET(
  request: NextRequest
) {
  try {
    /**
     * Apenas usuários autenticados no admin
     * podem consultar essa lista.
     */
    await requireAdminAuth(request);

    const products =
      await prisma.product.findMany({
        where: {
          active: true,
        },

        orderBy: {
          name: "asc",
        },

        select: {
          id: true,
          name: true,
          sku: true,
          priceInCents: true,
          currency: true,

          /**
           * Precisamos somente da primeira
           * imagem para mostrar no seletor.
           */
          images: {
            orderBy: {
              sortOrder: "asc",
            },

            take: 1,

            select: {
              id: true,
              url: true,
              thumbUrl: true,
              altText: true,
            },
          },

          /**
           * Somente cores ativas podem ser
           * escolhidas em um novo pedido.
           */
          colors: {
            where: {
              active: true,
            },

            orderBy: {
              sortOrder: "asc",
            },

            select: {
              id: true,
              name: true,
              hex: true,
              sortOrder: true,
            },
          },
        },
      });

    /**
     * Transformamos ligeiramente o resultado
     * para deixar o frontend mais simples.
     *
     * Em vez de:
     *
     * images: [...]
     *
     * devolvemos diretamente:
     *
     * image: {...} | null
     */
    const normalizedProducts =
      products.map((product) => ({
        id: product.id,
        name: product.name,
        sku: product.sku,

        priceInCents:
          product.priceInCents,

        currency:
          product.currency,

        image:
          product.images[0] ?? null,

        colors:
          product.colors,
      }));

    return NextResponse.json(
      {
        products:
          normalizedProducts,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          error:
            "Não autorizado.",
        },
        {
          status: 401,
        }
      );
    }

    console.error(
      "ADMIN_ORDER_PRODUCTS_GET_ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível carregar os produtos.",
      },
      {
        status: 500,
      }
    );
  }
}