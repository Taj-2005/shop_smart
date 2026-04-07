import { LoggerService } from "../../services/LoggerService";
import { EventBus } from "../EventBus";
import type { OrderStatusChangedPayload, PaymentProcessedPayload } from "../events.types";

export type InventorySyncPort = {
  applyOrderStatusChange(payload: OrderStatusChangedPayload): Promise<void>;
  applyPaymentProcessed(payload: PaymentProcessedPayload): Promise<void>;
};

/**
 * High: keeps catalog stock aligned with orders/payments once an {@link InventorySyncPort} is wired.
 */
export class InventoryObserver {
  constructor(private readonly inventory?: InventorySyncPort) {}

  register(): void {
    EventBus.subscribe("OrderStatusChanged", (p) => void this.onOrderStatusChanged(p));
    EventBus.subscribe("PaymentProcessed", (p) => void this.onPaymentProcessed(p));
  }

  private async onOrderStatusChanged(payload: OrderStatusChangedPayload): Promise<void> {
    try {
      if (!this.inventory) {
        LoggerService.debug("inventory.skipped", { event: "OrderStatusChanged", reason: "no_inventory_port" });
        return;
      }
      await this.inventory.applyOrderStatusChange(payload);
    } catch (err) {
      LoggerService.error("InventoryObserver.OrderStatusChanged failed", { err: String(err) });
    }
  }

  private async onPaymentProcessed(payload: PaymentProcessedPayload): Promise<void> {
    try {
      if (!this.inventory) {
        LoggerService.debug("inventory.skipped", { event: "PaymentProcessed", reason: "no_inventory_port" });
        return;
      }
      await this.inventory.applyPaymentProcessed(payload);
    } catch (err) {
      LoggerService.error("InventoryObserver.PaymentProcessed failed", { err: String(err) });
    }
  }
}
