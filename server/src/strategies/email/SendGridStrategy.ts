import { logger } from "../../config/logger";
import type { IEmailProviderStrategy } from "../../interfaces/IEmailProviderStrategy";

/** Placeholder SendGrid integration; does not send mail. */
export class SendGridStrategy implements IEmailProviderStrategy {
  async sendMail(to: string, subject: string, _html: string): Promise<void> {
    logger.info("SendGridStrategy stub (not configured)", { to, subject });
  }
}
