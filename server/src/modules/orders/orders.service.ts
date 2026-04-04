import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";
import { OrderStatus } from "@prisma/client";

function serializeOrder<T extends { subtotal: unknown; discount: unknown; shipping: unknown; total: unknown; items: { price: unknown }[] }>(order: T) {
  return {
    ...order,
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    shipping: Number(order.shipping),
    total: Number(order.total),
    items: order.items.map((i) => ({ ...i, price: Number(i.price) })),
  };
}

export class OrderService {
  async create(
    userId: string,
    input: { addressId?: string; items: { productId: string; quantity: number }[] }
  ) {
    const { addressId, items } = input;
    if (!items?.length) throw new AppError(400, "items required", "VALIDATION_ERROR");
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds }, deletedAt: null, active: true } });
    let subtotal = 0;
    const orderItems = items.map((oi) => {
      const product = products.find((p) => p.id === oi.productId);
      if (!product) throw new AppError(400, "Product not found: " + oi.productId, "VALIDATION_ERROR");
      const price = Number(product.price);
      subtotal += price * oi.quantity;
      return { productId: product.id, quantity: oi.quantity, price };
    });
    const order = await prisma.order.create({
      data: {
        userId,
        addressId: addressId || null,
        status: OrderStatus.PENDING,
        subtotal,
        discount: 0,
        shipping: 0,
        total: subtotal,
        items: { create: orderItems },
      },
      include: { items: { include: { product: true } } },
    });
    return serializeOrder(order);
  }

  async listForUser(userId: string) {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: { select: { id: true, name: true, image: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return orders.map((o) => serializeOrder(o));
  }

  async getById(orderId: string, options: { userId: string; isAdmin: boolean }) {
    const { userId, isAdmin } = options;
    const order = await prisma.order.findFirst({
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
    if (!order) return null;
    return serializeOrder(order);
  }

  async updateStatus(orderId: string, status: OrderStatus) {
    if (!Object.values(OrderStatus).includes(status)) {
      throw new AppError(400, "Invalid status", "VALIDATION_ERROR");
    }
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: true },
    });
    return { ...order, subtotal: Number(order.subtotal), total: Number(order.total) };
  }
}

export const orderService = new OrderService();
