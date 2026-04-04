import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/authenticate";
import { productService } from "./products.service";

export async function list(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await productService.listActive();
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function listReviews(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await productService.listReviews(req.params.id);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await productService.getById(req.params.id);
    if (!data) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function analytics(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await productService.getAnalytics(req.params.id);
    if (!data) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await productService.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (e) {
    next(e);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await productService.update(req.params.id, req.body);
    res.json({ success: true, data: product });
  } catch (e) {
    next(e);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await productService.softDelete(req.params.id);
    res.json({ success: true, message: "Product deleted" });
  } catch (e) {
    next(e);
  }
}
