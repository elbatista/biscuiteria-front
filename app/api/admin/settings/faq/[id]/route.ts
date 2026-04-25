import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const updateFaqItemSchema = z.object({
  question: z.string().trim().min(2, "Pergunta é obrigatória."),
  answer: z.string().trim().min(2, "Resposta é obrigatória."),
  active: z.boolean(),
  position: z.coerce.number().int().min(0, "Ordem inválida."),
});

function parseFaqItemId(value: string) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminAuth(request);

    const { id } = await context.params;
    const faqItemId = parseFaqItemId(id);

    if (!faqItemId) {
      return NextResponse.json(
        { message: "ID da pergunta inválido." },
        { status: 400 }
      );
    }

    const faqItem = await prisma.faqItem.findUnique({
      where: {
        id: faqItemId,
      },
    });

    if (!faqItem) {
      return NextResponse.json(
        { message: "Pergunta não encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json(faqItem);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }

    console.error("ADMIN_FAQ_ITEM_GET_ERROR", error);

    return NextResponse.json(
      { message: "Erro ao carregar pergunta frequente." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminAuth(request);

    const { id } = await context.params;
    const faqItemId = parseFaqItemId(id);

    if (!faqItemId) {
      return NextResponse.json(
        { message: "ID da pergunta inválido." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const data = updateFaqItemSchema.parse(body);

    const existing = await prisma.faqItem.findUnique({
      where: {
        id: faqItemId,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Pergunta não encontrada." },
        { status: 404 }
      );
    }

    const updated = await prisma.faqItem.update({
      where: {
        id: faqItemId,
      },
      data: {
        question: data.question.trim(),
        answer: data.answer.trim(),
        active: data.active,
        position: data.position,
      },
    });

    return NextResponse.json(updated);
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

    console.error("ADMIN_FAQ_ITEM_PUT_ERROR", error);

    return NextResponse.json(
      { message: "Erro ao atualizar pergunta frequente." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminAuth(request);

    const { id } = await context.params;
    const faqItemId = parseFaqItemId(id);

    if (!faqItemId) {
      return NextResponse.json(
        { message: "ID da pergunta inválido." },
        { status: 400 }
      );
    }

    const existing = await prisma.faqItem.findUnique({
      where: {
        id: faqItemId,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Pergunta não encontrada." },
        { status: 404 }
      );
    }

    await prisma.faqItem.delete({
      where: {
        id: faqItemId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pergunta excluída com sucesso.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }

    console.error("ADMIN_FAQ_ITEM_DELETE_ERROR", error);

    return NextResponse.json(
      { message: "Erro ao excluir pergunta frequente." },
      { status: 500 }
    );
  }
}