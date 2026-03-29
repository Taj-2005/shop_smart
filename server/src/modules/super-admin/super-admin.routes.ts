import { Router } from "express";
import { Prisma } from "@prisma/client";
import { authenticate } from "../../middleware/authenticate";
import { requireSuperAdmin } from "../../middleware/authorize";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";
import type { AuthRequest } from "../../middleware/authenticate";
import { hashPassword } from "../../utils/hash";
import { RoleType } from "@prisma/client";

const router = Router();

router.use(authenticate);
router.use(requireSuperAdmin);

router.post("/admins", async (req: AuthRequest, res, next) => {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password) return next(new AppError(400, "email and password required", "VALIDATION_ERROR"));
    const adminRole = await prisma.role.findUnique({ where: { name: "ADMIN" } });
    if (!adminRole) return next(new AppError(500, "ADMIN role not found", "INTERNAL_ERROR"));
    const existing = await prisma.user.findFirst({ where: { email, deletedAt: null } });
    if (existing) return next(new AppError(409, "User already exists", "CONFLICT"));
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: String(email).toLowerCase().trim(),
        passwordHash,
        fullName: fullName || email,
        roleId: adminRole.id,
        emailVerified: true,
      },
      select: { id: true, email: true, fullName: true, role: true },
    });
    res.status(201).json({ success: true, data: user });
  } catch (e) {
    next(e);
  }
});

router.delete("/admins/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const target = await prisma.user.findFirst({ where: { id, deletedAt: null }, include: { role: true } });
    if (!target) return next(new AppError(404, "User not found", "NOT_FOUND"));
    if (target.role.name === "SUPER_ADMIN") return next(new AppError(403, "Cannot delete Super Admin", "FORBIDDEN"));
    await prisma.user.update({ where: { id }, data: { deletedAt: new Date(), active: false } });
    res.json({ success: true, message: "Admin deleted" });
  } catch (e) {
    next(e);
  }
});

router.patch("/users/:id/role", async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body as { role?: string };
    const allowed = ["ADMIN", "CUSTOMER"];
    if (!role || !allowed.includes(role)) return next(new AppError(400, "role must be one of: " + allowed.join(", "), "VALIDATION_ERROR"));
    const roleRecord = await prisma.role.findUnique({ where: { name: role as RoleType } });
    if (!roleRecord) return next(new AppError(400, "Role not found", "NOT_FOUND"));
    const user = await prisma.user.update({
      where: { id, deletedAt: null },
      data: { roleId: roleRecord.id },
      select: { id: true, email: true, fullName: true, role: true },
    });
    res.json({ success: true, data: user });
  } catch (e) {
    next(e);
  }
});

