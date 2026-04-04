import type { Prisma } from "@prisma/client";

export type UserProfilePatchResult = Prisma.UserGetPayload<{
  select: { id: true; email: true; fullName: true; role: true; avatarUrl: true; createdAt: true };
}>;

export interface IUserWriter {
  updateProfile(
    id: string,
    data: { fullName?: string; avatarUrl?: string | null }
  ): Promise<UserProfilePatchResult>;
  softDelete(id: string): Promise<void>;
}

