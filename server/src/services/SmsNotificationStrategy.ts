import { logger } from "../config/logger";
import type { AuthNotificationContext, INotificationStrategy } from "../interfaces/INotificationStrategy";

/** SMS channel: extend with Twilio/etc. without changing AuthService. */
export class SmsNotificationStrategy implements INotificationStrategy {
  readonly channel = "sms" as const;

  async send(ctx: AuthNotificationContext): Promise<void> {
    if (!ctx.phoneE164) return;
    logger.info("SMS notification (stub)", {
      channel: this.channel,
      kind: ctx.kind,
      to: ctx.phoneE164,
    });
  }
}
