export interface AccessTokenClaims {
  sub: string;
  email: string;
  role: string;
}

/**
 * Token issuance and verification. Implementations are substitutable: the same callers
 * (AuthService, middleware) must receive tokens with identical claim shapes.
 * `verify*` throws `jsonwebtoken.JsonWebTokenError` (or subclass) when the token is invalid
 * or claims are missing — never returns partial/invalid claims.
 */
export interface IAuthProvider {
  readonly name: string;
  signAccessToken(claims: AccessTokenClaims): string;
  signRefreshToken(userId: string, jti: string): string;
  verifyAccessToken(token: string): AccessTokenClaims & { type?: string };
  verifyRefreshToken(token: string): { sub: string; jti: string; type?: string };
  getAccessTokenExpiresInSeconds(): number;
}
