import { NextRequest, NextResponse } from "next/server";

const ACCESS_TOKEN_COOKIE  = "dersify_access_token";
const REFRESH_TOKEN_COOKIE = "dersify_refresh_token";
const PROFILE_COOKIE       = "dersify_profile";

function parseOnboardingCompleted(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false;

  try {
    const data = JSON.parse(cookieValue) as { onboarding_completed?: boolean };
    return data.onboarding_completed === true;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  const isAuthenticated =
    request.cookies.has(ACCESS_TOKEN_COOKIE) ||
    request.cookies.has(REFRESH_TOKEN_COOKIE);

  // Rule 1: Not authenticated → /auth/login
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const onboardingCompleted = parseOnboardingCompleted(
    request.cookies.get(PROFILE_COOKIE)?.value,
  );

  // Rule 2: On /onboarding and already done → /dashboard
  if (pathname.startsWith("/onboarding") && onboardingCompleted) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Rule 3: On /dashboard and not yet done → /onboarding
  if (pathname.startsWith("/dashboard") && !onboardingCompleted) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding", "/onboarding/:path*"],
};
