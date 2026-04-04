import { body } from "express-validator";

export const createProductValidation = [
  body("name").trim().notEmpty().withMessage("name required"),
  body("categoryId").notEmpty().withMessage("categoryId required"),
  body("price").isNumeric().withMessage("price required"),
  body("description").optional(),
  body("slug").optional().isString(),
  body("originalPrice").optional().isNumeric(),
  body("image").optional().isString(),
  body("inStock").optional().isBoolean(),
  body("stockQty").optional().isInt(),
  body("active").optional().isBoolean(),
  body("isNew").optional().isBoolean(),
  body("isDeal").optional().isBoolean(),
];

export const updateProductValidation = [
  body("name").optional().trim().notEmpty(),
  body("slug").optional().isString(),
  body("description").optional(),
  body("price").optional().isNumeric(),
  body("originalPrice").optional().isNumeric(),
  body("image").optional().isString(),
  body("categoryId").optional().isString(),
  body("inStock").optional().isBoolean(),
  body("stockQty").optional().isInt(),
  body("active").optional().isBoolean(),
  body("isNew").optional().isBoolean(),
  body("isDeal").optional().isBoolean(),
];
