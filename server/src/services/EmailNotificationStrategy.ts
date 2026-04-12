import { env } from "../config/env";
import { buildPasswordResetEmail, buildVerificationEmail } from "../email/transactional-email";
import type { IAuthNotificationSender } from "../interfaces/IAuthNotificationSender";
import type { IEmailService } from "../interfaces/IEmailService";
import type { INotificationChannel } from "../interfaces/INotificationChannel";
import type { AuthNotificationContext, AuthNotificationKind } from "../interfaces/INotificationKinds";

const frontendBase = env.FRONTEND_URL.replace(/\/$/, "");

function buildEmail(ctx: AuthNotificationContext): { subject: string; html: string } {
  if (ctx.kind === "verification") {
    const verifyUrl = `${frontendBase}/verify-email?token=${encodeURIComponent(ctx.token)}`;
    return buildVerificationEmail({
      fullName: ctx.fullName,
      verifyUrl,
    });
  }
  const resetUrl = `${frontendBase}/reset-password?token=${encodeURIComponent(ctx.token)}`;
  return buildPasswordResetEmail({ resetUrl });
}

const kinds: AuthNotificationKind[] = ["verification", "password_reset"];

export class EmailNotificationStrategy implements IAuthNotificationSender, INotificationChannel {
  readonly channel = "email" as const;

  constructor(private readonly email: IEmailService) {}

  async send(ctx: AuthNotificationContext): Promise<void> {
    if (!ctx.email?.trim()) return;
    if (!kinds.includes(ctx.kind)) return;
    const { subject, html } = buildEmail(ctx);
    await this.email.sendMail(ctx.email.trim(), subject, html);
  }
}
