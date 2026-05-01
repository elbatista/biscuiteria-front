import { cookies } from 'next/headers';

import { ADMIN_AUTH_COOKIE_NAME } from '@/lib/auth/admin-cookie';
import { verifyAdminToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';

export async function getCurrentAdminUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = verifyAdminToken(token);

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
      return null;
    }

    return user;
  } catch {
    return null;
  }
}