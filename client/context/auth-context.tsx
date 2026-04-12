"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type { User, UserRole } from "@/types/auth";
import { setOnUnauthorized } from "@/lib/auth-token";
import { authApi, type AuthUser } from "@/api/auth.api";
import { toApiError } from "@/api/axios";

/** Dedupe verify POST (e.g. React Strict Mode) so the one-time token is not consumed twice. */
const verifyEmailInflight = new Map<string, Promise<AuthUser>>();

function normalizeRole(role: string): UserRole {
  const r = role?.toUpperCase();
  if (r === "CUSTOMER") return "customer";
  if (r === "ADMIN") return "admin";
  if (r === "SUPER_ADMIN") return "super_admin";
  return "customer";
}

function toUser(u: AuthUser | null): User | null {
  if (!u) return null;
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    role: normalizeRole(u.role),
    avatarUrl: u.avatarUrl,
    emailVerified: u.emailVerified,
    createdAt: u.createdAt,
  };
}

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (fullName: string, email: string, password: string, role?: "customer" | "admin_request") => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  /** Confirms email with one-time token; updates session from response (server also sets auth cookies). */
  verifyEmailToken: (token: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  error: string | null;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setUser = useCallback((u: User | null) => {
    setUserState(u);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const data = await authApi.refresh();
      if (data.success && data.user) setUserState(toUser(data.user));
      else setUserState(null);
    } catch {
      setUserState(null);
    }
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => {
      setUserState(null);
      if (typeof window !== "undefined") router.replace("/login");
    });
    return () => setOnUnauthorized(null);
  }, [router]);

  useEffect(() => {
    // Avoid racing POST /verify-email (which sets new auth cookies) with POST /refresh using the old refresh token.
    if (pathname?.startsWith("/verify-email")) {
      setIsInitialized(true);
      return;
    }
    authApi
      .refresh()
      .then((data) => {
        if (data.success && data.user) setUserState(toUser(data.user));
        else setUserState(null);
      })
      .catch(() => setUserState(null))
      .finally(() => setIsInitialized(true));
  }, [pathname]);

  const login = useCallback(
    async (email: string, password: string, remember?: boolean) => {
      void remember;
      setError(null);
      setIsLoading(true);
      try {
        const data = await authApi.login(email, password);
        if (data.success && data.user) setUserState(toUser(data.user));
      } catch (e) {
        const err = toApiError(e);
        setError(err.message ?? "Login failed");
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const register = useCallback(
    async (
      fullName: string,
      email: string,
      password: string,
      role?: "customer" | "admin_request"
    ) => {
      setError(null);
      setIsLoading(true);
      try {
        const data = await authApi.register({
          fullName,
          email,
          password,
          roleRequest: role === "admin_request" ? "admin" : undefined,
        });
        if (data.success && data.user) setUserState(toUser(data.user));
      } catch (e) {
        const err = toApiError(e);
        setError(err.message ?? "Registration failed");
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    setError(null);
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      setUserState(null);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    setError(null);
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
    } catch (e) {
      const err = toApiError(e);
      setError(err.message ?? "Request failed");
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    setError(null);
    setIsLoading(true);
    try {
      await authApi.resetPassword(token, newPassword);
    } catch (e) {
      const err = toApiError(e);
      setError(err.message ?? "Reset failed");
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyEmailToken = useCallback(async (token: string) => {
    const trimmed = token.trim();
    if (!trimmed) {
      setError("Invalid verification link");
      throw new Error("Invalid verification link");
    }
    setError(null);
    setIsLoading(true);
    try {
      let pending = verifyEmailInflight.get(trimmed);
      if (!pending) {
        pending = authApi.verifyEmail(trimmed).then((data) => {
          if (data.success && data.user) return data.user;
          throw new Error("Verification failed");
        });
        verifyEmailInflight.set(trimmed, pending);
      }
      try {
        const authUser = await pending;
        setUserState(toUser(authUser));
      } catch (e) {
        verifyEmailInflight.delete(trimmed);
        throw e;
      }
    } catch (e) {
      const err = toApiError(e);
      setError(err.message ?? "Verification failed");
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      isInitialized,
      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
      verifyEmailToken,
      refreshUser,
      setUser,
      error,
      clearError,
    }),
    [
      user,
      isLoading,
      isInitialized,
      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
      verifyEmailToken,
      refreshUser,
      setUser,
      error,
      clearError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useIsAdmin(): boolean {
  const { user } = useAuth();
  return user?.role === "admin" || user?.role === "super_admin";
}

export function useIsSuperAdmin(): boolean {
  const { user } = useAuth();
  return user?.role === "super_admin";
}
