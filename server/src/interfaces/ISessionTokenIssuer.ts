import type { AccessTokenClaims } from "./IAccessTokenVerifier";

/** Issue access + refresh JWTs (no verification of access tokens). */
export interface ISessionTokenIssuer {
  signAccessToken(claims: AccessTokenClaims): string;
  signRefreshToken(userId: string, jti: string): string;
}
