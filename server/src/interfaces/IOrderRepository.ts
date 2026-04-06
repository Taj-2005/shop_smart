import type { OrderStatus, Prisma } from "@prisma/client";

export interface IOrderRepository {
  findActiveProductsByIds(ids: string[]): Promise<{ id: string; price: Prisma.Decimal }[]>;
  createOrderWithItems(data: {
    userId: string;
    addressId: string | null;
    status: OrderStatus;
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    items: { productId: string; quantity: number; price: number }[];
  }): Promise<unknown>;
  findManyForUser(userId: string): Promise<unknown[]>;
  findFirstByIdForAccess(
    orderId: string,
    options: { userId: string; isAdmin: boolean }
  ): Promise<unknown | null>;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<unknown>;
}
