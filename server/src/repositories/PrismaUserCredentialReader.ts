import type { PrismaClient } from "@prisma/client";
import type { IUserCredentialReader, UserWithRole } from "../interfaces/IUserCredentialReader";

export class PrismaUserCredentialReader implements IUserCredentialReader {
  constructor(private readonly prisma: PrismaClient) {}

  async existsByEmail(email: string): Promise<boolean> {
    const row = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
      select: { id: true },
    });
    return row != null;
  }

  async findForLogin(email: string): Promise<UserWithRole | null> {
    return this.prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: { role: true },
    });
  }

  async findWithRoleByIdForMe(id: string): Promise<UserWithRole | null> {
    return this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { role: true },
    });
  }

  async findByEmailVerifyTokenHash(tokenHash: string): Promise<UserWithRole | null> {
    return this.prisma.user.findFirst({
      where: {
        emailVerifyToken: tokenHash,
        emailVerifyExpires: { gte: new Date() },
      },
      include: { role: true },
    });
  }

  async findByPasswordResetTokenHash(tokenHash: string): Promise<UserWithRole | null> {
    return this.prisma.user.findFirst({
      where: {
        resetTokenHash: tokenHash,
        resetTokenExpires: { gte: new Date() },
      },
      include: { role: true },
    });
  }

  async findBasicByEmail(email: string): Promise<{ id: string; email: string } | null> {
    return this.prisma.user.findFirst({
      where: { email, deletedAt: null },
      select: { id: true, email: true },
    });
  }
}
