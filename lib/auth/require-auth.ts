import {
  ADMIN_AUTH_COOKIE_NAME,
  readCookieFromHeader,
} from '@/lib/auth/admin-cookie';
import { verifyAdminToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';

function getAdminTokenFromRequest(request: Request): string | null {
  return readCookieFromHeader(
    request.headers.get('cookie'),
    ADMIN_AUTH_COOKIE_NAME
  );
}

export async function requireAdminAuth(request: Request) {
  const token = getAdminTokenFromRequest(request);

  if (!token) {
    throw new Error('UNAUTHORIZED');
  }

  let payload: { userId: string; email: string; role: string };

  try {
    payload = verifyAdminToken(token);
  } catch {
    throw new Error('UNAUTHORIZED');
  }

  const user = await prisma.adminUser.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
    },
  });

  if (!user || !user.active) {
    throw new Error('UNAUTHORIZED');
  }

  return user;
}