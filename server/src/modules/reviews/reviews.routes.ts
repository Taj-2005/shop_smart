import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { ADMIN_ROLES } from "../../constants/roles";
import { container } from "../../container";

const router = Router();
const reviews = container.reviewsController;

router.post("/", authenticate, (req, res, next) => reviews.create(req, res, next));
router.delete("/:id", authenticate, authorize(...ADMIN_ROLES), (req, res, next) => reviews.delete(req, res, next));
router.patch("/:id/status", authenticate, authorize(...ADMIN_ROLES), (req, res, next) => reviews.patchStatus(req, res, next));

export default router;
