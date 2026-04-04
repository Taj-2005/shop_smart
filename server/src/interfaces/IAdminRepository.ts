import type { OrderStatus } from "@prisma/client";

/** Admin dashboard / reports / coupons — persistence abstraction (DIP). */
export interface IAdminRepository {
  dashboard(): Promise<{ users: number; products: number; orders: number; revenue: number }>;
  revenue(): Promise<{ total: number }>;
  usersStats(): Promise<{
    total: number;
    byRole: { roleId: string; roleName: string | undefined; count: number }[];
  }>;
  productsStats(): Promise<{ total: number; active: number }>;
  ordersStats(): Promise<{ status: OrderStatus; _count: number }[]>;
  listOrders(limit: number, status?: OrderStatus): Promise<unknown[]>;
  listReviews(limit: number, status?: string): Promise<unknown[]>;
  reportSales(): Promise<{ status: OrderStatus; count: number; total: number }[]>;
  reportRevenue(): Promise<{ revenue: number; refunded: number }>;
  reportTrend(days: number): Promise<{ date: string; orders: number; revenue: number }[]>;
  reportByCategory(): Promise<{ name: string; count: number; revenue: number }[]>;
  listCoupons(activeOnly: boolean): Promise<unknown[]>;
  createCoupon(body: {
    code: string;
    type?: string;
    value: number;
    minOrder?: number | null;
    maxUses?: number | null;
    expiresAt?: string | null;
    active?: boolean;
  }): Promise<unknown>;
  updateCoupon(
    id: string,
    body: Partial<{
      code: string;
      type: string;
      value: number;
      minOrder: number | null;
      maxUses: number | null;
      expiresAt: string | null;
      active: boolean;
    }>
  ): Promise<unknown>;
  deleteCoupon(id: string): Promise<void>;
  listLogs(limit: number): Promise<unknown[]>;
}
