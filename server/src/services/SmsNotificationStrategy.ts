import { logger } from "../config/logger";
import type { IAuthNotificationSender } from "../interfaces/IAuthNotificationSender";
import type { INotificationChannel } from "../interfaces/INotificationChannel";
import type { AuthNotificationContext } from "../interfaces/INotificationKinds";

/** SMS channel: extend with Twilio/etc. without changing AuthService. */
export class SmsNotificationStrategy implements IAuthNotificationSender, INotificationChannel {
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
