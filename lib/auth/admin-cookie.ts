export const ADMIN_AUTH_COOKIE_NAME = 'admin_token';

export const ADMIN_AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: ADMIN_AUTH_COOKIE_MAX_AGE,
  };
}

export function getExpiredAdminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  };
}

export function readCookieFromHeader(
  cookieHeader: string | null,
  cookieName: string
): string | null {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(';');

  for (const cookie of cookies) {
    const [rawName, ...rawValueParts] = cookie.trim().split('=');

    if (rawName === cookieName) {
      const value = rawValueParts.join('=');
      return value ? decodeURIComponent(value) : null;
    }
  }

  return null;
}