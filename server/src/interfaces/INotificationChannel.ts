import type { NotificationChannel } from "./INotificationKinds";

/** Operational metadata (metrics, registry) — separate from send contract. */
export interface INotificationChannel {
  readonly channel: NotificationChannel;
}
