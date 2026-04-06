import type { OrderStatus, PrismaClient } from "@prisma/client";
import type { IOrderRepository } from "../interfaces/IOrderRepository";

export class PrismaOrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findActiveProductsByIds(ids: string[]) {
    return this.prisma.product.findMany({
      where: { id: { in: ids }, deletedAt: null, active: true },
      select: { id: true, price: true },
    });
  }

  async createOrderWithItems(data: {
    userId: string;
    addressId: string | null;
    status: OrderStatus;
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    items: { productId: string; quantity: number; price: number }[];
  }) {
    return this.prisma.order.create({
      data: {
        userId: data.userId,
        addressId: data.addressId,
        status: data.status,
        subtotal: data.subtotal,
        discount: data.discount,
        shipping: data.shipping,
        total: data.total,
        items: {
          create: data.items.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
            price: l.price,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });
  }

  findManyForUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: { select: { id: true, name: true, image: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  findFirstByIdForAccess(orderId: string, options: { userId: string; isAdmin: boolean }) {
    const { userId, isAdmin } = options;
    return this.prisma.order.findFirst({
      where: {
        id: orderId,
        ...(isAdmin ? {} : { userId }),
      },
      include: {
        items: { include: { product: true } },
        address: true,
        ...(isAdmin ? { user: { select: { id: true, email: true, fullName: true } } } : {}),
      },
    });
  }

  updateOrderStatus(orderId: string, status: OrderStatus) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: true },
    });
  }
}
