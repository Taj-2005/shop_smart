import { Request, Response } from "express";
import { container } from "../../container";
import { BaseController } from "../../base/BaseController";

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

class CreateAdminController extends BaseController {
  protected async execute(req: Request, res: Response) {
    const data = await container.superAdminService.createAdmin(req.body);
    res.status(201);
    return data;
  }
}
export const createAdmin = new CreateAdminController().handleRequest.bind(new CreateAdminController());

class DeleteAdminController extends BaseController {
  protected async execute(req: Request) {
    await container.superAdminService.deleteAdmin(req.params.id);
    return { success: true, message: "Admin deleted" };
  }
}
export const deleteAdmin = new DeleteAdminController().handleRequest.bind(new DeleteAdminController());

class UpdateUserRoleController extends BaseController {
  protected async execute(req: Request) {
    return await container.superAdminService.updateUserRole(req.params.id, req.body.role);
  }
}
export const updateUserRole = new UpdateUserRoleController().handleRequest.bind(new UpdateUserRoleController());

class GetConfigController extends BaseController {
  protected async execute(req: Request) {
    const key = req.query.key as string | undefined;
    if (key) {
      return await container.superAdminService.getConfigValue(key);
    }
    return await container.superAdminService.getAllConfig();
  }
}
export const getConfig = new GetConfigController().handleRequest.bind(new GetConfigController());

class PatchConfigController extends BaseController {
  protected async execute(req: Request) {
    const { key, value } = req.body as { key: string; value: unknown };
    await container.superAdminService.patchConfig(key, value);
    return { success: true, message: "Config updated" };
  }
}
export const patchConfig = new PatchConfigController().handleRequest.bind(new PatchConfigController());

class GetPaymentConfigController extends BaseController {
  protected async execute() {
    return await container.superAdminService.getPaymentConfig();
  }
}
export const getPaymentConfig = new GetPaymentConfigController().handleRequest.bind(new GetPaymentConfigController());

class PatchPaymentConfigController extends BaseController {
  protected async execute(req: Request) {
    await container.superAdminService.patchPaymentConfig(req.body as Record<string, unknown>);
    return { success: true, message: "Payment config updated" };
  }
}
export const patchPaymentConfig = new PatchPaymentConfigController().handleRequest.bind(new PatchPaymentConfigController());

class GetShippingProvidersController extends BaseController {
  protected async execute() {
    return await container.superAdminService.getShippingProviders();
  }
}
export const getShippingProviders = new GetShippingProvidersController().handleRequest.bind(new GetShippingProvidersController());

class PatchShippingProvidersController extends BaseController {
  protected async execute(req: Request) {
    const value = Array.isArray(req.body) ? req.body : [];
    await container.superAdminService.patchShippingProviders(value);
    return { success: true, message: "Shipping providers updated" };
  }
}
export const patchShippingProviders = new PatchShippingProvidersController().handleRequest.bind(new PatchShippingProvidersController());

class GetFeatureFlagsController extends BaseController {
  protected async execute() {
    return await container.superAdminService.getFeatureFlags();
  }
}
export const getFeatureFlags = new GetFeatureFlagsController().handleRequest.bind(new GetFeatureFlagsController());

class PatchFeatureFlagsController extends BaseController {
  protected async execute(req: Request) {
    await container.superAdminService.patchFeatureFlags(req.body as Record<string, boolean>);
    return { success: true, message: "Feature flags updated" };
  }
}
export const patchFeatureFlags = new PatchFeatureFlagsController().handleRequest.bind(new PatchFeatureFlagsController());

class TopProductsController extends BaseController {
  protected async execute(req: Request) {
    const limit = clamp(Number(req.query.limit) || 10, 1, 50);
    return await container.superAdminService.topProducts(limit);
  }
}
export const topProducts = new TopProductsController().handleRequest.bind(new TopProductsController());

class SuperAdminAnalyticsController extends BaseController {
  protected async execute(req: Request) {
    const days = clamp(Number(req.query.days) || 30, 1, 365);
    return await container.superAdminService.analytics(days);
  }
}
export const analytics = new SuperAdminAnalyticsController().handleRequest.bind(new SuperAdminAnalyticsController());
