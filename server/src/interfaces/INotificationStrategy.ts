export type AuthNotificationKind = "verification" | "password_reset";

export type NotificationChannel = "email" | "sms" | "push";

export interface AuthNotificationContext {
  kind: AuthNotificationKind;
  email: string;
  token: string;
  phoneE164?: string;
}

/**
 * Delivery channel for auth notifications. Implementations are substitutable:
 * `send` must always settle (resolve); use a no-op when the channel cannot act
 * (e.g. SMS without `phoneE164`), never reject for “unsupported” cases.
 */
export interface INotificationStrategy {
  readonly channel: NotificationChannel;
  send(ctx: AuthNotificationContext): Promise<void>;
}
