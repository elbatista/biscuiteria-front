import { NextResponse } from "next/server";
import { z } from "zod";
import { getShippingQuote } from "@/lib/server/shipping";

const shippingQuoteSchema = z.object({
  zipCode: z.string().trim().min(8, "Informe um CEP válido."),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1, "Seu carrinho está vazio."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = shippingQuoteSchema.safeParse(body);

    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message || "Dados inválidos para cotação.";

      return NextResponse.json({ error: message }, { status: 400 });
    }

    const options = await getShippingQuote(parsed.data);

    return NextResponse.json({
      ok: true,
      options,
    });
  } catch (error) {
    console.error("Shipping quote error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível calcular o frete agora.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}