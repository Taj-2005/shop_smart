import type { IAccessTokenLifetime } from "./IAccessTokenLifetime";
import type { IAccessTokenVerifier } from "./IAccessTokenVerifier";
import type { IRefreshTokenVerifier } from "./IRefreshTokenVerifier";
import type { ISessionTokenIssuer } from "./ISessionTokenIssuer";

/** Access + refresh JWT lifecycle for a single deployment. */
export interface ITokenService
  extends IAccessTokenVerifier,
    ISessionTokenIssuer,
    IRefreshTokenVerifier,
    IAccessTokenLifetime {
  readonly name: string;
}
