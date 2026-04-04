import { AppError } from "../../middleware/errorHandler";
import { OrderStatus } from "@prisma/client";
import type { IOrderPricingStrategy, OrderLineInput } from "../../interfaces/IOrderPricingStrategy";
import type { IOrderRepository } from "../../interfaces/IOrderRepository";

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
  constructor(
    private readonly pricing: IOrderPricingStrategy,
    private readonly orders: IOrderRepository
  ) {}

  async create(userId: string, input: { addressId?: string; items: { productId: string; quantity: number }[] }) {
    const { addressId, items } = input;
    if (!items?.length) throw new AppError(400, "items required", "VALIDATION_ERROR");
    const productIds = items.map((i) => i.productId);
    const products = await this.orders.findActiveProductsByIds(productIds);
    const lineInputs: OrderLineInput[] = items.map((oi) => {
      const product = products.find((p) => p.id === oi.productId);
      if (!product) throw new AppError(400, "Product not found: " + oi.productId, "VALIDATION_ERROR");
      return {
        productId: product.id,
        quantity: oi.quantity,
        unitPrice: Number(product.price),
      };
    });
    const breakdown = this.pricing.compute(lineInputs);
    const order = await this.orders.createOrderWithItems({
      userId,
      addressId: addressId || null,
      status: OrderStatus.PENDING,
      subtotal: breakdown.subtotal,
      discount: breakdown.discount,
      shipping: breakdown.shipping,
      total: breakdown.total,
      items: breakdown.lines.map((l) => ({
        productId: l.productId,
        quantity: l.quantity,
        price: l.price,
      })),
    });
    return serializeOrder(order as Parameters<typeof serializeOrder>[0]);
  }

  async listForUser(userId: string) {
    const orders = await this.orders.findManyForUser(userId);
    return orders.map((o) => serializeOrder(o as Parameters<typeof serializeOrder>[0]));
  }

  async getById(orderId: string, options: { userId: string; isAdmin: boolean }) {
    const order = await this.orders.findFirstByIdForAccess(orderId, options);
    if (!order) return null;
    return serializeOrder(order as Parameters<typeof serializeOrder>[0]);
  }

  async updateStatus(orderId: string, status: OrderStatus) {
    if (!Object.values(OrderStatus).includes(status)) {
      throw new AppError(400, "Invalid status", "VALIDATION_ERROR");
    }
    const order = (await this.orders.updateOrderStatus(orderId, status)) as {
      subtotal: unknown;
      total: unknown;
      items: unknown;
    };
    return { ...order, subtotal: Number(order.subtotal), total: Number(order.total) };
  }
}
