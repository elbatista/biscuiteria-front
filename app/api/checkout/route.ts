import { NextResponse } from "next/server";
import { checkoutSchema, createCheckoutOrder } from "../../../lib/checkout/checkout";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message || "Dados de checkout inválidos.";

      return NextResponse.json({ error: message }, { status: 400 });
    }

    const result = await createCheckoutOrder(parsed.data);

    return NextResponse.json({
      ok: true,
      publicId: result.publicId,
    });
  } catch (error) {
    console.error("Checkout error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível finalizar seu pedido agora. Tente novamente em instantes.";

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 }
    );
  }
}