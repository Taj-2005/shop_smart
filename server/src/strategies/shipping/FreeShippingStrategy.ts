import type { IShippingStrategy } from "../../interfaces/IShippingStrategy";

/** Zero shipping when subtotal >= threshold; otherwise `flatRate`. */
export class FreeShippingStrategy implements IShippingStrategy {
  constructor(
    private readonly threshold: number,
    private readonly flatRate: number
  ) {}

  cost(subtotal: number): number {
    if (!Number.isFinite(subtotal)) return Math.max(0, this.flatRate);
    return subtotal >= this.threshold ? 0 : Math.max(0, this.flatRate);
  }
}
