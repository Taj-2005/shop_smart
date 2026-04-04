import type { IOrderPricingStrategy, OrderLineInput, OrderPricingBreakdown } from "../interfaces/IOrderPricingStrategy";

export class StandardOrderPricingStrategy implements IOrderPricingStrategy {
  compute(lines: OrderLineInput[]): OrderPricingBreakdown {
    const priced = lines.map((l) => ({
      productId: l.productId,
      quantity: l.quantity,
      price: l.unitPrice,
    }));
    const subtotal = priced.reduce((s, l) => s + l.price * l.quantity, 0);
    return {
      subtotal,
      discount: 0,
      shipping: 0,
      total: subtotal,
      lines: priced,
    };
  }
}
