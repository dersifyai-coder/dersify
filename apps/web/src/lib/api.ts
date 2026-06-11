import "server-only";

import { clearAuthCookies, getAccessToken, getRefreshToken, setAuthCookies } from "./auth/cookies";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface BackendApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface RefreshResponse {
  session: {
    access_token: string;
    refresh_token: string;
    expires_in?: number;
    expires_at?: number;
  };
}

function getApiBaseUrl(): string {
  const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
  const baseUrl = rawBaseUrl.replace(/\/$/, "");

  return baseUrl.endsWith("/api/v1") ? baseUrl : `${baseUrl}/api/v1`;
}

function buildUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${getApiBaseUrl()}${normalizedPath}`;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const firstResponse = await fetchWithAuth(path, init);

  if (firstResponse.status !== 401) {
    return parseResponse<T>(firstResponse);
  }

  const refreshed = await refreshAccessToken();

  if (!refreshed) {
    clearAuthCookies();
    return parseResponse<T>(firstResponse);
  }

  const retryResponse = await fetchWithAuth(path, init);

  return parseResponse<T>(retryResponse);
}

async function fetchWithAuth(path: string, init: RequestInit): Promise<Response> {
  const accessToken = getAccessToken();
  const headers = new Headers(init.headers);

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return fetch(buildUrl(path), {
    ...init,
    headers,
    cache: init.cache ?? "no-store",
  });
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return false;
  }

  const response = await fetch(buildUrl("/auth/refresh"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as BackendApiResponse<RefreshResponse> | null;

  if (!response.ok || !payload?.success) {
    return false;
  }

  setAuthCookies(payload.data.session);

  return true;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as BackendApiResponse<T> | null;

  if (!response.ok || !payload?.success) {
    throw new ApiError(
      payload?.message ?? `Request failed with status ${response.status}.`,
      response.status,
    );
  }

  return payload.data;
}
