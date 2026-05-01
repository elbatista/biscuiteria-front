import { NextResponse } from "next/server";

import {
  ADMIN_AUTH_COOKIE_NAME,
  getExpiredAdminCookieOptions,
} from "@/lib/auth/admin-cookie";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url), {
    status: 303,
  });

  response.cookies.set(
    ADMIN_AUTH_COOKIE_NAME,
    "",
    getExpiredAdminCookieOptions()
  );

  return response;
}