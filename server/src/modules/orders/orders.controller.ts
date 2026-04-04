import { Response, NextFunction } from "express";
import { OrderStatus } from "@prisma/client";
import { AuthRequest } from "../../middleware/authenticate";
import { AppError } from "../../middleware/errorHandler";
import { orderService } from "./orders.service";

export async function create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const data = await orderService.create(userId, req.body);
    res.status(201).json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await orderService.listForUser(req.user!.id);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const isAdmin = req.user?.roleType === "ADMIN" || req.user?.roleType === "SUPER_ADMIN";
    const data = await orderService.getById(req.params.id, { userId: req.user!.id, isAdmin });
    if (!data) {
      next(new AppError(404, "Order not found", "NOT_FOUND"));
      return;
    }
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status } = req.body as { status: OrderStatus };
    const data = await orderService.updateStatus(req.params.id, status);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}
