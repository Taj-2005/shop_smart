export type AuthNotificationKind = "verification" | "password_reset";

export type NotificationChannel = "email" | "sms" | "push";

export interface AuthNotificationContext {
  kind: AuthNotificationKind;
  email: string;
  token: string;
  /** Display name for welcome / verification copy (signup). */
  fullName?: string;
  phoneE164?: string;
}
