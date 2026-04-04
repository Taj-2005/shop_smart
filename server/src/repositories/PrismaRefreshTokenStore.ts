import type { PrismaClient } from "@prisma/client";
import type { IRefreshTokenStore, RefreshTokenWithUser } from "../interfaces/IRefreshTokenStore";

export class PrismaRefreshTokenStore implements IRefreshTokenStore {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: { id: string; tokenHash: string; userId: string; expiresAt: Date }): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        id: data.id,
        tokenHash: data.tokenHash,
        userId: data.userId,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findValidWithUser(jti: string, tokenHash: string): Promise<RefreshTokenWithUser | null> {
    return this.prisma.refreshToken.findFirst({
      where: { id: jti, tokenHash, revoked: false },
      include: { user: { include: { role: true } } },
    });
  }

  async revokeById(id: string): Promise<void> {
    await this.prisma.refreshToken.update({ where: { id }, data: { revoked: true } });
  }

  async revokeAllByTokenHash(tokenHash: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revoked: true },
    });
  }
}
