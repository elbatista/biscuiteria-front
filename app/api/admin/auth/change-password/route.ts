import { NextResponse } from "next/server";
import { z } from "zod";

import {
  ADMIN_AUTH_COOKIE_NAME,
  getExpiredAdminCookieOptions,
} from "@/lib/auth/admin-cookie";

import {
  comparePassword,
  hashPassword,
} from "@/lib/auth/password";

import { requireAdminAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";

import {
  checkRateLimit,
  getRequestIdentifier,
} from "@/lib/server/rate-limit";

const CHANGE_PASSWORD_RATE_LIMIT = 5;

const CHANGE_PASSWORD_RATE_LIMIT_WINDOW_SECONDS =
  15 * 60;

const GENERIC_ERROR =
  "Não foi possível alterar a senha agora. Tente novamente em instantes.";

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(
        1,
        "Informe sua senha atual."
      ),

    newPassword: z
      .string()
      .min(
        10,
        "A nova senha deve ter pelo menos 10 caracteres."
      )
      .max(
        128,
        "A nova senha é muito longa."
      ),

    confirmPassword: z
      .string()
      .min(
        1,
        "Confirme a nova senha."
      ),
  })
  .refine(
    (data) =>
      data.newPassword ===
      data.confirmPassword,
    {
      message:
        "As novas senhas não coincidem.",

      path: [
        "confirmPassword",
      ],
    }
  );

export async function POST(
  request: Request
) {
  try {
    /**
     * A própria sessão precisa estar válida.
     *
     * Isso já verifica:
     * - JWT;
     * - usuário existente;
     * - usuário ativo;
     * - sessionVersion.
     */
    const adminUser =
      await requireAdminAuth(
        request
      );

    /**
     * Proteção contra tentativas repetidas
     * de descobrir a senha atual.
     *
     * Usamos:
     *
     * admin + origem
     *
     * para não misturar usuários diferentes.
     */
    const requestIdentifier =
      getRequestIdentifier(
        request
      );

    const rateLimit =
      await checkRateLimit({
        namespace:
          "admin-change-password",

        identifier:
          `${adminUser.id}|${requestIdentifier}`,

        limit:
          CHANGE_PASSWORD_RATE_LIMIT,

        windowSeconds:
          CHANGE_PASSWORD_RATE_LIMIT_WINDOW_SECONDS,
      });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          message:
            "Muitas tentativas de alteração de senha foram realizadas. Aguarde alguns minutos e tente novamente.",
        },
        {
          status: 429,

          headers: {
            "Retry-After":
              String(
                rateLimit.retryAfterSeconds
              ),
          },
        }
      );
    }

    const body =
      await request.json();

    const parsed =
      changePasswordSchema.safeParse(
        body
      );

    if (!parsed.success) {
      return NextResponse.json(
        {
          message:
            parsed.error
              .issues[0]
              ?.message ??
            "Dados inválidos.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      currentPassword,
      newPassword,
    } =
      parsed.data;

    /**
     * Carregamos novamente o usuário porque
     * requireAdminAuth propositalmente não
     * devolve passwordHash.
     */
    const user =
      await prisma.adminUser.findUnique({
        where: {
          id:
            adminUser.id,
        },

        select: {
          id: true,
          active: true,

          passwordHash:
            true,

          sessionVersion:
            true,
        },
      });

    if (
      !user ||
      !user.active
    ) {
      return NextResponse.json(
        {
          message:
            "Sessão inválida. Entre novamente.",
        },
        {
          status: 401,
        }
      );
    }

    /**
     * Confirma que quem está alterando
     * conhece a senha atual.
     */
    const currentPasswordMatches =
      await comparePassword(
        currentPassword,
        user.passwordHash
      );

    if (
      !currentPasswordMatches
    ) {
      return NextResponse.json(
        {
          message:
            "A senha atual está incorreta.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * Não permitimos simplesmente reutilizar
     * a senha atual.
     */
    const newPasswordIsCurrentPassword =
      await comparePassword(
        newPassword,
        user.passwordHash
      );

    if (
      newPasswordIsCurrentPassword
    ) {
      return NextResponse.json(
        {
          message:
            "A nova senha deve ser diferente da senha atual.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * Só geramos o hash depois de todas
     * as validações.
     */
    const newPasswordHash =
      await hashPassword(
        newPassword
      );

    /**
     * Update atômico.
     *
     * Além do ID, exigimos que:
     *
     * - passwordHash ainda seja o mesmo;
     * - sessionVersion ainda seja a mesma.
     *
     * Isso protege contra duas alterações
     * concorrentes usando a mesma sessão.
     */
    const updateResult =
      await prisma.adminUser.updateMany({
        where: {
          id:
            user.id,

          passwordHash:
            user.passwordHash,

          sessionVersion:
            user.sessionVersion,
        },

        data: {
          passwordHash:
            newPasswordHash,

          sessionVersion: {
            increment: 1,
          },
        },
      });

    if (
      updateResult.count !== 1
    ) {
      return NextResponse.json(
        {
          message:
            "Sua sessão foi alterada durante a operação. Entre novamente e tente outra vez.",
        },
        {
          status: 409,
        }
      );
    }

    /**
     * Neste momento:
     *
     * Banco:
     * sessionVersion = N + 1
     *
     * JWT atual:
     * sessionVersion = N
     *
     * Portanto a sessão atual já está
     * tecnicamente invalidada.
     *
     * Também removemos o cookie para deixar
     * isso explícito no navegador.
     */
    const response =
      NextResponse.json({
        success: true,

        message:
          "Senha alterada com sucesso. Entre novamente com sua nova senha.",
      });

    response.cookies.set(
      ADMIN_AUTH_COOKIE_NAME,
      "",
      getExpiredAdminCookieOptions()
    );

    return response;
  } catch (error) {
    /**
     * requireAdminAuth utiliza UNAUTHORIZED
     * para sessão ausente/inválida.
     */
    if (
      error instanceof Error &&
      error.message ===
        "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          message:
            "Sessão inválida. Entre novamente.",
        },
        {
          status: 401,
        }
      );
    }

    console.error(
      "ADMIN_CHANGE_PASSWORD_ERROR",
      error
    );

    /**
     * Nenhum detalhe de Prisma, bcrypt,
     * PostgreSQL etc. chega ao navegador.
     */
    return NextResponse.json(
      {
        message:
          GENERIC_ERROR,
      },
      {
        status: 500,
      }
    );
  }
}