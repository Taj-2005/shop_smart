import type { AccessTokenClaims, IAuthProvider } from "../interfaces/IAuthProvider";
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from "../utils/jwt";

export class JwtAuthProvider implements IAuthProvider {
  readonly name = "jwt";

  signAccessToken(claims: AccessTokenClaims): string {
    return signAccessToken(claims);
  }

  signRefreshToken(userId: string, jti: string): string {
    return signRefreshToken(userId, jti);
  }

  verifyAccessToken(token: string): AccessTokenClaims & { type?: string } {
    return verifyAccessToken(token);
  }

  verifyRefreshToken(token: string): { sub: string; jti: string; type?: string } {
    return verifyRefreshToken(token);
  }

  getAccessTokenExpiresInSeconds(): number {
    return 3600;
  }
}

export const jwtAuthProvider = new JwtAuthProvider();
