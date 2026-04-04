import { env } from "../config/env";
import type { IAuthProvider } from "../interfaces/IAuthProvider";
import type { INotificationStrategy } from "../interfaces/INotificationStrategy";
import type { IOrderPricingStrategy } from "../interfaces/IOrderPricingStrategy";
import { EmailNotificationStrategy } from "./EmailNotificationStrategy";
import { FreeShippingThresholdOrderPricingStrategy } from "./FreeShippingThresholdOrderPricingStrategy";
import { jwtAuthProvider } from "./JwtAuthProvider";
import { oauthJwtAuthProvider } from "./OAuthJwtAuthProvider";
import { PercentageDiscountOrderPricingStrategy } from "./PercentageDiscountOrderPricingStrategy";
import { PushNotificationStrategy } from "./PushNotificationStrategy";
import { SmsNotificationStrategy } from "./SmsNotificationStrategy";
import { StandardOrderPricingStrategy } from "./StandardOrderPricingStrategy";

const authProviderFactories: Record<string, () => IAuthProvider> = {
  jwt: () => jwtAuthProvider,
  oauth_jwt: () => oauthJwtAuthProvider,
};

export function resolveAuthProvider(): IAuthProvider {
  const key = env.AUTH_PROVIDER.toLowerCase();
  const factory = authProviderFactories[key] ?? authProviderFactories.jwt;
  return factory();
}

export const authProvider = resolveAuthProvider();

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

export const orderPricingStrategy = resolveOrderPricingStrategy();

/** Register additional strategies here only — AuthService stays unchanged. */
export const authNotificationStrategies: INotificationStrategy[] = [
  new EmailNotificationStrategy(),
  new SmsNotificationStrategy(),
  new PushNotificationStrategy(),
];