router.get("/config", async (req, res, next) => {
  try {
    const key = req.query.key as string | undefined;
    if (key) {
      const row = await prisma.systemConfig.findUnique({ where: { key } });
      if (!row) return res.json({ success: true, data: null });
      return res.json({ success: true, data: row.value });
    }
    const rows = await prisma.systemConfig.findMany();
    const data = rows.reduce((acc, r) => ({ ...acc, [r.key]: r.value }), {} as Record<string, unknown>);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.patch("/config", async (req, res, next) => {
  try {
    const { key, value } = req.body as { key: string; value: unknown };
    if (!key) return next(new AppError(400, "key required", "VALIDATION_ERROR"));
    const json = (value ?? {}) as Prisma.InputJsonValue;
    await prisma.systemConfig.upsert({
      where: { key },
      create: { key, value: json },
      update: { value: json },
    });
    res.json({ success: true, message: "Config updated" });
  } catch (e) {
    next(e);
  }
});

router.get("/config/payment", async (_req, res, next) => {
  try {
    const row = await prisma.systemConfig.findUnique({ where: { key: "payment_gateway" } });
    res.json({ success: true, data: row?.value ?? { provider: null, enabled: false } });
  } catch (e) {
    next(e);
  }
});

router.patch("/config/payment", async (req, res, next) => {
  try {
    const value = req.body as Record<string, unknown>;
    const json = value as Prisma.InputJsonValue;
    await prisma.systemConfig.upsert({
      where: { key: "payment_gateway" },
      create: { key: "payment_gateway", value: json },
      update: { value: json },
    });
    res.json({ success: true, message: "Payment config updated" });
  } catch (e) {
    next(e);
  }
});

router.get("/config/shipping-providers", async (_req, res, next) => {
  try {
    const row = await prisma.systemConfig.findUnique({ where: { key: "shipping_providers" } });
    const data = (row?.value as unknown[]) ?? [];
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.patch("/config/shipping-providers", async (req, res, next) => {
  try {
    const value = Array.isArray(req.body) ? req.body : [];
    const json = value as Prisma.InputJsonValue;
    await prisma.systemConfig.upsert({
      where: { key: "shipping_providers" },
      create: { key: "shipping_providers", value: json },
      update: { value: json },
    });
    res.json({ success: true, message: "Shipping providers updated" });
  } catch (e) {
    next(e);
  }
});

router.get("/config/feature-flags", async (_req, res, next) => {
  try {
    const row = await prisma.systemConfig.findUnique({ where: { key: "feature_flags" } });
    const data = (row?.value as Record<string, boolean>) ?? { newCheckout: true, reviewsModeration: true };
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.patch("/config/feature-flags", async (req, res, next) => {
  try {
    const value = req.body as Record<string, boolean>;
    const json = value as Prisma.InputJsonValue;
    await prisma.systemConfig.upsert({
      where: { key: "feature_flags" },
      create: { key: "feature_flags", value: json },
      update: { value: json },
    });
    res.json({ success: true, message: "Feature flags updated" });
  } catch (e) {
    next(e);
  }
});

/** Top products by units sold (delivered orders), for super admin analytics. */
router.get("/analytics/top-products", async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    type Row = { productId: string; productName: string; unitsSold: string; revenue: string };
    const rows = await prisma.$queryRaw<Row[]>`
      SELECT
        p.id AS "productId",
        p.name AS "productName",
        SUM(oi.quantity)::text AS "unitsSold",
        (SUM(oi.price * oi.quantity))::text AS revenue
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      JOIN orders o ON o.id = oi.order_id
      WHERE o.status = 'DELIVERED'
      GROUP BY p.id, p.name
      ORDER BY SUM(oi.quantity) DESC
      LIMIT ${limit}
    `;
    const data = rows.map((r) => ({
      productId: r.productId,
      productName: r.productName,
      unitsSold: Number(r.unitsSold),
      revenue: Number(r.revenue),
    }));
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.get("/analytics", async (req, res, next) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days) || 30, 1), 365);
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setHours(23, 59, 59, 999);
    const periodStart = new Date(now);
    periodStart.setDate(periodStart.getDate() - days);
    periodStart.setHours(0, 0, 0, 0);
    const previousStart = new Date(periodStart);
    previousStart.setDate(previousStart.getDate() - days);

    const [
      userCount,
      productCount,
      orderCount,
      totalRevenue,
      refundedAgg,
      cancelledCount,
      byStatus,
      revenueThisPeriod,
      ordersThisPeriod,
      revenuePrevPeriod,
      ordersPrevPeriod,
      recentOrders,
      usersThisPeriod,
      usersPrevPeriod,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: "DELIVERED" } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: "REFUNDED" } }),
      prisma.order.count({ where: { status: "CANCELLED" } }),
      prisma.order.groupBy({ by: ["status"], _count: true, _sum: { total: true } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: "DELIVERED", createdAt: { gte: periodStart, lte: periodEnd } },
      }),
      prisma.order.count({ where: { createdAt: { gte: periodStart, lte: periodEnd } } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: "DELIVERED", createdAt: { gte: previousStart, lt: periodStart } },
      }),
      prisma.order.count({ where: { createdAt: { gte: previousStart, lt: periodStart } } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { email: true, fullName: true } },
          items: { include: { product: { select: { name: true } } }, take: 5 },
        },
      }),
      prisma.user.count({ where: { deletedAt: null, createdAt: { gte: periodStart, lte: periodEnd } } }),
      prisma.user.count({ where: { deletedAt: null, createdAt: { gte: previousStart, lt: periodStart } } }),
    ]);

    const revenue = totalRevenue._sum.total ? Number(totalRevenue._sum.total) : 0;
    const refunded = refundedAgg._sum.total ? Number(refundedAgg._sum.total) : 0;
    const revenueCurrent = revenueThisPeriod._sum.total ? Number(revenueThisPeriod._sum.total) : 0;
    const revenuePrevious = revenuePrevPeriod._sum.total ? Number(revenuePrevPeriod._sum.total) : 0;
    const ordersCurrent = ordersThisPeriod;
    const ordersPrevious = ordersPrevPeriod;

    const byStatusWithTotal = byStatus.map((s) => ({
      status: s.status,
      _count: s._count,
      total: s._sum.total ? Number(s._sum.total) : 0,
    }));

    res.json({
      success: true,
      data: {
        users: userCount,
        products: productCount,
        orders: orderCount,
        revenue,
        refunded,
        cancelledCount,
        byStatus: byStatusWithTotal,
        recentOrders: recentOrders.map((o) => ({
          id: o.id,
          status: o.status,
          total: Number(o.total),
          createdAt: o.createdAt,
          user: o.user,
          items: o.items.map((i) => ({
            productName: i.product.name,
            quantity: i.quantity,
            price: Number(i.price),
          })),
        })),
        period: { days },
        comparison: {
          revenueCurrent,
          revenuePrevious,
          ordersCurrent,
          ordersPrevious,
          usersCurrent: usersThisPeriod,
          usersPrevious: usersPrevPeriod,
        },
      },
    });
  } catch (e) {
    next(e);
  }
});

export default router;
