import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import * as authController from "../auth/auth.controller";
import * as userController from "./user.controller";

const router = Router();

router.use(authenticate);

router.get("/me", authController.me);
router.patch("/me", userController.patchMe);

export default router;
