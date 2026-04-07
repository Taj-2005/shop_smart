import { env } from "../config/env";
import type { IDiscountStrategy } from "../interfaces/IDiscountStrategy";
import type { IOrderPricingStrategy } from "../interfaces/IOrderPricingStrategy";
import type { IShippingStrategy } from "../interfaces/IShippingStrategy";
import { FixedDiscountStrategy } from "../strategies/discount/FixedDiscountStrategy";
import { PercentDiscountStrategy } from "../strategies/discount/PercentDiscountStrategy";
import { FlatRateShippingStrategy } from "../strategies/shipping/FlatRateShippingStrategy";
import { FreeShippingStrategy } from "../strategies/shipping/FreeShippingStrategy";
import { clampPercent0to100 } from "../utils/pricingMath";
import { StandardOrderPricingStrategy } from "./StandardOrderPricingStrategy";

export type OrderCommerceStrategies = {
  lines: IOrderPricingStrategy;
  discount: IDiscountStrategy;
  shipping: IShippingStrategy;
};

const zeroShipping = (): IShippingStrategy => new FlatRateShippingStrategy(0);
const noPercentDiscount = (): IDiscountStrategy => new PercentDiscountStrategy(0);

const commerceFactories: Record<string, () => OrderCommerceStrategies> = {
  standard: () => ({
    lines: new StandardOrderPricingStrategy(),
    discount: noPercentDiscount(),
    shipping: zeroShipping(),
  }),
  percent_discount: () => ({
    lines: new StandardOrderPricingStrategy(),
    discount: new PercentDiscountStrategy(clampPercent0to100(env.ORDER_DISCOUNT_PERCENT)),
    shipping: zeroShipping(),
  }),
  free_shipping_threshold: () => ({
    lines: new StandardOrderPricingStrategy(),
    discount: noPercentDiscount(),
    shipping: new FreeShippingStrategy(env.ORDER_FREE_SHIPPING_THRESHOLD, env.ORDER_FLAT_SHIPPING),
  }),
  fixed_discount: () => ({
    lines: new StandardOrderPricingStrategy(),
    discount: new FixedDiscountStrategy(env.ORDER_FIXED_DISCOUNT),
    shipping: zeroShipping(),
  }),
};

/**
 * Line pricing + discount + shipping strategies for checkout (composition root picks one profile; no runtime if/else).
 */
export function resolveOrderCommerceStrategies(): OrderCommerceStrategies {
  const key = env.ORDER_PRICING_STRATEGY.toLowerCase();
  const factory = commerceFactories[key] ?? commerceFactories.standard;
  return factory();
}

/** @deprecated Use {@link resolveOrderCommerceStrategies} for discount/shipping composition. */
export function resolveOrderPricingStrategy(): IOrderPricingStrategy {
  return resolveOrderCommerceStrategies().lines;
}
