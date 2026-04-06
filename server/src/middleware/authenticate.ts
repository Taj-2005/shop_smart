import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import { AppError } from "./errorHandler";
import type { IAccessTokenVerifier } from "../interfaces/IAccessTokenVerifier";
import type { IAuthenticatedUserLoader } from "../interfaces/IAuthenticatedUserLoader";

export type AuthRequest = Request & {
  user?: { id: string; email: string; role: string; roleType: string };
};

let accessTokenVerifier: IAccessTokenVerifier | null = null;
let authenticatedUserLoader: IAuthenticatedUserLoader | null = null;

export function bindAuthenticationDependencies(deps: {
  accessTokenVerifier: IAccessTokenVerifier;
  authenticatedUserLoader: IAuthenticatedUserLoader;
}): void {
  accessTokenVerifier = deps.accessTokenVerifier;
  authenticatedUserLoader = deps.authenticatedUserLoader;
}

function requireAuthDeps(): { accessTokenVerifier: IAccessTokenVerifier; authenticatedUserLoader: IAuthenticatedUserLoader } {
  if (!accessTokenVerifier || !authenticatedUserLoader) {
    throw new Error("Authentication dependencies not bound (import ./container before routes)");
  }
  return { accessTokenVerifier, authenticatedUserLoader };
}

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

export async function authenticate(req: AuthRequest, _res: Response, next: NextFunction): Promise<void> {
  const { accessTokenVerifier: verifier, authenticatedUserLoader: loader } = requireAuthDeps();
  const token = getAccessToken(req);
  if (!token) {
    next(new AppError(401, "Authentication required", "UNAUTHORIZED"));
    return;
  }
  try {
    const payload = verifier.verifyAccessToken(token);
    const user = await loader.loadActiveUser(payload.sub);
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
