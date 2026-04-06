import type { OrderStatus } from "@prisma/client";
import type { IAdminRepository } from "../../interfaces/IAdminRepository";

export class AdminService {
  constructor(private readonly admin: IAdminRepository) {}

  dashboard() {
    return this.admin.dashboard();
  }

  revenue() {
    return this.admin.revenue();
  }

  usersStats() {
    return this.admin.usersStats();
  }

  productsStats() {
    return this.admin.productsStats();
  }

  ordersStats() {
    return this.admin.ordersStats();
  }

  listOrders(limit: number, status?: OrderStatus) {
    return this.admin.listOrders(limit, status);
  }

  listReviews(limit: number, status?: string) {
    return this.admin.listReviews(limit, status);
  }

  reportSales() {
    return this.admin.reportSales();
  }

  reportRevenue() {
    return this.admin.reportRevenue();
  }

  reportTrend(days: number) {
    return this.admin.reportTrend(days);
  }

  reportByCategory() {
    return this.admin.reportByCategory();
  }

  listCoupons(activeOnly: boolean) {
    return this.admin.listCoupons(activeOnly);
  }

  createCoupon(body: Parameters<IAdminRepository["createCoupon"]>[0]) {
    return this.admin.createCoupon(body);
  }

  updateCoupon(id: string, body: Parameters<IAdminRepository["updateCoupon"]>[1]) {
    return this.admin.updateCoupon(id, body);
  }

  deleteCoupon(id: string) {
    return this.admin.deleteCoupon(id);
  }

  listLogs(limit: number) {
    return this.admin.listLogs(limit);
  }
}
