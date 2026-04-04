import type { IAccessTokenLifetime } from "./IAccessTokenLifetime";
import type { IAccessTokenVerifier } from "./IAccessTokenVerifier";
import type { IRefreshTokenVerifier } from "./IRefreshTokenVerifier";
import type { ISessionTokenIssuer } from "./ISessionTokenIssuer";

/** Full token stack for a single deployment (JWT, OAuth-JWT, etc.). */
export interface IAuthTokenProvider
  extends IAccessTokenVerifier,
    ISessionTokenIssuer,
    IRefreshTokenVerifier,
    IAccessTokenLifetime {
  readonly name: string;
}
