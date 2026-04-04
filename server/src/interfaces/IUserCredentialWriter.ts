import type { Prisma } from "@prisma/client";
import type { UserWithRole } from "./IUserCredentialReader";

export interface IUserCredentialWriter {
  createCustomer(data: {
    email: string;
    passwordHash: string;
    fullName: string;
    roleId: string;
    emailVerifyTokenHash: string;
    emailVerifyExpires: Date;
  }): Promise<UserWithRole>;
  updateFailedLogin(id: string, data: Prisma.UserUpdateInput): Promise<void>;
  clearFailedLoginAndLockout(id: string): Promise<void>;
  markEmailVerified(id: string): Promise<void>;
  setPasswordResetToken(id: string, tokenHash: string, expiresAt: Date): Promise<void>;
  applyPasswordReset(id: string, passwordHash: string): Promise<void>;
}
