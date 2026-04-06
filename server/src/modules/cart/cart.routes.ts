import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { container } from "../../container";

const router = Router();
const cart = container.cartController;

router.use(authenticate);

router.get("/", (req, res, next) => cart.get(req, res, next));
router.post("/", (req, res, next) => cart.post(req, res, next));
router.patch("/item/:id", (req, res, next) => cart.patchItem(req, res, next));
router.delete("/item/:id", (req, res, next) => cart.deleteItem(req, res, next));

export default router;
