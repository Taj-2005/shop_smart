import type { AuthNotificationContext } from "./INotificationKinds";

/** Auth domain: dispatch transactional notifications (implementations may no-op). */
export interface IAuthNotificationSender {
  send(ctx: AuthNotificationContext): Promise<void>;
}
