import { body, query } from "express-validator";

export const superAdminCreateAdminValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty().withMessage("password required"),
  body("fullName").optional().isString(),
];

export const superAdminUpdateRoleValidation = [body("role").isIn(["ADMIN", "CUSTOMER"]).withMessage("Invalid role")];

export const superAdminPatchConfigValidation = [body("key").trim().notEmpty().withMessage("key required")];

export const superAdminAnalyticsQueryValidation = [query("days").optional().isInt({ min: 1, max: 365 })];

export const superAdminTopProductsQueryValidation = [query("limit").optional().isInt({ min: 1, max: 50 })];
