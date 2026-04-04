import type { ITokenStrategy } from "../../interfaces/ITokenStrategy";
import { signRefreshToken, verifyRefreshToken } from "../../utils/jwt";

export type RefreshSignPayload = { userId: string; jti: string };

export type JwtRefreshVerified = { sub: string; jti: string; type?: string };

/** Stateless refresh JWT sign/verify using app JWT refresh settings. */
export class JwtRefreshStrategy implements ITokenStrategy<RefreshSignPayload, JwtRefreshVerified> {
  sign(payload: RefreshSignPayload): string {
    return signRefreshToken(payload.userId, payload.jti);
  }

  verify(token: string): JwtRefreshVerified {
    return verifyRefreshToken(token);
  }
}
