import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { allowSelfOrAdmin } from "../../middleware/allowSelfOrAdmin";
import type { AuthRequest } from "../../middleware/authenticate";
import { ADMIN_ROLES } from "../../constants/roles";
import * as usersController from "./users.controller";

const router = Router();

router.get("/", authenticate, authorize(...ADMIN_ROLES), usersController.list);
router.get("/:id", authenticate, allowSelfOrAdmin("id"), (req, res, next) =>
  usersController.getById(req as AuthRequest, res, next)
);
router.patch("/:id", authenticate, allowSelfOrAdmin("id"), (req, res, next) =>
  usersController.update(req as AuthRequest, res, next)
);
router.delete("/:id", authenticate, allowSelfOrAdmin("id"), (req, res, next) =>
  usersController.remove(req as AuthRequest, res, next)
);
router.get("/:id/orders", authenticate, allowSelfOrAdmin("id"), (req, res, next) =>
  usersController.listOrders(req as AuthRequest, res, next)
);
router.get("/:id/cart", authenticate, allowSelfOrAdmin("id"), (req, res, next) =>
  usersController.getCart(req as AuthRequest, res, next)
);

export default router;
