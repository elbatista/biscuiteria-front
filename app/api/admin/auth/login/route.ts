import { NextResponse } from 'next/server';
import { z } from 'zod';

import { signAdminToken } from '@/lib/auth/jwt';
import { comparePassword } from '@/lib/auth/password';
import { prisma } from '@/lib/prisma';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha inválida'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.adminUser.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user || !user.active) {
      return NextResponse.json(
        { message: 'Credenciais inválidas.' },
        { status: 401 }
      );
    }

    const passwordMatches = await comparePassword(password, user.passwordHash);

    if (!passwordMatches) {
      return NextResponse.json(
        { message: 'Credenciais inválidas.' },
        { status: 401 }
      );
    }

    const token = signAdminToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('LOGIN_ROUTE_ERROR', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message ?? 'Dados inválidos.' },
        { status: 400 }
      );
    }

    const message =
      error instanceof Error ? error.message : 'Erro interno ao fazer login.';

    return NextResponse.json(
      {
        message,
        debug:
          process.env.NODE_ENV !== 'production'
            ? String(message)
            : undefined,
      },
      { status: 500 }
    );
  }
}