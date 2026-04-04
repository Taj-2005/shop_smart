import dotenv from "dotenv";

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: parseInt(process.env.PORT ?? "4000", 10),
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? "dev-access-secret-change-me",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret-change-me",
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES ?? "1h",
  JWT_REFRESH_EXPIRES_DAYS: parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS ?? "30", 10),
  FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:3000",
  COOKIE_ACCESS_NAME: process.env.COOKIE_ACCESS_NAME ?? "accessToken",
  COOKIE_REFRESH_NAME: process.env.COOKIE_REFRESH_NAME ?? "refreshToken",
  /** For cross-site cookies use ".yourrootdomain.com" when frontend and backend share domain; leave empty otherwise. */
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN ?? undefined,
  /** Must be true with sameSite: "none" for cross-site. Use HTTPS in production. */
  COOKIE_SECURE: process.env.COOKIE_SECURE !== "false" && process.env.NODE_ENV === "production",
  /** Explicit override; when COOKIE_SECURE is true defaults to "none", else "lax". */
  COOKIE_SAME_SITE: process.env.COOKIE_SAME_SITE as "strict" | "lax" | "none" | undefined,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT ?? "587", 10),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM ?? "noreply@shopsmart.example.com",
  MAX_FAILED_LOGINS: parseInt(process.env.MAX_FAILED_LOGINS ?? "5", 10),
  LOCKOUT_MINUTES: parseInt(process.env.LOCKOUT_MINUTES ?? "15", 10),
  /** jwt | oauth_jwt — resolved in services/registry.ts */
  AUTH_PROVIDER: process.env.AUTH_PROVIDER ?? "jwt",
  OAUTH_JWT_ACCESS_SECRET: process.env.OAUTH_JWT_ACCESS_SECRET,
  OAUTH_JWT_REFRESH_SECRET: process.env.OAUTH_JWT_REFRESH_SECRET,
  /** standard | percent_discount | free_shipping_threshold */
  ORDER_PRICING_STRATEGY: process.env.ORDER_PRICING_STRATEGY ?? "standard",
  ORDER_DISCOUNT_PERCENT: parseFloat(process.env.ORDER_DISCOUNT_PERCENT ?? "10"),
  ORDER_FREE_SHIPPING_THRESHOLD: parseFloat(process.env.ORDER_FREE_SHIPPING_THRESHOLD ?? "100"),
  ORDER_FLAT_SHIPPING: parseFloat(process.env.ORDER_FLAT_SHIPPING ?? "5"),
};

if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}
