import { logger } from "../config/logger";
import type { IAuthNotificationSender } from "../interfaces/IAuthNotificationSender";
import type { INotificationChannel } from "../interfaces/INotificationChannel";
import type { AuthNotificationContext } from "../interfaces/INotificationKinds";

/** Push channel: wire FCM/APNs here; no-op for email-only flows. */
export class PushNotificationStrategy implements IAuthNotificationSender, INotificationChannel {
  readonly channel = "push" as const;

  async send(ctx: AuthNotificationContext): Promise<void> {
    logger.debug("Push notification (stub)", { channel: this.channel, kind: ctx.kind, email: ctx.email });
  }
}
