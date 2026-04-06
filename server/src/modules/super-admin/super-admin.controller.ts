import { Request, Response, NextFunction } from "express";
import { container } from "../../container";

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

export async function createAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await container.superAdminService.createAdmin(req.body);
    res.status(201).json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function deleteAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await container.superAdminService.deleteAdmin(req.params.id);
    res.json({ success: true, message: "Admin deleted" });
  } catch (e) {
    next(e);
  }
}

export async function updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await container.superAdminService.updateUserRole(req.params.id, req.body.role);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function getConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const key = req.query.key as string | undefined;
    if (key) {
      const value = await container.superAdminService.getConfigValue(key);
      res.json({ success: true, data: value });
      return;
    }
    const data = await container.superAdminService.getAllConfig();
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function patchConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { key, value } = req.body as { key: string; value: unknown };
    await container.superAdminService.patchConfig(key, value);
    res.json({ success: true, message: "Config updated" });
  } catch (e) {
    next(e);
  }
}

export async function getPaymentConfig(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await container.superAdminService.getPaymentConfig();
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function patchPaymentConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await container.superAdminService.patchPaymentConfig(req.body as Record<string, unknown>);
    res.json({ success: true, message: "Payment config updated" });
  } catch (e) {
    next(e);
  }
}

export async function getShippingProviders(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await container.superAdminService.getShippingProviders();
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function patchShippingProviders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const value = Array.isArray(req.body) ? req.body : [];
    await container.superAdminService.patchShippingProviders(value);
    res.json({ success: true, message: "Shipping providers updated" });
  } catch (e) {
    next(e);
  }
}

export async function getFeatureFlags(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await container.superAdminService.getFeatureFlags();
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function patchFeatureFlags(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await container.superAdminService.patchFeatureFlags(req.body as Record<string, boolean>);
    res.json({ success: true, message: "Feature flags updated" });
  } catch (e) {
    next(e);
  }
}

export async function topProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = clamp(Number(req.query.limit) || 10, 1, 50);
    const data = await container.superAdminService.topProducts(limit);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function analytics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const days = clamp(Number(req.query.days) || 30, 1, 365);
    const data = await container.superAdminService.analytics(days);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}
