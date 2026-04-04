import { env } from "../config/env";
import type { IOrderPricingStrategy, OrderLineInput, OrderPricingBreakdown } from "../interfaces/IOrderPricingStrategy";

/** Free shipping when subtotal meets threshold; otherwise flat shipping (env-driven). */
export class FreeShippingThresholdOrderPricingStrategy implements IOrderPricingStrategy {
  compute(lines: OrderLineInput[]): OrderPricingBreakdown {
    const priced = lines.map((l) => ({
      productId: l.productId,
      quantity: l.quantity,
      price: l.unitPrice,
    }));
    const subtotal = priced.reduce((s, l) => s + l.price * l.quantity, 0);
    const shipping = subtotal >= env.ORDER_FREE_SHIPPING_THRESHOLD ? 0 : env.ORDER_FLAT_SHIPPING;
    return {
      subtotal,
      discount: 0,
      shipping,
      total: subtotal + shipping,
      lines: priced,
    };
  }
}
