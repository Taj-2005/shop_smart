import { body, query } from "express-validator";
import { OrderStatus } from "@prisma/client";

const orderStatuses = Object.values(OrderStatus);

export const adminListOrdersQueryValidation = [
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("status").optional().isIn(orderStatuses),
];

export const adminListReviewsQueryValidation = [
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("status").optional().isString(),
];

export const adminReportTrendQueryValidation = [query("days").optional().isInt({ min: 1, max: 365 })];

export const adminListLogsQueryValidation = [query("limit").optional().isInt({ min: 1, max: 100 })];

export const adminListCouponsQueryValidation = [query("active").optional().isIn(["true", "false"])];

export const adminCreateCouponValidation = [
  body("code").trim().notEmpty().withMessage("code required"),
  body("value").isNumeric().withMessage("value required"),
  body("type").optional().isIn(["FIXED", "PERCENT"]),
  body("minOrder").optional().isNumeric(),
  body("maxUses").optional().isInt(),
  body("expiresAt").optional().isISO8601(),
  body("active").optional().isBoolean(),
];

export const adminUpdateCouponValidation = [
  body("code").optional().trim().notEmpty(),
  body("type").optional().isIn(["FIXED", "PERCENT"]),
  body("value").optional().isNumeric(),
  body("minOrder").optional({ nullable: true }).isNumeric(),
  body("maxUses").optional({ nullable: true }).isInt(),
  body("expiresAt").optional({ nullable: true }).isISO8601(),
  body("active").optional().isBoolean(),
];
