export interface AccessTokenClaims {
  sub: string;
  email: string;
  role: string;
}

export interface IAuthProvider {
  /** Stable id for logging / metrics (e.g. jwt, oauth_jwt). */
  readonly name: string;
  signAccessToken(claims: AccessTokenClaims): string;
  signRefreshToken(userId: string, jti: string): string;
  verifyAccessToken(token: string): AccessTokenClaims & { type?: string };
  verifyRefreshToken(token: string): { sub: string; jti: string; type?: string };
  getAccessTokenExpiresInSeconds(): number;
}
