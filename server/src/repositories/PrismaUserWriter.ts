import type { PrismaClient } from "@prisma/client";
import type { IUserWriter } from "../interfaces/IUserWriter";

export class PrismaUserWriter implements IUserWriter {
  constructor(private readonly prisma: PrismaClient) {}

  async updateProfile(id: string, data: { fullName?: string; avatarUrl?: string | null }) {
    return this.prisma.user.update({
      where: { id },
      data: { ...(data.fullName != null && { fullName: data.fullName }), ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }) },
      select: { id: true, email: true, fullName: true, role: true, avatarUrl: true, createdAt: true },
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { deletedAt: new Date(), active: false } });
  }
}
