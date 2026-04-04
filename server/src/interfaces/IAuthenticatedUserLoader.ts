export interface AuthenticatedUserSnapshot {
  id: string;
  email: string;
  roleId: string;
  roleType: string;
}

/** Middleware: load session user after access token is verified. */
export interface IAuthenticatedUserLoader {
  loadActiveUser(userId: string): Promise<AuthenticatedUserSnapshot | null>;
}
