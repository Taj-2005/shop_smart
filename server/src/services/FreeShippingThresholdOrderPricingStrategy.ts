import type { IOrderPricingStrategy } from "../interfaces/IOrderPricingStrategy";
import { StandardOrderPricingStrategy } from "./StandardOrderPricingStrategy";

/**
 * Legacy name: line totals only. Shipping is applied via {@link FreeShippingStrategy} in the commerce registry.
 */
export class FreeShippingThresholdOrderPricingStrategy extends StandardOrderPricingStrategy implements IOrderPricingStrategy {}
