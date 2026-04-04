import { EmailNotificationStrategy } from "../services/EmailNotificationStrategy";
import { NodemailerEmailService } from "../services/NodemailerEmailService";

/** @deprecated Prefer IAuthNotificationSender via AuthService / container. Kept for callers outside auth. */
const emailStrategy = new EmailNotificationStrategy(new NodemailerEmailService());

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  await emailStrategy.send({ kind: "verification", email: to, token });
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  await emailStrategy.send({ kind: "password_reset", email: to, token });
}
