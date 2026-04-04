import nodemailer from "nodemailer";
import { env } from "../config/env";
import { logger } from "../config/logger";
import type {
  AuthNotificationContext,
  AuthNotificationKind,
  INotificationStrategy,
} from "../interfaces/INotificationStrategy";

const transporter = env.SMTP_HOST
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    })
  : null;

const emailContent: Record<
  AuthNotificationKind,
  (ctx: AuthNotificationContext) => { subject: string; html: string }
> = {
  verification: (ctx) => {
    const link = `${env.FRONTEND_URL}/verify-email?token=${ctx.token}`;
    return {
      subject: "Verify your ShopSmart email",
      html: `
    <p>Please verify your email by clicking the link below:</p>
    <p><a href="${link}">${link}</a></p>
    <p>This link expires in 24 hours.</p>
  `,
    };
  },
  password_reset: (ctx) => {
    const link = `${env.FRONTEND_URL}/reset-password?token=${ctx.token}`;
    return {
      subject: "Reset your ShopSmart password",
      html: `
    <p>You requested a password reset. Click the link below to set a new password:</p>
    <p><a href="${link}">${link}</a></p>
    <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
  `,
    };
  },
};

export class EmailNotificationStrategy implements INotificationStrategy {
  readonly channel = "email" as const;

  async send(ctx: AuthNotificationContext): Promise<void> {
    const { subject, html } = emailContent[ctx.kind](ctx);
    await this.sendMail(ctx.email, subject, html);
  }

  private async sendMail(to: string, subject: string, html: string): Promise<void> {
    if (!transporter) {
      logger.info("Email not sent (no SMTP)", { to, subject });
      return;
    }
    try {
      await transporter.sendMail({
        from: env.SMTP_FROM ?? "noreply@shopsmart.example.com",
        to,
        subject,
        html,
      });
    } catch (e) {
      logger.error("Email send failed", { to, subject, err: String(e) });
    }
  }
}
