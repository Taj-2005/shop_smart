import type { OrderLineInput } from "../interfaces/IOrderPricingStrategy";

/** Ensures every pricing strategy sees finite numeric inputs (substitutable postconditions). */
export function sanitizeOrderLineInputs(lines: OrderLineInput[]): OrderLineInput[] {
  return lines.map((l) => ({
    productId: l.productId,
    quantity: Number.isFinite(l.quantity) ? l.quantity : 0,
    unitPrice: Number.isFinite(l.unitPrice) ? l.unitPrice : 0,
  }));
}

export function clampPercent0to100(pct: number): number {
  if (!Number.isFinite(pct)) return 0;
  return Math.min(Math.max(pct, 0), 100);
}
