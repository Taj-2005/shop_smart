import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { accessClaimsFromJwtPayload, refreshClaimsFromJwtPayload } from "./authTokenPayloads";

export type AccessPayload = {
  sub: string;
  email: string;
  role: string;
  type: "access";
};

export type RefreshPayload = {
  sub: string;
  jti: string;
  type: "refresh";
};

export const ACCESS_TOKEN_EXPIRES_SECONDS = 3600;

function getRefreshExpiresSeconds(): number {
  return env.JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60;
}

export function signAccessToken(payload: Omit<AccessPayload, "type">): string {
  const options: SignOptions = { expiresIn: ACCESS_TOKEN_EXPIRES_SECONDS };
  return jwt.sign({ ...payload, type: "access" }, env.JWT_ACCESS_SECRET, options);
}

export function signRefreshToken(sub: string, jti: string): string {
  const options: SignOptions = { expiresIn: getRefreshExpiresSeconds() };
  return jwt.sign({ sub, jti, type: "refresh" }, env.JWT_REFRESH_SECRET, options);
}

export function verifyAccessToken(token: string): AccessPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
  if (typeof decoded === "string") {
    throw new jwt.JsonWebTokenError("Invalid token");
  }
  const claims = accessClaimsFromJwtPayload(decoded);
  return { sub: claims.sub, email: claims.email, role: claims.role, type: "access" };
}

export function verifyRefreshToken(token: string): RefreshPayload {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
  if (typeof decoded === "string") {
    throw new jwt.JsonWebTokenError("Invalid token");
  }
  const claims = refreshClaimsFromJwtPayload(decoded);
  return { sub: claims.sub, jti: claims.jti, type: "refresh" };
}
