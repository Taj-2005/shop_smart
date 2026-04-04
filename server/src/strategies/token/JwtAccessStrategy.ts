import type { AccessTokenClaims } from "../../interfaces/IAccessTokenVerifier";
import type { ITokenStrategy } from "../../interfaces/ITokenStrategy";
import { signAccessToken, verifyAccessToken } from "../../utils/jwt";

export type JwtAccessVerified = AccessTokenClaims & { type?: string };

/** Stateless access JWT sign/verify using app JWT access settings. */
export class JwtAccessStrategy implements ITokenStrategy<AccessTokenClaims, JwtAccessVerified> {
  sign(payload: AccessTokenClaims): string {
    return signAccessToken(payload);
  }

  verify(token: string): JwtAccessVerified {
    return verifyAccessToken(token);
  }
}
