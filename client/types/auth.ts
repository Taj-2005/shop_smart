export type UserRole = "customer" | "admin" | "super_admin";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  /** Present when the API sends it (e.g. after email verification). */
  emailVerified?: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginBody {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterBody {
  fullName: string;
  email: string;
  password: string;
  role?: "customer" | "admin_request";
}

export interface ForgotPasswordBody {
  email: string;
}

export interface ResetPasswordBody {
  token: string;
  newPassword: string;
}
