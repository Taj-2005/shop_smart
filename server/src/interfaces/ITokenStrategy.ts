/**
 * Single JWT concern (access or refresh). Implementations are stateless;
 * `TSign` / `TVerify` describe payload shapes for that token kind.
 */
export interface ITokenStrategy<TSign, TVerify> {
  sign(payload: TSign): string;
  verify(token: string): TVerify;
}
