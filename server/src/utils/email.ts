import { EmailNotificationStrategy } from "../services/EmailNotificationStrategy";

/** @deprecated Prefer INotificationStrategy via AuthService / registry. Kept for callers outside auth. */
const emailStrategy = new EmailNotificationStrategy();

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  await emailStrategy.send({ kind: "verification", email: to, token });
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  await emailStrategy.send({ kind: "password_reset", email: to, token });
}
