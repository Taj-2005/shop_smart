import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { requireSuperAdmin } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";
import * as superAdminController from "./super-admin.controller";
import {
  superAdminAnalyticsQueryValidation,
  superAdminCreateAdminValidation,
  superAdminPatchConfigValidation,
  superAdminTopProductsQueryValidation,
  superAdminUpdateRoleValidation,
} from "./super-admin.validation";

const router = Router();

router.use(authenticate);
router.use(requireSuperAdmin);

router.post("/admins", validate(superAdminCreateAdminValidation), superAdminController.createAdmin);
router.delete("/admins/:id", superAdminController.deleteAdmin);
router.patch("/users/:id/role", validate(superAdminUpdateRoleValidation), superAdminController.updateUserRole);
router.get("/config", superAdminController.getConfig);
router.patch("/config", validate(superAdminPatchConfigValidation), superAdminController.patchConfig);
router.get("/config/payment", superAdminController.getPaymentConfig);
router.patch("/config/payment", superAdminController.patchPaymentConfig);
router.get("/config/shipping-providers", superAdminController.getShippingProviders);
router.patch("/config/shipping-providers", superAdminController.patchShippingProviders);
router.get("/config/feature-flags", superAdminController.getFeatureFlags);
router.patch("/config/feature-flags", superAdminController.patchFeatureFlags);
router.get("/analytics/top-products", validate(superAdminTopProductsQueryValidation), superAdminController.topProducts);
router.get("/analytics", validate(superAdminAnalyticsQueryValidation), superAdminController.analytics);

export default router;
