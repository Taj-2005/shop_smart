import type { AccessTokenClaims } from "../interfaces/IAccessTokenVerifier";
import type { ITokenService } from "../interfaces/ITokenService";
import {
  ACCESS_TOKEN_EXPIRES_SECONDS,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/jwt";

export class JwtTokenService implements ITokenService {
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
    return ACCESS_TOKEN_EXPIRES_SECONDS;
  }
}
