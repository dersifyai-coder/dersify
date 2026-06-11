import { cookies } from "next/headers";

export const AUTH_COOKIE_NAMES = {
  accessToken:  "dersify_access_token",
  refreshToken: "dersify_refresh_token",
  profile:      "dersify_profile",
} as const;

export interface AuthSession {
  access_token:  string;
  refresh_token: string;
  expires_in?:   number;
  expires_at?:   number;
}

export interface ProfileCookieData {
  onboarding_completed: boolean;
}

function getAuthCookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path:     "/",
    ...(maxAge ? { maxAge } : {}),
  };
}

function getProfileCookieOptions(maxAge?: number) {
  return {
    // NOT httpOnly — middleware + client both need to read this
    httpOnly: false,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path:     "/",
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
  const cookieStore    = cookies();
  const accessMaxAge   = session.expires_in ?? 60 * 60;
  const refreshMaxAge  = 60 * 60 * 24 * 30;

  cookieStore.set(
    AUTH_COOKIE_NAMES.accessToken,
    session.access_token,
    getAuthCookieOptions(accessMaxAge),
  );
  cookieStore.set(
    AUTH_COOKIE_NAMES.refreshToken,
    session.refresh_token,
    getAuthCookieOptions(refreshMaxAge),
  );
}

export function setProfileCookie(data: ProfileCookieData): void {
  cookies().set(
    AUTH_COOKIE_NAMES.profile,
    JSON.stringify(data),
    getProfileCookieOptions(60 * 60 * 24 * 30),
  );
}

export function clearAuthCookies(): void {
  const cookieStore = cookies();

  cookieStore.delete(AUTH_COOKIE_NAMES.accessToken);
  cookieStore.delete(AUTH_COOKIE_NAMES.refreshToken);
  cookieStore.delete(AUTH_COOKIE_NAMES.profile);
}
