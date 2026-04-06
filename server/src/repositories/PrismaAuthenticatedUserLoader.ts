import type { PrismaClient } from "@prisma/client";
import type { AuthenticatedUserSnapshot, IAuthenticatedUserLoader } from "../interfaces/IAuthenticatedUserLoader";

export class PrismaAuthenticatedUserLoader implements IAuthenticatedUserLoader {
  constructor(private readonly prisma: PrismaClient) {}

  async loadActiveUser(userId: string): Promise<AuthenticatedUserSnapshot | null> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, active: true, deletedAt: null },
      include: { role: true },
    });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      roleId: user.role.id,
      roleType: user.role.name,
    };
  }
}
