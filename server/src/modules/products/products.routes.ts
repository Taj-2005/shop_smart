import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";
import { ADMIN_ROLES } from "../../constants/roles";
import { createProductValidation, updateProductValidation } from "./products.validation";
import * as productsController from "./products.controller";

const router = Router();

router.get("/", productsController.list);
router.get("/:id/reviews", productsController.listReviews);
router.get("/:id", productsController.getById);
router.get("/:id/analytics", authenticate, authorize(...ADMIN_ROLES), productsController.analytics);
router.post("/", authenticate, authorize(...ADMIN_ROLES), validate(createProductValidation), productsController.create);
router.patch("/:id", authenticate, authorize(...ADMIN_ROLES), validate(updateProductValidation), productsController.update);
router.delete("/:id", authenticate, authorize(...ADMIN_ROLES), productsController.remove);

export default router;
