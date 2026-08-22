import {
  NextRequest,
  NextResponse,
} from "next/server";
import { z } from "zod";

import {
  checkoutSchema,
  createAdminOrder,
} from "@/lib/checkout/checkout";
import { requireAdminAuth } from "@/lib/auth/require-auth";

/**
 * O formulário do admin envia exatamente
 * os mesmos dados necessários para um
 * checkout normal, com apenas uma informação
 * extra:
 *
 * sendCreationEmails
 *
 * Isso permite à vendedora decidir se o
 * cliente deve receber os e-mails automáticos
 * de criação do pedido.
 */
const createAdminOrderSchema =
  checkoutSchema.extend({
    sendCreationEmails: z
      .boolean()
      .default(true),
  });

function getErrorMessage(
  error: unknown
) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Erro desconhecido.";
}

/**
 * POST /api/admin/orders
 *
 * Cria um pedido manualmente pelo admin.
 *
 * Depois de criado, ele passa a utilizar
 * exatamente o mesmo fluxo dos pedidos
 * originados pelo site.
 */
export async function POST(
  request: NextRequest
) {
  let adminUser:
    | Awaited<
        ReturnType<
          typeof requireAdminAuth
        >
      >
    | undefined;

  /**
   * 1. Garante que apenas usuários
   * autenticados no admin possam criar
   * pedidos manualmente.
   */
  try {
    adminUser =
      await requireAdminAuth(
        request
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
      "ADMIN_CREATE_ORDER_AUTH_ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível validar a sessão administrativa.",
      },
      {
        status: 500,
      }
    );
  }

  /**
   * 2. Valida o JSON recebido.
   *
   * Reutilizamos checkoutSchema para
   * garantir que pedidos do site e do
   * admin respeitem as mesmas regras.
   */
  let payload: z.infer<
    typeof createAdminOrderSchema
  >;

  try {
    const body =
      await request.json();

    payload =
      createAdminOrderSchema.parse(
        body
      );
  } catch (error) {
    if (
      error instanceof
      z.ZodError
    ) {
      return NextResponse.json(
        {
          error:
            error.issues[0]
              ?.message ||
            "Dados do pedido inválidos.",

          issues:
            error.issues.map(
              (issue) => ({
                path:
                  issue.path.join(
                    "."
                  ),

                message:
                  issue.message,
              })
            ),
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        error:
          "Não foi possível interpretar os dados do pedido.",
      },
      {
        status: 400,
      }
    );
  }

  console.info(
    "ADMIN_CREATE_ORDER_START",
    {
      adminId:
        adminUser.id,

      itemsCount:
        payload.items.length,

      sendCreationEmails:
        payload.sendCreationEmails,
    }
  );

  /**
   * 3. Remove a configuração específica
   * do admin antes de enviar os dados
   * para createAdminOrder().
   *
   * orderData mantém exatamente o formato
   * CheckoutInput esperado pela lógica
   * compartilhada.
   */
  const {
    sendCreationEmails,
    ...orderData
  } = payload;

  try {
    const result =
      await createAdminOrder(
        orderData,
        {
          sendCreationEmails,
        }
      );

    console.info(
      "ADMIN_CREATE_ORDER_SUCCESS",
      {
        adminId:
          adminUser.id,

        orderId:
          result.id,

        publicId:
          result.publicId,
      }
    );

    /**
     * O frontend poderá usar orderId
     * para navegar diretamente para:
     *
     * /admin/orders/:id
     */
    return NextResponse.json(
      {
        ok: true,

        order: {
          id:
            result.id,

          publicId:
            result.publicId,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "ADMIN_CREATE_ORDER_ERROR",
      {
        adminId:
          adminUser.id,

        error:
          getErrorMessage(
            error
          ),

        stack:
          error instanceof Error
            ? error.stack
            : undefined,
      }
    );

    /**
     * Alguns erros aqui são erros de
     * negócio compreensíveis para o admin:
     *
     * - produto não encontrado;
     * - produto inativo;
     * - cor não selecionada;
     * - cor indisponível;
     * etc.
     *
     * createAdminOrder já produz mensagens
     * apropriadas para esses casos.
     */
    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível criar o pedido.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 400,
      }
    );
  }
}