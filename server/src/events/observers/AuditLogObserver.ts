import { LoggerService } from "../../services/LoggerService";
import { EventBus } from "../EventBus";
import type { AppEventMap, AppEventName } from "../events.types";

const ALL_EVENTS: AppEventName[] = [
  "OrderStatusChanged",
  "ReviewSubmitted",
  "UserRegistered",
  "PaymentProcessed",
];

/**
 * Critical: records every domain event for traceability (observer → EventBus).
 */
export class AuditLogObserver {
  register(): void {
    for (const event of ALL_EVENTS) {
      EventBus.subscribe(event, (payload) => {
        this.logEvent(event, payload);
      });
    }
  }

  private logEvent<K extends AppEventName>(event: K, payload: AppEventMap[K]): void {
    try {
      LoggerService.info("audit.event", { event, payload });
    } catch (err) {
      LoggerService.error("AuditLogObserver.logEvent failed", { err: String(err) });
    }
  }
}
