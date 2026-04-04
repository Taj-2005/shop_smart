import { prisma } from "../config/prisma";
import type { Prisma } from "@prisma/client";
import type { IUserCredentialWriter } from "../interfaces/IUserCredentialWriter";
import type { UserWithRole } from "../interfaces/IUserCredentialReader";

export class PrismaUserCredentialWriter implements IUserCredentialWriter {
  async createCustomer(data: {
    email: string;
    passwordHash: string;
    fullName: string;
    roleId: string;
    emailVerifyTokenHash: string;
    emailVerifyExpires: Date;
  }): Promise<UserWithRole> {
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        fullName: data.fullName,
        roleId: data.roleId,
        emailVerified: false,
        emailVerifyToken: data.emailVerifyTokenHash,
        emailVerifyExpires: data.emailVerifyExpires,
      },
      include: { role: true },
    });
  }

  async updateFailedLogin(id: string, data: Prisma.UserUpdateInput): Promise<void> {
    await prisma.user.update({ where: { id }, data });
  }

  async clearFailedLoginAndLockout(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { failedLogins: 0, lockedUntil: null },
    });
  }

  async markEmailVerified(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpires: null,
      },
    });
  }

  async setPasswordResetToken(id: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: {
        resetTokenHash: tokenHash,
        resetTokenExpires: expiresAt,
      },
    });
  }

  async applyPasswordReset(id: string, passwordHash: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        resetTokenHash: null,
        resetTokenExpires: null,
        failedLogins: 0,
        lockedUntil: null,
      },
    });
  }
}

export const prismaUserCredentialWriter = new PrismaUserCredentialWriter();
