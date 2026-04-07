import type { IEmailService } from "../../interfaces/IEmailService";
import { LoggerService } from "../../services/LoggerService";
import { EventBus } from "../EventBus";
import type { OrderStatusChangedPayload, PaymentProcessedPayload, ReviewSubmittedPayload, UserRegisteredPayload } from "../events.types";

export type NotificationObserverDeps = {
  email: IEmailService;
  getEmailForUser?: (userId: string) => Promise<string | undefined>;
  getEmailForOrder?: (orderId: string) => Promise<string | undefined>;
};

/**
 * High: reacts to events by sending email when an {@link IEmailService} and resolvers are wired.
 */
export class NotificationObserver {
  constructor(private readonly deps?: NotificationObserverDeps) {}

  register(): void {
    EventBus.subscribe("UserRegistered", (p) => void this.onUserRegistered(p));
    EventBus.subscribe("OrderStatusChanged", (p) => void this.onOrderStatusChanged(p));
    EventBus.subscribe("PaymentProcessed", (p) => void this.onPaymentProcessed(p));
    EventBus.subscribe("ReviewSubmitted", (p) => void this.onReviewSubmitted(p));
  }

  private async onUserRegistered(payload: UserRegisteredPayload): Promise<void> {
    try {
      const email = this.deps?.email;
      if (!email) {
        LoggerService.debug("notification.skipped", { event: "UserRegistered", reason: "no_email_service" });
        return;
      }
      await email.sendMail(
        payload.email,
        "Welcome",
        "<p>Your account was created successfully.</p>",
      );
    } catch (err) {
      LoggerService.error("NotificationObserver.UserRegistered failed", { err: String(err) });
    }
  }

  private async onOrderStatusChanged(payload: OrderStatusChangedPayload): Promise<void> {
    try {
      const email = this.deps?.email;
      const getEmail = this.deps?.getEmailForUser;
      if (!email || !getEmail) {
        LoggerService.debug("notification.skipped", { event: "OrderStatusChanged", reason: "incomplete_deps" });
        return;
      }
      if (payload.status !== "SHIPPED" && payload.status !== "DELIVERED") return;

      const to = await getEmail(payload.userId);
      if (!to) {
        LoggerService.debug("notification.skipped", { event: "OrderStatusChanged", reason: "no_recipient" });
        return;
      }

      await email.sendMail(
        to,
        `Order ${payload.orderId} — ${payload.status}`,
        `<p>Your order status is now ${payload.status}.</p>`,
      );
    } catch (err) {
      LoggerService.error("NotificationObserver.OrderStatusChanged failed", { err: String(err) });
    }
  }

  private async onPaymentProcessed(payload: PaymentProcessedPayload): Promise<void> {
    try {
      const email = this.deps?.email;
      const getEmail = this.deps?.getEmailForOrder;
      if (!email || !getEmail) {
        LoggerService.debug("notification.skipped", { event: "PaymentProcessed", reason: "incomplete_deps" });
        return;
      }

      const to = await getEmail(payload.orderId);
      if (!to) {
        LoggerService.debug("notification.skipped", { event: "PaymentProcessed", reason: "no_recipient" });
        return;
      }

      const amount = (payload.amountCents / 100).toFixed(2);
      await email.sendMail(
        to,
        "Payment received",
        `<p>We received your payment of ${amount} ${payload.currency} (ref ${payload.paymentReference}).</p>`,
      );
    } catch (err) {
      LoggerService.error("NotificationObserver.PaymentProcessed failed", { err: String(err) });
    }
  }

  private async onReviewSubmitted(payload: ReviewSubmittedPayload): Promise<void> {
    try {
      LoggerService.info("notification.review_submitted", {
        event: "ReviewSubmitted",
        reviewId: payload.reviewId,
        productId: payload.productId,
      });
    } catch (err) {
      LoggerService.error("NotificationObserver.ReviewSubmitted failed", { err: String(err) });
    }
  }
}
