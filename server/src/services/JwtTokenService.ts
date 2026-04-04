import type { AccessTokenClaims } from "../interfaces/IAccessTokenVerifier";
import type { ITokenService } from "../interfaces/ITokenService";
import { JwtAccessStrategy } from "../strategies/token/JwtAccessStrategy";
import { JwtRefreshStrategy } from "../strategies/token/JwtRefreshStrategy";
import { ACCESS_TOKEN_EXPIRES_SECONDS } from "../utils/jwt";

export class JwtTokenService implements ITokenService {
  readonly name = "jwt";

  private readonly accessStrategy = new JwtAccessStrategy();
  private readonly refreshStrategy = new JwtRefreshStrategy();

  signAccessToken(claims: AccessTokenClaims): string {
    return this.accessStrategy.sign(claims);
  }

  signRefreshToken(userId: string, jti: string): string {
    return this.refreshStrategy.sign({ userId, jti });
  }

  verifyAccessToken(token: string): AccessTokenClaims & { type?: string } {
    return this.accessStrategy.verify(token);
  }

  verifyRefreshToken(token: string): { sub: string; jti: string; type?: string } {
    return this.refreshStrategy.verify(token);
  }

  getAccessTokenExpiresInSeconds(): number {
    return ACCESS_TOKEN_EXPIRES_SECONDS;
  }
}
