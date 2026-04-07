import { AppErrorFactory } from "../../factories/AppErrorFactory";
import { OrderStatus } from "@prisma/client";
import { EventBus } from "../../events/EventBus";
import type { OrderStatusValue } from "../../events/events.types";
import type { IDiscountStrategy } from "../../interfaces/IDiscountStrategy";
import type { IOrderPricingStrategy, OrderLineInput } from "../../interfaces/IOrderPricingStrategy";
import type { IOrderRepository } from "../../interfaces/IOrderRepository";
import type { IShippingStrategy } from "../../interfaces/IShippingStrategy";

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
    private readonly discount: IDiscountStrategy,
    private readonly shipping: IShippingStrategy,
    private readonly orders: IOrderRepository
  ) {}

  async create(userId: string, input: { addressId?: string; items: { productId: string; quantity: number }[] }) {
    const { addressId, items } = input;
    if (!items?.length) throw AppErrorFactory.validation("items required");
    const productIds = items.map((i) => i.productId);
    const products = await this.orders.findActiveProductsByIds(productIds);
    const lineInputs: OrderLineInput[] = items.map((oi) => {
      const product = products.find((p) => p.id === oi.productId);
      if (!product) throw AppErrorFactory.validation("Product not found: " + oi.productId);
      return {
        productId: product.id,
        quantity: oi.quantity,
        unitPrice: Number(product.price),
      };
    });
    const breakdown = this.pricing.compute(lineInputs);
    const discount = this.discount.amountOff(breakdown.subtotal);
    const shipping = this.shipping.cost(breakdown.subtotal);
    const total = Math.max(0, breakdown.subtotal - discount) + shipping;
    const order = await this.orders.createOrderWithItems({
      userId,
      addressId: addressId || null,
      status: OrderStatus.PENDING,
      subtotal: breakdown.subtotal,
      discount,
      shipping,
      total,
      items: breakdown.lines.map((l) => ({
        productId: l.productId,
        quantity: l.quantity,
        price: l.price,
      })),
    });
    const created = order as { id: string };
    EventBus.emit("OrderStatusChanged", {
      orderId: created.id,
      userId,
      previousStatus: OrderStatus.PENDING as OrderStatusValue,
      status: OrderStatus.PENDING as OrderStatusValue,
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
      throw AppErrorFactory.validation("Invalid status");
    }
    const existing = (await this.orders.findFirstByIdForAccess(orderId, {
      userId: "",
      isAdmin: true,
    })) as { userId: string; status: OrderStatus; id: string } | null;

    const order = (await this.orders.updateOrderStatus(orderId, status)) as {
      id: string;
      userId: string;
      status: OrderStatus;
      subtotal: unknown;
      total: unknown;
      items: unknown;
    };
    EventBus.emit("OrderStatusChanged", {
      orderId: order.id,
      userId: order.userId,
      previousStatus: (existing?.status ?? order.status) as OrderStatusValue,
      status: order.status as OrderStatusValue,
    });
    return { ...order, subtotal: Number(order.subtotal), total: Number(order.total) };
  }
}
