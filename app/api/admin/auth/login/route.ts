import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  ADMIN_AUTH_COOKIE_NAME,
  getAdminCookieOptions,
} from '@/lib/auth/admin-cookie';
import { signAdminToken } from '@/lib/auth/jwt';
import { comparePassword } from '@/lib/auth/password';
import { prisma } from '@/lib/prisma';
import {
  checkRateLimit,
  getRequestIdentifier,
} from '@/lib/server/rate-limit';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha inválida'),
});

/**
 * Proteção geral por origem.
 *
 * Impede que uma mesma origem faça centenas
 * de tentativas usando vários e-mails diferentes.
 */
const LOGIN_IP_RATE_LIMIT = 30;

/**
 * Proteção mais restritiva para uma combinação
 * específica de origem + e-mail.
 */
const LOGIN_ACCOUNT_RATE_LIMIT = 8;

const LOGIN_RATE_LIMIT_WINDOW_SECONDS = 15 * 60;

const GENERIC_LOGIN_ERROR =
  'Não foi possível fazer login agora. Tente novamente em instantes.';

export async function POST(request: Request) {
  try {
    const requestIdentifier =
      getRequestIdentifier(request);

    /**
     * Primeira barreira:
     *
     * limite global daquela origem,
     * independentemente do e-mail utilizado.
     */
    const ipRateLimit = await checkRateLimit({
      namespace: 'admin-login-ip',
      identifier: requestIdentifier,
      limit: LOGIN_IP_RATE_LIMIT,
      windowSeconds:
        LOGIN_RATE_LIMIT_WINDOW_SECONDS,
    });

    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        {
          message:
            'Muitas tentativas de login foram realizadas. Aguarde alguns minutos e tente novamente.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(
              ipRateLimit.retryAfterSeconds
            ),
          },
        }
      );
    }

    const body = await request.json();

    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message:
            parsed.error.issues[0]?.message ??
            'Dados inválidos.',
        },
        {
          status: 400,
        }
      );
    }

    const normalizedEmail =
      parsed.data.email.toLowerCase().trim();

    const password = parsed.data.password;

    /**
     * Segunda barreira:
     *
     * limita tentativas repetidas para o mesmo
     * e-mail vindas da mesma origem.
     *
     * O rate-limit.ts aplica SHA-256 antes
     * de armazenar o identificador, portanto
     * o e-mail não fica gravado na tabela.
     */
    const accountRateLimit =
      await checkRateLimit({
        namespace: 'admin-login-account',

        identifier:
          `${requestIdentifier}|email:${normalizedEmail}`,

        limit: LOGIN_ACCOUNT_RATE_LIMIT,

        windowSeconds:
          LOGIN_RATE_LIMIT_WINDOW_SECONDS,
      });

    if (!accountRateLimit.allowed) {
      return NextResponse.json(
        {
          message:
            'Muitas tentativas de login foram realizadas. Aguarde alguns minutos e tente novamente.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(
              accountRateLimit.retryAfterSeconds
            ),
          },
        }
      );
    }

    const user =
      await prisma.adminUser.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

    /**
     * Não revelamos se:
     *
     * - o usuário não existe;
     * - o usuário existe mas está inativo.
     *
     * Para o navegador é sempre apenas
     * "Credenciais inválidas".
     */
    if (!user || !user.active) {
      return NextResponse.json(
        {
          message: 'Credenciais inválidas.',
        },
        {
          status: 401,
        }
      );
    }

    const passwordMatches =
      await comparePassword(
        password,
        user.passwordHash
      );

    /**
     * Senha errada recebe exatamente a mesma
     * resposta de usuário inexistente.
     */
    if (!passwordMatches) {
      return NextResponse.json(
        {
          message: 'Credenciais inválidas.',
        },
        {
          status: 401,
        }
      );
    }

    const token = signAdminToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionVersion:
        user.sessionVersion,
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set(
      ADMIN_AUTH_COOKIE_NAME,
      token,
      getAdminCookieOptions()
    );

    return response;
  } catch (error) {
    /**
     * O erro completo continua disponível
     * nos logs do servidor.
     */
    console.error(
      'LOGIN_ROUTE_ERROR',
      error
    );

    /**
     * Mas nunca devolvemos detalhes internos
     * de Prisma, PostgreSQL, JWT etc.
     */
    return NextResponse.json(
      {
        message: GENERIC_LOGIN_ERROR,
      },
      {
        status: 500,
      }
    );
  }
}