/** Cookie / client hints: access token TTL without signing capability. */
export interface IAccessTokenLifetime {
  getAccessTokenExpiresInSeconds(): number;
}
