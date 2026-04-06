import type { PrismaClient } from "@prisma/client";
import type { IUserReader } from "../interfaces/IUserReader";

export class PrismaUserReader implements IUserReader {
  constructor(private readonly prisma: PrismaClient) {}

  async listUsersForAdmin(take: number) {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
      select: { id: true, email: true, fullName: true, role: true, active: true, createdAt: true },
      take,
    });
  }

  async findUserProfileById(id: string) {
    return this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, email: true, fullName: true, role: true, avatarUrl: true, createdAt: true },
    });
  }

  async findOrdersByUserId(userId: string, take: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: { select: { id: true, name: true } } } } },
      orderBy: { createdAt: "desc" },
      take,
    });
  }

  async findCartWithItemsByUserId(userId: string) {
    return this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
  }
}
