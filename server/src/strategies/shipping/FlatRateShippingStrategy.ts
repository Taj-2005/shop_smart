import type { IShippingStrategy } from "../../interfaces/IShippingStrategy";

/** Constant shipping regardless of subtotal. */
export class FlatRateShippingStrategy implements IShippingStrategy {
  constructor(private readonly rate: number) {}

  cost(_subtotal: number): number {
    return Math.max(0, this.rate);
  }
}
