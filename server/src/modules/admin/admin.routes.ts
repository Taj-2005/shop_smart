import { Router } from "express";
import { OrderStatus } from "@prisma/client";
import { authenticate } from "../../middleware/authenticate";
import { requireAdmin } from "../../middleware/authorize";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get("/dashboard", async (_req, res, next) => {
  try {
    const [userCount, productCount, orderCount, totalRevenue] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: "DELIVERED" } }),
    ]);
    res.json({
      success: true,
      data: {
        users: userCount,
        products: productCount,
        orders: orderCount,
        revenue: totalRevenue._sum.total ? Number(totalRevenue._sum.total) : 0,
      },
    });
  } catch (e) {
    next(e);
  }
});

router.get("/revenue", async (_req, res, next) => {
  try {
    const result = await prisma.order.aggregate({
      _sum: { total: true },
      where: { status: "DELIVERED" },
    });
    res.json({ success: true, data: { total: result._sum.total ? Number(result._sum.total) : 0 } });
  } catch (e) {
    next(e);
  }
});

router.get("/users/stats", async (_req, res, next) => {
  try {
    const total = await prisma.user.count({ where: { deletedAt: null } });
    const byRole = await prisma.user.groupBy({
      by: ["roleId"],
      _count: true,
      where: { deletedAt: null },
    });
    const roles = await prisma.role.findMany();
    const data = {
      total,
      byRole: byRole.map((r) => ({
        roleId: r.roleId,
        roleName: roles.find((x) => x.id === r.roleId)?.name,
        count: r._count,
      })),
    };
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.get("/products/stats", async (_req, res, next) => {
  try {
    const total = await prisma.product.count({ where: { deletedAt: null } });
    const active = await prisma.product.count({ where: { deletedAt: null, active: true } });
    res.json({ success: true, data: { total, active } });
  } catch (e) {
    next(e);
  }
});

router.get("/orders/stats", async (_req, res, next) => {
  try {
    const byStatus = await prisma.order.groupBy({
      by: ["status"],
      _count: true,
    });
    res.json({ success: true, data: byStatus });
  } catch (e) {
    next(e);
  }
});

router.get("/orders", async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const status = req.query.status as string | undefined;
    const orders = await prisma.order.findMany({
      where: status ? { status: status as OrderStatus } : undefined,
      include: {
        items: { include: { product: { select: { id: true, name: true, image: true } } } },
        user: { select: { id: true, email: true, fullName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    const data = orders.map((o) => ({
      ...o,
      subtotal: Number(o.subtotal),
      discount: Number(o.discount),
      shipping: Number(o.shipping),
      total: Number(o.total),
      items: o.items.map((i) => ({ ...i, price: Number(i.price) })),
    }));
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.get("/reviews", async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const status = req.query.status as string | undefined;
    const reviews = await prisma.review.findMany({
      where: status ? { status } : undefined,
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        product: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    res.json({ success: true, data: reviews });
  } catch (e) {
    next(e);
  }
});

/** Sales report — Admin/Super Admin. */
router.get("/reports/sales", async (_req, res, next) => {
  try {
    const byStatus = await prisma.order.groupBy({
      by: ["status"],
      _count: true,
      _sum: { total: true },
    });
    const data = byStatus.map((s) => ({
      status: s.status,
      count: s._count,
      total: s._sum.total ? Number(s._sum.total) : 0,
    }));
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

/** Revenue report — Admin/Super Admin. */
router.get("/reports/revenue", async (_req, res, next) => {
  try {
    const delivered = await prisma.order.aggregate({
      _sum: { total: true },
      where: { status: "DELIVERED" },
    });
    const refunded = await prisma.order.aggregate({
      _sum: { total: true },
      where: { status: "REFUNDED" },
    });
    res.json({
      success: true,
      data: {
        revenue: delivered._sum.total ? Number(delivered._sum.total) : 0,
        refunded: refunded._sum.total ? Number(refunded._sum.total) : 0,
      },
    });
  } catch (e) {
    next(e);
  }
});

/** Daily trend — orders and revenue by day (last N days). */
router.get("/reports/trend", async (req, res, next) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days) || 30, 1), 365);
    const from = new Date();
    from.setDate(from.getDate() - days);
    from.setUTCHours(0, 0, 0, 0);

    type Row = { date: string | Date; orders: number | bigint; revenue: number | string };
    const rows = await prisma.$queryRaw<Row[]>`
      SELECT
        (o.created_at)::date AS date,
        COUNT(*)::int AS orders,
        COALESCE(SUM(CASE WHEN o.status = 'DELIVERED' THEN o.total ELSE 0 END), 0)::float AS revenue
      FROM orders o
      WHERE o.created_at >= ${from}
      GROUP BY (o.created_at)::date
      ORDER BY date
    `;

    const data = rows.map((r) => ({
      date: r.date instanceof Date ? r.date.toISOString().slice(0, 10) : String(r.date).slice(0, 10),
      orders: Number(r.orders),
      revenue: Number(r.revenue),
    }));
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

/** Sales by category — delivered order items grouped by category. */
router.get("/reports/by-category", async (_req, res, next) => {
  try {
    type Row = { name: string; count: string; revenue: string };
    const rows = await prisma.$queryRaw<Row[]>`
      SELECT
        c.name AS name,
        COUNT(oi.id)::text AS count,
        COALESCE(SUM(oi.price * oi.quantity), 0)::text AS revenue
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      JOIN categories c ON c.id = p.category_id
      JOIN orders o ON o.id = oi.order_id
      WHERE o.status = 'DELIVERED'
      GROUP BY c.id, c.name
      ORDER BY count DESC
    `;

    const data = rows.map((r) => ({
      name: r.name,
      count: Number(r.count),
      revenue: Number(r.revenue),
    }));
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

/** Coupons CRUD — Admin/Super Admin. */
router.get("/coupons", async (req, res, next) => {
  try {
    const activeOnly = req.query.active === "true";
    const coupons = await prisma.coupon.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const data = coupons.map((c) => ({ ...c, value: Number(c.value), minOrder: c.minOrder ? Number(c.minOrder) : null }));
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.post("/coupons", async (req, res, next) => {
  try {
    const { code, type, value, minOrder, maxUses, expiresAt, active } = req.body;
    if (!code || value == null) return next(new AppError(400, "code and value required", "VALIDATION_ERROR"));
    const coupon = await prisma.coupon.create({
      data: {
        code: String(code).toUpperCase().trim(),
        type: type === "FIXED" ? "FIXED" : "PERCENT",
        value: Number(value),
        minOrder: minOrder != null ? Number(minOrder) : null,
        maxUses: maxUses != null ? Number(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        active: active !== false,
      },
    });
    res.status(201).json({ success: true, data: { ...coupon, value: Number(coupon.value), minOrder: coupon.minOrder ? Number(coupon.minOrder) : null } });
  } catch (e) {
    next(e);
  }
});

router.patch("/coupons/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...(body.code != null && { code: String(body.code).toUpperCase().trim() }),
        ...(body.type != null && { type: body.type === "FIXED" ? "FIXED" : "PERCENT" }),
        ...(body.value != null && { value: Number(body.value) }),
        ...(body.minOrder !== undefined && { minOrder: body.minOrder == null ? null : Number(body.minOrder) }),
        ...(body.maxUses !== undefined && { maxUses: body.maxUses == null ? null : Number(body.maxUses) }),
        ...(body.expiresAt !== undefined && { expiresAt: body.expiresAt ? new Date(body.expiresAt) : null }),
        ...(body.active !== undefined && { active: !!body.active }),
      },
    });
    res.json({ success: true, data: { ...coupon, value: Number(coupon.value), minOrder: coupon.minOrder ? Number(coupon.minOrder) : null } });
  } catch (e) {
    next(e);
  }
});

router.delete("/coupons/:id", async (req, res, next) => {
  try {
    await prisma.coupon.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Coupon deleted" });
  } catch (e) {
    next(e);
  }
});

router.get("/logs", async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { user: { select: { id: true, email: true } } },
    });
    res.json({ success: true, data: logs });
  } catch (e) {
    next(e);
  }
});

export default router;
