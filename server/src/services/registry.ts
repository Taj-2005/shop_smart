import { env } from "../config/env";
import type { IOrderPricingStrategy } from "../interfaces/IOrderPricingStrategy";
import { FreeShippingThresholdOrderPricingStrategy } from "./FreeShippingThresholdOrderPricingStrategy";
import { PercentageDiscountOrderPricingStrategy } from "./PercentageDiscountOrderPricingStrategy";
import { StandardOrderPricingStrategy } from "./StandardOrderPricingStrategy";

const pricingFactories: Record<string, () => IOrderPricingStrategy> = {
  standard: () => new StandardOrderPricingStrategy(),
  percent_discount: () => new PercentageDiscountOrderPricingStrategy(),
  free_shipping_threshold: () => new FreeShippingThresholdOrderPricingStrategy(),
};

export function resolveOrderPricingStrategy(): IOrderPricingStrategy {
  const key = env.ORDER_PRICING_STRATEGY.toLowerCase();
  const factory = pricingFactories[key] ?? pricingFactories.standard;
  return factory();
}
