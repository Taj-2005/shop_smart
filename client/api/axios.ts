"use client";

import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { triggerUnauthorized } from "@/lib/auth-token";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const apiClient = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

type RefreshPayload = {
  success: boolean;
  user?: { id: string; email: string; fullName: string; role: string; avatarUrl?: string; createdAt: string };
};

/** POST /api/auth/refresh — do not run the 401 refresh-retry logic on this URL (avoids recursion / deadlock). */
function isAuthPublic401Url(url: string | undefined): boolean {
  if (!url) return false;
  const path = url.split("?")[0];
  const markers = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/refresh",
    "/api/auth/logout",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/api/auth/verify-email",
  ];
  return markers.some((m) => path === m || path.endsWith(m));
}

let authRefreshInFlight: Promise<RefreshPayload | null> | null = null;

/**
 * Single in-flight refresh (React Strict Mode / parallel calls must not rotate the refresh token twice).
 */
export function getAuthRefreshPromise(): Promise<RefreshPayload | null> {
  if (authRefreshInFlight) return authRefreshInFlight;
  authRefreshInFlight = apiClient
    .post<RefreshPayload>("/api/auth/refresh", {}, { withCredentials: true })
    .then((r) => (r.data?.success && r.data.user ? r.data : null))
    .catch(() => null)
    .finally(() => {
      authRefreshInFlight = null;
    });
  return authRefreshInFlight;
}

async function tryRefresh(): Promise<boolean> {
  const data = await getAuthRefreshPromise();
  return data?.success === true && Boolean(data.user);
}

apiClient.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = err.response?.status;

    if (status !== 401) {
      return Promise.reject(err);
    }

    if (isAuthPublic401Url(original?.url)) {
      return Promise.reject(err);
    }

    if (original._retry) {
      triggerUnauthorized();
      return Promise.reject(err);
    }

    original._retry = true;
    const refreshed = await tryRefresh();
    if (refreshed) return apiClient(original);
    triggerUnauthorized();
    return Promise.reject(err);
  }
);

export type ApiError = {
  status: number;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
};

export function toApiError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; code?: string; errors?: Record<string, string[]> } | undefined;
    return {
      status: err.response?.status ?? 500,
      message: data?.message ?? err.message ?? "Request failed",
      code: data?.code,
      errors: data?.errors,
    };
  }
  return { status: 500, message: "Request failed" };
}
