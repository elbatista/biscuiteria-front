import { cookies } from "next/headers";

import { ADMIN_AUTH_COOKIE_NAME } from "@/lib/auth/admin-cookie";
import { verifyAdminToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";

export async function getCurrentAdminUser() {
  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      ADMIN_AUTH_COOKIE_NAME
    )?.value;

  if (!token) {
    return null;
  }

  try {
    const payload =
      verifyAdminToken(
        token
      );

    const user =
      await prisma.adminUser.findUnique({
        where: {
          id:
            payload.userId,
        },

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
          sessionVersion:
            true,
        },
      });

    if (
      !user ||
      !user.active
    ) {
      return null;
    }

    /**
     * Token criado antes de uma invalidação
     * global de sessões deixa de ser aceito.
     */
    if (
      user.sessionVersion !==
      payload.sessionVersion
    ) {
      return null;
    }

    /**
     * Não devolvemos sessionVersion para
     * componentes/páginas que não precisam
     * conhecer esse detalhe interno.
     */
    return {
      id:
        user.id,

      name:
        user.name,

      email:
        user.email,

      role:
        user.role,
    };
  } catch {
    return null;
  }
}