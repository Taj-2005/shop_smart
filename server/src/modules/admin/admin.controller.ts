import { Request, Response, NextFunction } from "express";
import { OrderStatus } from "@prisma/client";
import { adminService } from "./admin.service";

function clampLimit(q: unknown, fallback: number, max: number): number {
  return Math.min(Number(q) || fallback, max);
}

export async function dashboard(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await adminService.dashboard();
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function revenue(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await adminService.revenue();
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function usersStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await adminService.usersStats();
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function productsStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await adminService.productsStats();
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function ordersStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await adminService.ordersStats();
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function listOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = clampLimit(req.query.limit, 50, 100);
    const status = req.query.status as OrderStatus | undefined;
    const data = await adminService.listOrders(limit, status);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function listReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = clampLimit(req.query.limit, 50, 100);
    const status = req.query.status as string | undefined;
    const data = await adminService.listReviews(limit, status);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function reportSales(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await adminService.reportSales();
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function reportRevenue(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await adminService.reportRevenue();
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function reportTrend(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const days = Math.min(Math.max(Number(req.query.days) || 30, 1), 365);
    const data = await adminService.reportTrend(days);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function reportByCategory(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await adminService.reportByCategory();
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function listCoupons(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const activeOnly = req.query.active === "true";
    const data = await adminService.listCoupons(activeOnly);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function createCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await adminService.createCoupon(req.body);
    res.status(201).json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function updateCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await adminService.updateCoupon(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function deleteCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await adminService.deleteCoupon(req.params.id);
    res.json({ success: true, message: "Coupon deleted" });
  } catch (e) {
    next(e);
  }
}

export async function listLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = clampLimit(req.query.limit, 50, 100);
    const data = await adminService.listLogs(limit);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}
