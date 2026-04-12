"use client";

import { apiClient, getAuthRefreshPromise } from "./axios";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  avatarUrl?: string;
  emailVerified?: boolean;
  createdAt: string;
};

export type AuthResponse = {
  success: boolean;
  user?: AuthUser;
};

export type MeResponse = { success: boolean; user: AuthUser };

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>("/api/auth/login", { email, password }).then((r) => r.data),

  register: (data: { fullName: string; email: string; password: string; roleRequest?: string }) =>
    apiClient.post<AuthResponse>("/api/auth/register", data).then((r) => r.data),

  logout: () => apiClient.post("/api/auth/logout", {}).then((r) => r.data),

  refresh: () =>
    getAuthRefreshPromise().then((d) =>
      d && d.success && d.user ? { success: true, user: d.user } : { success: false }
    ),

  me: () => apiClient.get<MeResponse>("/api/auth/me").then((r) => r.data),

  forgotPassword: (email: string) =>
    apiClient.post("/api/auth/forgot-password", { email }).then((r) => r.data),

  resetPassword: (token: string, newPassword: string) =>
    apiClient.post("/api/auth/reset-password", { token, newPassword }).then((r) => r.data),

  verifyEmail: (token: string) =>
    apiClient.post<{ success: boolean; user: AuthUser }>("/api/auth/verify-email", { token }).then((r) => r.data),
};
