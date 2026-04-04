import { env } from "../config/env";
import type { IOrderPricingStrategy, OrderLineInput, OrderPricingBreakdown } from "../interfaces/IOrderPricingStrategy";
import { sanitizeOrderLineInputs } from "../utils/pricingMath";

/** Free shipping when subtotal meets threshold; otherwise flat shipping (env-driven). */
export class FreeShippingThresholdOrderPricingStrategy implements IOrderPricingStrategy {
  compute(lines: OrderLineInput[]): OrderPricingBreakdown {
    const safe = sanitizeOrderLineInputs(lines);
    const priced = safe.map((l) => ({
      productId: l.productId,
      quantity: l.quantity,
      price: l.unitPrice,
    }));
    const subtotal = priced.reduce((s, l) => s + l.price * l.quantity, 0);
    const threshold = env.ORDER_FREE_SHIPPING_THRESHOLD;
    const flat = env.ORDER_FLAT_SHIPPING;
    const shipping = subtotal >= threshold ? 0 : flat;
    return {
      subtotal,
      discount: 0,
      shipping,
      total: subtotal + shipping,
      lines: priced,
    };
  }
}
