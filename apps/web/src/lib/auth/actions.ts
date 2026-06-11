"use server";

import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { clearAuthCookies, setAuthCookies, setProfileCookie } from "./cookies";

export interface AuthUser {
  id: string;
  email?: string;
  role?: string;
}

export interface AuthActionResult {
  success: boolean;
  message?: string;
  redirectTo?: string;
}

interface BackendApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface BackendSession {
  access_token:  string;
  refresh_token: string;
  expires_in?:   number;
  expires_at?:   number;
}

interface BackendProfile {
  onboarding_completed: boolean;
  subscription_tier:    string;
}

interface BackendAuthResult {
  session: BackendSession | null;
  profile: BackendProfile;
}

interface JwtPayload {
  sub?:   string;
  email?: string;
  role?:  string;
}

function getApiBaseUrl(): string {
  const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
  const baseUrl    = rawBaseUrl.replace(/\/$/, "");

  return baseUrl.endsWith("/api/v1") ? baseUrl : `${baseUrl}/api/v1`;
}

async function postAuth(
  path: string,
  body: Record<string, string>,
): Promise<AuthActionResult> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
    cache:   "no-store",
  });

  const payload = (
    await response.json().catch(() => null)
  ) as BackendApiResponse<BackendAuthResult> | null;

  if (!response.ok || !payload?.success) {
    return {
      success: false,
      message: payload?.message ?? "Authentication failed.",
    };
  }

  if (!payload.data.session) {
    return {
      success: true,
      message:
        "Registration successful. Check your email to confirm your account before signing in.",
    };
  }

  setAuthCookies(payload.data.session);
  setProfileCookie({
    onboarding_completed: payload.data.profile.onboarding_completed,
  });

  const redirectTo = payload.data.profile.onboarding_completed
    ? "/dashboard"
    : "/onboarding";

  return { success: true, redirectTo };
}

function getStringValue(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

export async function loginAction(formData: FormData): Promise<AuthActionResult> {
  return postAuth("/auth/login", {
    email:    getStringValue(formData, "email"),
    password: getStringValue(formData, "password"),
  });
}

export async function registerAction(
  formData: FormData,
): Promise<AuthActionResult> {
  return postAuth("/auth/register", {
    email:    getStringValue(formData, "email"),
    password: getStringValue(formData, "password"),
    fullName: getStringValue(formData, "fullName"),
  });
}

export async function logoutAction(): Promise<void> {
  clearAuthCookies();
  redirect("/auth/login");
}

export async function getCurrentUserAction(): Promise<AuthUser | null> {
  try {
    const payload = await apiFetch<JwtPayload>("/auth/me");

    if (!payload.sub) {
      return null;
    }

    return {
      id:    payload.sub,
      email: payload.email,
      role:  payload.role,
    };
  } catch {
    return null;
  }
}
