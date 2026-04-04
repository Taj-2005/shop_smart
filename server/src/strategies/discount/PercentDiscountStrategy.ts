import type { IDiscountStrategy } from "../../interfaces/IDiscountStrategy";
import { clampPercent0to100 } from "../../utils/pricingMath";

/** Percent of subtotal as discount; immutable `percent` configured at construction. */
export class PercentDiscountStrategy implements IDiscountStrategy {
  constructor(private readonly percent: number) {}

  amountOff(subtotal: number): number {
    if (!Number.isFinite(subtotal) || subtotal <= 0) return 0;
    const pct = clampPercent0to100(this.percent);
    return Math.round(((subtotal * pct) / 100) * 100) / 100;
  }
}
