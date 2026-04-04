import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { requireAdmin } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";
import * as adminController from "./admin.controller";
import {
  adminCreateCouponValidation,
  adminListCouponsQueryValidation,
  adminListLogsQueryValidation,
  adminListOrdersQueryValidation,
  adminListReviewsQueryValidation,
  adminReportTrendQueryValidation,
  adminUpdateCouponValidation,
} from "./admin.validation";

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get("/dashboard", adminController.dashboard);
router.get("/revenue", adminController.revenue);
router.get("/users/stats", adminController.usersStats);
router.get("/products/stats", adminController.productsStats);
router.get("/orders/stats", adminController.ordersStats);
router.get("/orders", validate(adminListOrdersQueryValidation), adminController.listOrders);
router.get("/reviews", validate(adminListReviewsQueryValidation), adminController.listReviews);
router.get("/reports/sales", adminController.reportSales);
router.get("/reports/revenue", adminController.reportRevenue);
router.get("/reports/trend", validate(adminReportTrendQueryValidation), adminController.reportTrend);
router.get("/reports/by-category", adminController.reportByCategory);
router.get("/coupons", validate(adminListCouponsQueryValidation), adminController.listCoupons);
router.post("/coupons", validate(adminCreateCouponValidation), adminController.createCoupon);
router.patch("/coupons/:id", validate(adminUpdateCouponValidation), adminController.updateCoupon);
router.delete("/coupons/:id", adminController.deleteCoupon);
router.get("/logs", validate(adminListLogsQueryValidation), adminController.listLogs);

export default router;
