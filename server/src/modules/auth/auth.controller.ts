import { Response } from "express";
import { AuthRequest } from "../../middleware/authenticate";
import { env } from "../../config/env";
import { container } from "../../container";
import { AppErrorFactory } from "../../factories/AppErrorFactory";
import { BaseController } from "../../base/BaseController";

const ACCESS_MAX_AGE_MS = container.tokenService.getAccessTokenExpiresInSeconds() * 1000;
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

class RegisterController extends BaseController {
  protected async execute(req: AuthRequest, res: Response) {
    const { email, password, fullName, roleRequest } = req.body;
    const result = await container.authService.register({ email, password, fullName, roleRequest });
    res.cookie(env.COOKIE_ACCESS_NAME, result.accessToken, cookieOptions(ACCESS_MAX_AGE_MS));
    res.cookie(env.COOKIE_REFRESH_NAME, result.refreshToken, cookieOptions(REFRESH_MAX_AGE_MS));
    res.status(201);
    return { success: true, user: result.user, accessToken: result.accessToken };
  }
}
export const register = new RegisterController().handleRequest.bind(new RegisterController());

class LoginController extends BaseController {
  protected async execute(req: AuthRequest, res: Response) {
    const result = await container.authService.login(req.body, req.ip);
    res.cookie(env.COOKIE_ACCESS_NAME, result.accessToken, cookieOptions(ACCESS_MAX_AGE_MS));
    res.cookie(env.COOKIE_REFRESH_NAME, result.refreshToken, cookieOptions(REFRESH_MAX_AGE_MS));
    return { success: true, user: result.user, accessToken: result.accessToken };
  }
}
export const login = new LoginController().handleRequest.bind(new LoginController());

class RefreshController extends BaseController {
  protected async execute(req: AuthRequest, res: Response) {
    const token = getRefreshTokenFromReq(req);
    if (!token) throw AppErrorFactory.validation("Refresh token required", { code: "BAD_REQUEST" });
    const result = await container.authService.refresh(token);
    res.cookie(env.COOKIE_ACCESS_NAME, result.accessToken, cookieOptions(ACCESS_MAX_AGE_MS));
    res.cookie(env.COOKIE_REFRESH_NAME, result.refreshToken, cookieOptions(REFRESH_MAX_AGE_MS));
    return { success: true, user: result.user, accessToken: result.accessToken };
  }
}
export const refresh = new RefreshController().handleRequest.bind(new RefreshController());

class LogoutController extends BaseController {
  protected async execute(req: AuthRequest, res: Response) {
    const token = getRefreshTokenFromReq(req);
    await container.authService.logout(token);
    const clearOpts = clearCookieOptions();
    res.clearCookie(env.COOKIE_ACCESS_NAME, clearOpts);
    res.clearCookie(env.COOKIE_REFRESH_NAME, clearOpts);
    return { success: true, message: "Logged out" };
  }
}
export const logout = new LogoutController().handleRequest.bind(new LogoutController());

class VerifyEmailController extends BaseController {
  protected async execute(req: AuthRequest) {
    const { token } = req.body;
    const result = await container.authService.verifyEmail(token);
    return { success: true, user: result.user };
  }
}
export const verifyEmail = new VerifyEmailController().handleRequest.bind(new VerifyEmailController());

class ForgotPasswordController extends BaseController {
  protected async execute(req: AuthRequest) {
    const { email } = req.body;
    const result = await container.authService.forgotPassword(email);
    return { success: true, message: result.message };
  }
}
export const forgotPassword = new ForgotPasswordController().handleRequest.bind(new ForgotPasswordController());

class ResetPasswordController extends BaseController {
  protected async execute(req: AuthRequest) {
    const { token, newPassword } = req.body;
    await container.authService.resetPassword(token, newPassword);
    return { success: true, message: "Password has been reset." };
  }
}
export const resetPassword = new ResetPasswordController().handleRequest.bind(new ResetPasswordController());

class MeController extends BaseController {
  protected async execute(req: AuthRequest) {
    if (!req.user) throw AppErrorFactory.unauthorized("Authentication required");
    const user = await container.authService.me(req.user.id);
    return { success: true, user };
  }
}
export const me = new MeController().handleRequest.bind(new MeController());
