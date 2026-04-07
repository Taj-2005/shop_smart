import { Request, Response } from "express";
import { OrderStatus } from "@prisma/client";
import { container } from "../../container";
import { BaseController } from "../../base/BaseController";

function clampLimit(q: unknown, fallback: number, max: number): number {
  return Math.min(Number(q) || fallback, max);
}

class AdminDashboardController extends BaseController {
  protected async execute() { return await container.adminService.dashboard(); }
}
export const dashboard = new AdminDashboardController().handleRequest.bind(new AdminDashboardController());

class AdminRevenueController extends BaseController {
  protected async execute() { return await container.adminService.revenue(); }
}
export const revenue = new AdminRevenueController().handleRequest.bind(new AdminRevenueController());

class AdminUsersStatsController extends BaseController {
  protected async execute() { return await container.adminService.usersStats(); }
}
export const usersStats = new AdminUsersStatsController().handleRequest.bind(new AdminUsersStatsController());

class AdminProductsStatsController extends BaseController {
  protected async execute() { return await container.adminService.productsStats(); }
}
export const productsStats = new AdminProductsStatsController().handleRequest.bind(new AdminProductsStatsController());

class AdminOrdersStatsController extends BaseController {
  protected async execute() { return await container.adminService.ordersStats(); }
}
export const ordersStats = new AdminOrdersStatsController().handleRequest.bind(new AdminOrdersStatsController());

class AdminListOrdersController extends BaseController {
  protected async execute(req: Request) {
    const limit = clampLimit(req.query.limit, 50, 100);
    const status = req.query.status as OrderStatus | undefined;
    return await container.adminService.listOrders(limit, status);
  }
}
export const listOrders = new AdminListOrdersController().handleRequest.bind(new AdminListOrdersController());

class AdminListReviewsController extends BaseController {
  protected async execute(req: Request) {
    const limit = clampLimit(req.query.limit, 50, 100);
    const status = req.query.status as string | undefined;
    return await container.adminService.listReviews(limit, status);
  }
}
export const listReviews = new AdminListReviewsController().handleRequest.bind(new AdminListReviewsController());

class AdminReportSalesController extends BaseController {
  protected async execute() { return await container.adminService.reportSales(); }
}
export const reportSales = new AdminReportSalesController().handleRequest.bind(new AdminReportSalesController());

class AdminReportRevenueController extends BaseController {
  protected async execute() { return await container.adminService.reportRevenue(); }
}
export const reportRevenue = new AdminReportRevenueController().handleRequest.bind(new AdminReportRevenueController());

class AdminReportTrendController extends BaseController {
  protected async execute(req: Request) {
    const days = Math.min(Math.max(Number(req.query.days) || 30, 1), 365);
    return await container.adminService.reportTrend(days);
  }
}
export const reportTrend = new AdminReportTrendController().handleRequest.bind(new AdminReportTrendController());

class AdminReportByCategoryController extends BaseController {
  protected async execute() { return await container.adminService.reportByCategory(); }
}
export const reportByCategory = new AdminReportByCategoryController().handleRequest.bind(new AdminReportByCategoryController());

class AdminListCouponsController extends BaseController {
  protected async execute(req: Request) {
    const activeOnly = req.query.active === "true";
    return await container.adminService.listCoupons(activeOnly);
  }
}
export const listCoupons = new AdminListCouponsController().handleRequest.bind(new AdminListCouponsController());

class AdminCreateCouponController extends BaseController {
  protected async execute(req: Request, res: Response) {
    const data = await container.adminService.createCoupon(req.body);
    res.status(201);
    return data;
  }
}
export const createCoupon = new AdminCreateCouponController().handleRequest.bind(new AdminCreateCouponController());

class AdminUpdateCouponController extends BaseController {
  protected async execute(req: Request) {
    return await container.adminService.updateCoupon(req.params.id, req.body);
  }
}
export const updateCoupon = new AdminUpdateCouponController().handleRequest.bind(new AdminUpdateCouponController());

class AdminDeleteCouponController extends BaseController {
  protected async execute(req: Request) {
    await container.adminService.deleteCoupon(req.params.id);
    return { success: true, message: "Coupon deleted" };
  }
}
export const deleteCoupon = new AdminDeleteCouponController().handleRequest.bind(new AdminDeleteCouponController());

class AdminListLogsController extends BaseController {
  protected async execute(req: Request) {
    const limit = clampLimit(req.query.limit, 50, 100);
    return await container.adminService.listLogs(limit);
  }
}
export const listLogs = new AdminListLogsController().handleRequest.bind(new AdminListLogsController());
