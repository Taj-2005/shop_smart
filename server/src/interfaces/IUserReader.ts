import type { Prisma } from "@prisma/client";

export type UserAdminSummary = Prisma.UserGetPayload<{
  select: { id: true; email: true; fullName: true; role: true; active: true; createdAt: true };
}>;

export type UserProfile = Prisma.UserGetPayload<{
  select: { id: true; email: true; fullName: true; role: true; avatarUrl: true; createdAt: true };
}>;

export type OrderListRow = Prisma.OrderGetPayload<{
  include: {
    items: { include: { product: { select: { id: true; name: true } } } };
  };
}>;

export type CartWithItems = Prisma.CartGetPayload<{
  include: { items: { include: { product: true } } };
}>;

export interface IUserReader {
  listUsersForAdmin(take: number): Promise<UserAdminSummary[]>;
  findUserProfileById(id: string): Promise<UserProfile | null>;
  findOrdersByUserId(userId: string, take: number): Promise<OrderListRow[]>;
  findCartWithItemsByUserId(userId: string): Promise<CartWithItems | null>;
}
