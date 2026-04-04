/** Parse / validate refresh JWT (opaque to access-token verifiers). */
export interface IRefreshTokenVerifier {
  verifyRefreshToken(token: string): { sub: string; jti: string; type?: string };
}
