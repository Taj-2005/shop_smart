import { logger } from "../config/logger";
import type { AuthNotificationContext, INotificationStrategy } from "../interfaces/INotificationStrategy";

/** Push channel: wire FCM/APNs here; no-op for email-only flows. */
export class PushNotificationStrategy implements INotificationStrategy {
  readonly channel = "push" as const;

  async send(ctx: AuthNotificationContext): Promise<void> {
    logger.debug("Push notification (stub)", { channel: this.channel, kind: ctx.kind, email: ctx.email });
  }
}
