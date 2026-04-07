import type { IDiscountStrategy } from "../../interfaces/IDiscountStrategy";

/** Fixed currency amount off subtotal; immutable `amount` configured at construction. */
export class FixedDiscountStrategy implements IDiscountStrategy {
  constructor(private readonly amount: number) {}

  amountOff(subtotal: number): number {
    if (!Number.isFinite(subtotal) || subtotal <= 0) return 0;
    const cap = Math.max(0, this.amount);
    return Math.min(subtotal, cap);
  }
}
