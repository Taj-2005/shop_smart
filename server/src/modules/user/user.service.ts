import type { IUserWriter } from "../../interfaces/IUserWriter";
import { prismaUserWriter } from "../../repositories/PrismaUserWriter";

/** Current-user profile updates: depends only on write-side user persistence. */
export class CurrentUserProfileService {
  constructor(private readonly users: IUserWriter) {}

  async patchProfile(userId: string, data: { fullName?: string; avatarUrl?: string | null }) {
    return this.users.updateProfile(userId, data);
  }
}

export const currentUserProfileService = new CurrentUserProfileService(prismaUserWriter);
