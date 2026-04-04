/** Mirrors `OrderStatus` in persistence; kept here to avoid coupling this module to Prisma. */
export type OrderStatusValue =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type OrderStatusChangedPayload = {
  orderId: string;
  userId: string;
  previousStatus: OrderStatusValue;
  status: OrderStatusValue;
};

export type ReviewSubmittedPayload = {
  reviewId: string;
  userId: string;
  productId: string;
  rating: number;
};

export type UserRegisteredPayload = {
  userId: string;
  email: string;
};

export type PaymentProcessedPayload = {
  orderId: string;
  paymentReference: string;
  amountCents: number;
  currency: string;
};

export type AppEventName = keyof AppEventMap;

export type AppEventMap = {
  OrderStatusChanged: OrderStatusChangedPayload;
  ReviewSubmitted: ReviewSubmittedPayload;
  UserRegistered: UserRegisteredPayload;
  PaymentProcessed: PaymentProcessedPayload;
};

export type AppEventHandler<K extends AppEventName> = (payload: AppEventMap[K]) => void;
