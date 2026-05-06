"use client";

// In production the frontend is served behind the same ALB as the backend, so
// relative paths ("/api/...") are used. Override NEXT_PUBLIC_API_URL locally
// (e.g. "http://localhost:4000") when running outside the ALB.
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export type ApiError = {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
};

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {}
): Promise<T> {
  const { skipAuth, ...init } = options;
  void skipAuth;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init.headers as Record<string, string>) ?? {}),
  };
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers, credentials: "include" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: ApiError = {
      status: res.status,
      message: data?.message ?? data?.error ?? "Request failed",
      errors: data?.errors,
    };
    throw err;
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => apiRequest<T>(path, { method: "GET" }),
  post: <T>(path: string, body: unknown, skipAuth?: boolean) =>
    apiRequest<T>(path, { method: "POST", body: JSON.stringify(body), skipAuth }),
  put: <T>(path: string, body: unknown) =>
    apiRequest<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    apiRequest<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: "DELETE" }),
};
