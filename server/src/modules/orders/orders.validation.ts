import { body } from "express-validator";
import { OrderStatus } from "@prisma/client";

const statuses = Object.values(OrderStatus);

export const createOrderValidation = [
  body("items")
    .isArray({ min: 1 })
    .withMessage("items required (non-empty array)"),
  body("items.*.productId").notEmpty().withMessage("each item needs productId"),
  body("items.*.quantity").isInt({ min: 1 }).withMessage("each item needs quantity >= 1"),
  body("addressId").optional().isString(),
];

export const updateOrderStatusValidation = [
  body("status")
    .isIn(statuses)
    .withMessage("Invalid status"),
];
