import { env } from "../config/env";
import type { IAccessTokenLifetime } from "../interfaces/IAccessTokenLifetime";
import type { IAccessTokenVerifier } from "../interfaces/IAccessTokenVerifier";
import type { IAuthNotificationSender } from "../interfaces/IAuthNotificationSender";
import type { IAuthTokenProvider } from "../interfaces/IAuthTokenProvider";
import type { INotificationChannel } from "../interfaces/INotificationChannel";
import type { IOrderPricingStrategy } from "../interfaces/IOrderPricingStrategy";
import type { IRefreshTokenVerifier } from "../interfaces/IRefreshTokenVerifier";
import type { ISessionTokenIssuer } from "../interfaces/ISessionTokenIssuer";
import { EmailNotificationStrategy } from "./EmailNotificationStrategy";
import { FreeShippingThresholdOrderPricingStrategy } from "./FreeShippingThresholdOrderPricingStrategy";
import { jwtAuthProvider } from "./JwtAuthProvider";
import { oauthJwtAuthProvider } from "./OAuthJwtAuthProvider";
import { PercentageDiscountOrderPricingStrategy } from "./PercentageDiscountOrderPricingStrategy";
import { PushNotificationStrategy } from "./PushNotificationStrategy";
import { SmsNotificationStrategy } from "./SmsNotificationStrategy";
import { StandardOrderPricingStrategy } from "./StandardOrderPricingStrategy";
import { NodemailerEmailService } from "./NodemailerEmailService";

const authProviderFactories: Record<string, () => IAuthTokenProvider> = {
  jwt: () => jwtAuthProvider,
  oauth_jwt: () => oauthJwtAuthProvider,
};

export function resolveAuthTokenProvider(): IAuthTokenProvider {
  const key = env.AUTH_PROVIDER.toLowerCase();
  const factory = authProviderFactories[key] ?? authProviderFactories.jwt;
  return factory();
}

const authTokenProviderSingleton = resolveAuthTokenProvider();

/** @deprecated Prefer granular exports (accessTokenVerifier, sessionTokenIssuer, …). */
export const authProvider = authTokenProviderSingleton;

export const accessTokenVerifier: IAccessTokenVerifier = authTokenProviderSingleton;

export const accessTokenLifetime: IAccessTokenLifetime = authTokenProviderSingleton;

export type AuthSessionTokens = ISessionTokenIssuer & IRefreshTokenVerifier & IAccessTokenLifetime;

export const sessionTokenIssuer: AuthSessionTokens = authTokenProviderSingleton;
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

export type AuthNotificationPipeline = IAuthNotificationSender & INotificationChannel;

export const authNotificationStrategies: AuthNotificationPipeline[] = [
  new EmailNotificationStrategy(new NodemailerEmailService()),
  new SmsNotificationStrategy(),
  new PushNotificationStrategy(),
];
