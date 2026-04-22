import { NextResponse } from 'next/server';

import { requireAdminAuth } from '@/lib/auth/require-auth';

export async function GET(request: Request) {
  try {
    const user = await requireAdminAuth(request);

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch {
    return NextResponse.json(
      { message: 'Não autorizado.' },
      { status: 401 }
    );
  }
}