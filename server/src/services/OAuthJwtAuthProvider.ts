import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import type { AccessTokenClaims, IAuthProvider } from "../interfaces/IAuthProvider";

const ACCESS_EXPIRES_SECONDS = 3600;

function refreshExpiresSeconds(): number {
  return env.JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60;
}

/**
 * OAuth-style JWT provider: separate signing keys from default JWT (env OAUTH_JWT_*).
 * Swap via AUTH_PROVIDER=oauth_jwt without changing AuthService or middleware.
 */
export class OAuthJwtAuthProvider implements IAuthProvider {
  readonly name = "oauth_jwt";

  private accessSecret(): string {
    return env.OAUTH_JWT_ACCESS_SECRET ?? `oauth-access:${env.JWT_ACCESS_SECRET}`;
  }

  private refreshSecret(): string {
    return env.OAUTH_JWT_REFRESH_SECRET ?? `oauth-refresh:${env.JWT_REFRESH_SECRET}`;
  }

  signAccessToken(claims: AccessTokenClaims): string {
    const options: SignOptions = { expiresIn: ACCESS_EXPIRES_SECONDS };
    return jwt.sign({ ...claims, type: "access", iss: this.name }, this.accessSecret(), options);
  }

  signRefreshToken(userId: string, jti: string): string {
    const options: SignOptions = { expiresIn: refreshExpiresSeconds() };
    return jwt.sign({ sub: userId, jti, type: "refresh", iss: this.name }, this.refreshSecret(), options);
  }

  verifyAccessToken(token: string): AccessTokenClaims & { type?: string } {
    return jwt.verify(token, this.accessSecret()) as AccessTokenClaims & { type?: string };
  }

  verifyRefreshToken(token: string): { sub: string; jti: string; type?: string } {
    return jwt.verify(token, this.refreshSecret()) as { sub: string; jti: string; type?: string };
  }

  getAccessTokenExpiresInSeconds(): number {
    return ACCESS_EXPIRES_SECONDS;
  }
}

export const oauthJwtAuthProvider = new OAuthJwtAuthProvider();
