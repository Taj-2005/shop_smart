import { env } from "../config/env";
import type { IOrderPricingStrategy, OrderLineInput, OrderPricingBreakdown } from "../interfaces/IOrderPricingStrategy";
import { clampPercent0to100, sanitizeOrderLineInputs } from "../utils/pricingMath";

/** Applies a percentage discount to subtotal (env ORDER_DISCOUNT_PERCENT). */
export class PercentageDiscountOrderPricingStrategy implements IOrderPricingStrategy {
  compute(lines: OrderLineInput[]): OrderPricingBreakdown {
    const safe = sanitizeOrderLineInputs(lines);
    const priced = safe.map((l) => ({
      productId: l.productId,
      quantity: l.quantity,
      price: l.unitPrice,
    }));
    const subtotal = priced.reduce((s, l) => s + l.price * l.quantity, 0);
    const pct = clampPercent0to100(env.ORDER_DISCOUNT_PERCENT);
    const discount = Math.round((subtotal * pct) / 100 * 100) / 100;
    const afterDiscount = Math.max(0, subtotal - discount);
    return {
      subtotal,
      discount,
      shipping: 0,
      total: afterDiscount,
      lines: priced,
    };
  }
}
