import jwt, { type JwtPayload } from "jsonwebtoken";
import type { AccessTokenClaims } from "../interfaces/IAuthProvider";

/** Same validation for every IAuthProvider implementation after jwt.verify. */
export function accessClaimsFromJwtPayload(payload: JwtPayload): AccessTokenClaims & { type?: string } {
  const sub = payload.sub;
  const email = (payload as Record<string, unknown>).email;
  const role = (payload as Record<string, unknown>).role;
  if (sub === undefined || sub === null || email === undefined || email === null || role === undefined || role === null) {
    throw new jwt.JsonWebTokenError("Invalid access token payload");
  }
  return {
    sub: String(sub),
    email: String(email),
    role: String(role),
    type: typeof payload.type === "string" ? payload.type : undefined,
  };
}

export function refreshClaimsFromJwtPayload(payload: JwtPayload): { sub: string; jti: string; type?: string } {
  const sub = payload.sub;
  const jti = payload.jti;
  if (sub === undefined || sub === null || jti === undefined || jti === null) {
    throw new jwt.JsonWebTokenError("Invalid refresh token payload");
  }
  return {
    sub: String(sub),
    jti: String(jti),
    type: typeof payload.type === "string" ? payload.type : undefined,
  };
}
