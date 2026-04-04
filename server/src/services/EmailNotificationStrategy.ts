import { env } from "../config/env";
import type { IAuthNotificationSender } from "../interfaces/IAuthNotificationSender";
import type { IEmailService } from "../interfaces/IEmailService";
import type { INotificationChannel } from "../interfaces/INotificationChannel";
import type { AuthNotificationContext, AuthNotificationKind } from "../interfaces/INotificationKinds";

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

export class EmailNotificationStrategy implements IAuthNotificationSender, INotificationChannel {
  readonly channel = "email" as const;

  constructor(private readonly email: IEmailService) {}

  async send(ctx: AuthNotificationContext): Promise<void> {
    if (!ctx.email?.trim()) return;
    const { subject, html } = emailContent[ctx.kind](ctx);
    await this.email.sendMail(ctx.email.trim(), subject, html);
  }
}
