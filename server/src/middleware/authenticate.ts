import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import { AppError } from "./errorHandler";
import { accessTokenVerifier } from "../services/registry";
import { prismaAuthenticatedUserLoader } from "../repositories/PrismaAuthenticatedUserLoader";

export type AuthRequest = Request & {
  user?: { id: string; email: string; role: string; roleType: string };
};

/**
 * Resolves JWT from request. Supports both:
 * - Authorization: Bearer <token> (for Swagger, API clients, mobile)
 * - Cookie (accessToken cookie for browser with credentials: include)
 * Bearer header takes precedence when both are present.
 */
function getAccessToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7).trim() || null;
  }
  return req.cookies?.[env.COOKIE_ACCESS_NAME] ?? null;
}

export async function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const token = getAccessToken(req);
  if (!token) {
    next(new AppError(401, "Authentication required", "UNAUTHORIZED"));
    return;
  }
  try {
    const payload = accessTokenVerifier.verifyAccessToken(token);
    const user = await prismaAuthenticatedUserLoader.loadActiveUser(payload.sub);
    if (!user) {
      next(new AppError(401, "User not found or inactive", "UNAUTHORIZED"));
      return;
    }
    req.user = {
      id: user.id,
      email: user.email,
      role: user.roleId,
      roleType: user.roleType,
    };
    next();
  } catch {
    next(new AppError(401, "Invalid or expired token", "UNAUTHORIZED"));
  }
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = getAccessToken(req);
  if (!token) {
    next();
    return;
  }
  authenticate(req, res, next);
}
