import type { Prisma } from "@prisma/client";

export type UserWithRole = Prisma.UserGetPayload<{ include: { role: true } }>;

export interface IUserCredentialReader {
  existsByEmail(email: string): Promise<boolean>;
  findForLogin(email: string): Promise<UserWithRole | null>;
  findWithRoleByIdForMe(id: string): Promise<UserWithRole | null>;
  findByEmailVerifyTokenHash(tokenHash: string): Promise<UserWithRole | null>;
  findByPasswordResetTokenHash(tokenHash: string): Promise<UserWithRole | null>;
  findBasicByEmail(email: string): Promise<{ id: string; email: string } | null>;
}
