import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { ADMIN_ROLES } from "../../constants/roles";
import { container } from "../../container";

const router = Router();
const categories = container.categoriesController;

router.get("/", (req, res, next) => categories.list(req, res, next));
router.post("/", authenticate, authorize(...ADMIN_ROLES), (req, res, next) => categories.create(req, res, next));

export default router;
