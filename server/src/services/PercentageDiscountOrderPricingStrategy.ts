import type { IOrderPricingStrategy } from "../interfaces/IOrderPricingStrategy";
import { StandardOrderPricingStrategy } from "./StandardOrderPricingStrategy";

/**
 * Legacy name: line totals only. Discount is applied via {@link PercentDiscountStrategy} in the commerce registry.
 */
export class PercentageDiscountOrderPricingStrategy extends StandardOrderPricingStrategy implements IOrderPricingStrategy {}
