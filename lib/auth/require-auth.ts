import {
  ADMIN_AUTH_COOKIE_NAME,
  readCookieFromHeader,
} from "@/lib/auth/admin-cookie";

import {
  AdminTokenPayload,
  verifyAdminToken,
} from "@/lib/auth/jwt";

import { prisma } from "@/lib/prisma";

function getAdminTokenFromRequest(
  request: Request
): string | null {
  return readCookieFromHeader(
    request.headers.get(
      "cookie"
    ),
    ADMIN_AUTH_COOKIE_NAME
  );
}

export async function requireAdminAuth(
  request: Request
) {
  const token =
    getAdminTokenFromRequest(
      request
    );

  if (!token) {
    throw new Error(
      "UNAUTHORIZED"
    );
  }

  let payload:
    AdminTokenPayload;

  try {
    payload =
      verifyAdminToken(
        token
      );
  } catch {
    throw new Error(
      "UNAUTHORIZED"
    );
  }

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
    throw new Error(
      "UNAUTHORIZED"
    );
  }

  /**
   * Esta é a nova proteção.
   *
   * Se alguém incrementou sessionVersion no
   * banco, qualquer JWT antigo deixa de valer.
   */
  if (
    user.sessionVersion !==
    payload.sessionVersion
  ) {
    throw new Error(
      "UNAUTHORIZED"
    );
  }

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
}