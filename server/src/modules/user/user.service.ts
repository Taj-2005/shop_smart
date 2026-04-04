import type { IUserWriter } from "../../interfaces/IUserWriter";

/** Current-user profile updates: depends only on write-side user persistence. */
export class CurrentUserProfileService {
  constructor(private readonly users: IUserWriter) {}

  async patchProfile(userId: string, data: { fullName?: string; avatarUrl?: string | null }) {
    return this.users.updateProfile(userId, data);
  }
}
