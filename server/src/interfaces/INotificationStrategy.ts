export type AuthNotificationKind = "verification" | "password_reset";

export type NotificationChannel = "email" | "sms" | "push";

/** Context for transactional auth-related notifications (extend fields for new templates without changing callers). */
export interface AuthNotificationContext {
  kind: AuthNotificationKind;
  email: string;
  token: string;
  /** Optional; SMS / push strategies no-op when absent. */
  phoneE164?: string;
}

export interface INotificationStrategy {
  readonly channel: NotificationChannel;
  send(ctx: AuthNotificationContext): Promise<void>;
}
