import { NextRequest, NextResponse } from "next/server";

const ACCESS_TOKEN_COOKIE = "dersify_access_token";
const REFRESH_TOKEN_COOKIE = "dersify_refresh_token";

export function middleware(request: NextRequest) {
  const hasAccessToken = request.cookies.has(ACCESS_TOKEN_COOKIE);
  const hasRefreshToken = request.cookies.has(REFRESH_TOKEN_COOKIE);

  if (!hasAccessToken && !hasRefreshToken) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
