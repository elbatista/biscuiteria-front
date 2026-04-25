import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";

const createFaqItemSchema = z.object({
  question: z.string().trim().min(2, "Pergunta é obrigatória."),
  answer: z.string().trim().min(2, "Resposta é obrigatória."),
  active: z.boolean().optional().default(true),
  position: z.coerce.number().int().min(0, "Ordem inválida.").optional(),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const faqItems = await prisma.faqItem.findMany({
      orderBy: [{ position: "asc" }, { id: "asc" }],
    });

    return NextResponse.json({
      items: faqItems,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }

    console.error("ADMIN_FAQ_GET_ERROR", error);

    return NextResponse.json(
      { message: "Erro ao carregar perguntas frequentes." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth(request);

    const body = await request.json();
    const data = createFaqItemSchema.parse(body);

    const lastItem = await prisma.faqItem.findFirst({
      orderBy: {
        position: "desc",
      },
      select: {
        position: true,
      },
    });

    const created = await prisma.faqItem.create({
      data: {
        question: data.question.trim(),
        answer: data.answer.trim(),
        active: data.active,
        position:
          typeof data.position === "number"
            ? data.position
            : lastItem
              ? lastItem.position + 1
              : 0,
      },
    });

    return NextResponse.json(created, { status: 201 });
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

    console.error("ADMIN_FAQ_POST_ERROR", error);

    return NextResponse.json(
      { message: "Erro ao criar pergunta frequente." },
      { status: 500 }
    );
  }
}