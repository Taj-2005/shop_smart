import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";
import { ADMIN_ROLES } from "../../constants/roles";
import type { AuthRequest } from "../../middleware/authenticate";
import { createOrderValidation, updateOrderStatusValidation } from "./orders.validation";
import * as ordersController from "./orders.controller";

const router = Router();

router.post("/", authenticate, validate(createOrderValidation), (req, res, next) =>
  ordersController.create(req as AuthRequest, res, next)
);
router.get("/", authenticate, (req, res, next) => ordersController.list(req as AuthRequest, res, next));
router.get("/:id", authenticate, (req, res, next) => ordersController.getById(req as AuthRequest, res, next));
router.patch(
  "/:id/status",
  authenticate,
  authorize(...ADMIN_ROLES),
  validate(updateOrderStatusValidation),
  (req, res, next) => ordersController.updateStatus(req as AuthRequest, res, next)
);

export default router;
