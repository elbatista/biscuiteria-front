import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth/jwt';

export async function requireAdminAuth(request: Request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('UNAUTHORIZED');
  }

  const token = authHeader.replace('Bearer ', '').trim();

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