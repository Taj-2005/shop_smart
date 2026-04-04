import { Router } from "express";
import { ApiResponseFactory } from "../factories/ApiResponseFactory";
import authRoutes from "../modules/auth/auth.routes";
import userRoutes from "../modules/user/user.routes";
import usersRoutes from "../modules/users/users.routes";
import productsRoutes from "../modules/products/products.routes";
import categoriesRoutes from "../modules/categories/categories.routes";
import cartRoutes from "../modules/cart/cart.routes";
import ordersRoutes from "../modules/orders/orders.routes";
import reviewsRoutes from "../modules/reviews/reviews.routes";
import adminRoutes from "../modules/admin/admin.routes";
import superAdminRoutes from "../modules/super-admin/super-admin.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/users", usersRoutes);
router.use("/products", productsRoutes);
router.use("/categories", categoriesRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", ordersRoutes);
router.use("/reviews", reviewsRoutes);
router.use("/admin", adminRoutes);
router.use("/super-admin", superAdminRoutes);

router.get("/health", (_req, res) => {
  res.json(ApiResponseFactory.successMessage("ShopSmart API"));
});

export default router;
