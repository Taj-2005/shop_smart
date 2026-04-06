import type { ITokenService } from "./ITokenService";

/** Full token stack for a single deployment (JWT, OAuth-JWT, etc.). */
export type IAuthTokenProvider = ITokenService;
