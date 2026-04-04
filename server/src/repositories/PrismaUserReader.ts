import { prisma } from "../config/prisma";
import type { IUserReader } from "../interfaces/IUserReader";

export class PrismaUserReader implements IUserReader {
  async listUsersForAdmin(take: number) {
    return prisma.user.findMany({
      where: { deletedAt: null },
      select: { id: true, email: true, fullName: true, role: true, active: true, createdAt: true },
      take,
    });
  }

  async findUserProfileById(id: string) {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, email: true, fullName: true, role: true, avatarUrl: true, createdAt: true },
    });
  }

  async findOrdersByUserId(userId: string, take: number) {
    return prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: { select: { id: true, name: true } } } } },
      orderBy: { createdAt: "desc" },
      take,
    });
  }

  async findCartWithItemsByUserId(userId: string) {
    return prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
  }
}

export const prismaUserReader = new PrismaUserReader();
