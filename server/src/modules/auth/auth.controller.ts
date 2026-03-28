import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/authenticate";
import { env } from "../../config/env";
import * as authService from "./auth.service";
import { AppError } from "../../middleware/errorHandler";

const ACCESS_MAX_AGE_MS = 3600 * 1000; // 1h, match JWT access expiry
const REFRESH_MAX_AGE_MS = env.JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000;

function cookieOptions(maxAgeMs: number): { httpOnly: true; secure: boolean; sameSite: "none" | "lax" | "strict"; maxAge: number; path: string; domain?: string } {
  const sameSite = env.COOKIE_SAME_SITE ?? (env.COOKIE_SECURE ? "none" : "lax");
  const options = {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite,
    maxAge: maxAgeMs,
    path: "/",
  };
  if (env.COOKIE_DOMAIN) (options as { domain?: string }).domain = env.COOKIE_DOMAIN;
  return options as ReturnType<typeof cookieOptions>;
}

function getRefreshTokenFromReq(req: AuthRequest): string | undefined {
  return req.cookies?.[env.COOKIE_REFRESH_NAME];
}

function clearCookieOptions(): { path: string; domain?: string; httpOnly?: boolean; secure?: boolean; sameSite?: "none" | "lax" | "strict" } {
  const sameSite = env.COOKIE_SAME_SITE ?? (env.COOKIE_SECURE ? "none" : "lax");
  const o: { path: string; domain?: string; httpOnly?: boolean; secure?: boolean; sameSite?: "none" | "lax" | "strict" } = {
    path: "/",
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite,
  };
  if (env.COOKIE_DOMAIN) o.domain = env.COOKIE_DOMAIN;
  return o;
}

export async function register(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password, fullName, roleRequest } = req.body;
    const result = await authService.register({
      email,
      password,
      fullName,
      roleRequest,
    });
    res.cookie(env.COOKIE_ACCESS_NAME, result.accessToken, cookieOptions(ACCESS_MAX_AGE_MS));
    res.cookie(env.COOKIE_REFRESH_NAME, result.refreshToken, cookieOptions(REFRESH_MAX_AGE_MS));
    res.status(201).json({
      success: true,
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (e) {
    next(e);
  }
}

export async function login(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await authService.login(req.body, req.ip);
    res.cookie(env.COOKIE_ACCESS_NAME, result.accessToken, cookieOptions(ACCESS_MAX_AGE_MS));
    res.cookie(env.COOKIE_REFRESH_NAME, result.refreshToken, cookieOptions(REFRESH_MAX_AGE_MS));
    res.json({
      success: true,
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (e) {
    next(e);
  }
}

export async function refresh(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = getRefreshTokenFromReq(req);
    if (!token) {
      next(new AppError(400, "Refresh token required", "BAD_REQUEST"));
      return;
    }
    const result = await authService.refresh(token);
    res.cookie(env.COOKIE_ACCESS_NAME, result.accessToken, cookieOptions(ACCESS_MAX_AGE_MS));
    res.cookie(env.COOKIE_REFRESH_NAME, result.refreshToken, cookieOptions(REFRESH_MAX_AGE_MS));
    res.json({
      success: true,
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (e) {
    next(e);
  }
}

export async function logout(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = getRefreshTokenFromReq(req);
    await authService.logout(token);
    const clearOpts = clearCookieOptions();
    res.clearCookie(env.COOKIE_ACCESS_NAME, clearOpts);
    res.clearCookie(env.COOKIE_REFRESH_NAME, clearOpts);
    res.json({ success: true, message: "Logged out" });
  } catch (e) {
    next(e);
  }
}

export async function verifyEmail(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { token } = req.body;
    const result = await authService.verifyEmail(token);
    res.json({ success: true, user: result.user });
  } catch (e) {
    next(e);
  }
}

export async function forgotPassword(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.json({ success: true, message: result.message });
  } catch (e) {
    next(e);
  }
}

export async function resetPassword(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);
    res.json({ success: true, message: "Password has been reset." });
  } catch (e) {
    next(e);
  }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      next(new AppError(401, "Authentication required", "UNAUTHORIZED"));
      return;
    }
    const user = await authService.me(req.user.id);
    res.json({ success: true, user });
  } catch (e) {
    next(e);
  }
}
