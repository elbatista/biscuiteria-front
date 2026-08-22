import { NextResponse } from "next/server";

import {
  CheckoutBusinessError,
  createCheckoutOrder,
  publicCheckoutSchema,
} from "@/lib/checkout/checkout";

import {
  checkRateLimit,
  getRequestIdentifier,
} from "@/lib/server/rate-limit";

const GENERIC_CHECKOUT_ERROR =
  "Não foi possível enviar seu pedido agora. Tente novamente em instantes.";

const CHECKOUT_RATE_LIMIT = 10;

const CHECKOUT_RATE_LIMIT_WINDOW_SECONDS =
  10 * 60;

export async function POST(request: Request) {
  try {
    /**
     * Rate limiting acontece antes mesmo de
     * processarmos o body.
     *
     * Assim requisições abusivas não chegam
     * ao fluxo pesado de criação de pedido,
     * validação de produtos e envio de e-mail.
     */
    const identifier =
      getRequestIdentifier(request);

    const rateLimit =
      await checkRateLimit({
        namespace: "checkout",
        identifier,
        limit: CHECKOUT_RATE_LIMIT,
        windowSeconds:
          CHECKOUT_RATE_LIMIT_WINDOW_SECONDS,
      });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error:
            "Muitas tentativas de envio foram realizadas. Aguarde alguns minutos e tente novamente.",
        },
        {
          status: 429,

          headers: {
            "Retry-After": String(
              rateLimit.retryAfterSeconds
            ),

            "X-RateLimit-Limit": String(
              rateLimit.limit
            ),

            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const body =
      await request.json();

    const parsed =
      publicCheckoutSchema.safeParse(body);

    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ||
        "Dados de checkout inválidos.";

      return NextResponse.json(
        {
          error: message,
        },
        {
          status: 400,

          headers: {
            "X-RateLimit-Limit": String(
              rateLimit.limit
            ),

            "X-RateLimit-Remaining": String(
              rateLimit.remaining
            ),
          },
        }
      );
    }

    const result =
      await createCheckoutOrder(
        parsed.data
      );

    return NextResponse.json(
      {
        ok: true,
        publicId: result.publicId,
      },
      {
        headers: {
          "X-RateLimit-Limit": String(
            rateLimit.limit
          ),

          "X-RateLimit-Remaining": String(
            rateLimit.remaining
          ),
        },
      }
    );
  } catch (error) {
    /**
     * Erros esperados do checkout.
     *
     * Estes são seguros para aparecer
     * diretamente para o cliente.
     */
    if (
      error instanceof CheckoutBusinessError
    ) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 409,
        }
      );
    }

    /**
     * Erros inesperados ficam somente
     * nos logs do servidor.
     */
    console.error(
      "CHECKOUT_INTERNAL_ERROR",
      error
    );

    return NextResponse.json(
      {
        error: GENERIC_CHECKOUT_ERROR,
      },
      {
        status: 500,
      }
    );
  }
}