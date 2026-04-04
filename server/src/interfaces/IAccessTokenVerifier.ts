export interface AccessTokenClaims {
  sub: string;
  email: string;
  role: string;
}

/** HTTP / gateway: validate access JWT only. */
export interface IAccessTokenVerifier {
  verifyAccessToken(token: string): AccessTokenClaims & { type?: string };
}
