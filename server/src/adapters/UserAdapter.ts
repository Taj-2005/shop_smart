export interface UserInput {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  emailVerified: boolean;
  active: boolean;
  roleId: string;
  lockedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  [key: string]: unknown; // Allow other fields like passwordHash to be passed in but ignored
}

export class UserAdapter {
  /**
   * Converts a raw user model from the database into a clean DTO for API responses.
   * Removes sensitive information like password hashes and tokens.
   * Formats dates to ISO strings.
   *
   * @param user - Raw user model
   * @returns Clean user DTO
   */
  static toDTO(user: UserInput) {
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      active: user.active,
      roleId: user.roleId,
      lockedUntil: user.lockedUntil ? user.lockedUntil.toISOString() : null,
      createdAt: user.createdAt ? user.createdAt.toISOString() : null,
      updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null,
      deletedAt: user.deletedAt ? user.deletedAt.toISOString() : null,
    };
  }
}

/*
Example Usage:

import { UserAdapter } from './adapters/UserAdapter';

const rawUser = await prisma.user.findUnique({ where: { id: "123" } });
const userDTO = UserAdapter.toDTO(rawUser);

// userDTO will NOT contain passwordHash, emailVerifyToken, etc.
// userDTO.createdAt will be an ISO string instead of a Date object.
res.json({ success: true, data: userDTO });
*/
