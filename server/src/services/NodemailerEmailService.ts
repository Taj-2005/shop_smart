import nodemailer from "nodemailer";
import { env } from "../config/env";
import { logger } from "../config/logger";
import type { IEmailService } from "../interfaces/IEmailService";

export class NodemailerEmailService implements IEmailService {
  private readonly transporter = env.SMTP_HOST
    ? nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
      })
    : null;

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    if (!this.transporter) {
      logger.info("Email not sent (no SMTP)", { to, subject });
      return;
    }
    try {
      await this.transporter.sendMail({
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
