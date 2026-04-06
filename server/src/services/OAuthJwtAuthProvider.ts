import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import type { AccessTokenClaims } from "../interfaces/IAccessTokenVerifier";
import type { IAuthTokenProvider } from "../interfaces/IAuthTokenProvider";
import { accessClaimsFromJwtPayload, refreshClaimsFromJwtPayload } from "../utils/authTokenPayloads";
import { ACCESS_TOKEN_EXPIRES_SECONDS } from "../utils/jwt";

function refreshExpiresSeconds(): number {
  return env.JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60;
}

/**
 * OAuth-style JWT provider: separate signing keys from default JWT (env OAUTH_JWT_*).
 * Swap via AUTH_PROVIDER=oauth_jwt without changing AuthService or middleware.
 */
export class OAuthJwtAuthProvider implements IAuthTokenProvider {
  readonly name = "oauth_jwt";

  private accessSecret(): string {
    return env.OAUTH_JWT_ACCESS_SECRET ?? `oauth-access:${env.JWT_ACCESS_SECRET}`;
  }

  private refreshSecret(): string {
    return env.OAUTH_JWT_REFRESH_SECRET ?? `oauth-refresh:${env.JWT_REFRESH_SECRET}`;
  }

  signAccessToken(claims: AccessTokenClaims): string {
    const options: SignOptions = { expiresIn: ACCESS_TOKEN_EXPIRES_SECONDS };
    return jwt.sign({ ...claims, type: "access", iss: this.name }, this.accessSecret(), options);
  }

  signRefreshToken(userId: string, jti: string): string {
    const options: SignOptions = { expiresIn: refreshExpiresSeconds() };
    return jwt.sign({ sub: userId, jti, type: "refresh", iss: this.name }, this.refreshSecret(), options);
  }

  verifyAccessToken(token: string): AccessTokenClaims & { type?: string } {
    const decoded = jwt.verify(token, this.accessSecret());
    if (typeof decoded === "string") {
      throw new jwt.JsonWebTokenError("Invalid token");
    }
    return accessClaimsFromJwtPayload(decoded);
  }

  verifyRefreshToken(token: string): { sub: string; jti: string; type?: string } {
    const decoded = jwt.verify(token, this.refreshSecret());
    if (typeof decoded === "string") {
      throw new jwt.JsonWebTokenError("Invalid token");
    }
    return refreshClaimsFromJwtPayload(decoded);
  }

  getAccessTokenExpiresInSeconds(): number {
    return ACCESS_TOKEN_EXPIRES_SECONDS;
  }
}

export const oauthJwtAuthProvider = new OAuthJwtAuthProvider();
