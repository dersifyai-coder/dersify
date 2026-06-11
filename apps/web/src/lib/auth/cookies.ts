import { cookies } from "next/headers";

export const AUTH_COOKIE_NAMES = {
  accessToken: "dersify_access_token",
  refreshToken: "dersify_refresh_token",
} as const;

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  expires_at?: number;
}

function getCookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    ...(maxAge ? { maxAge } : {}),
  };
}

export function getAccessToken(): string | undefined {
  return cookies().get(AUTH_COOKIE_NAMES.accessToken)?.value;
}

export function getRefreshToken(): string | undefined {
  return cookies().get(AUTH_COOKIE_NAMES.refreshToken)?.value;
}

export function setAuthCookies(session: AuthSession): void {
  const cookieStore = cookies();
  const accessTokenMaxAge = session.expires_in ?? 60 * 60;
  const refreshTokenMaxAge = 60 * 60 * 24 * 30;

  cookieStore.set(
    AUTH_COOKIE_NAMES.accessToken,
    session.access_token,
    getCookieOptions(accessTokenMaxAge),
  );
  cookieStore.set(
    AUTH_COOKIE_NAMES.refreshToken,
    session.refresh_token,
    getCookieOptions(refreshTokenMaxAge),
  );
}

export function clearAuthCookies(): void {
  const cookieStore = cookies();

  cookieStore.delete(AUTH_COOKIE_NAMES.accessToken);
  cookieStore.delete(AUTH_COOKIE_NAMES.refreshToken);
}
