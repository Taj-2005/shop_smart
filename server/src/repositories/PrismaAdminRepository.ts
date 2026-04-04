import type { OrderStatus, PrismaClient } from "@prisma/client";
import { AppErrorFactory } from "../factories/AppErrorFactory";
import { formatSqlReportDay } from "../utils/reportDate";
import type { IAdminRepository } from "../interfaces/IAdminRepository";

function mapCoupon(c: { value: unknown; minOrder: unknown } & Record<string, unknown>) {
  return { ...c, value: Number(c.value), minOrder: c.minOrder ? Number(c.minOrder) : null };
}

export class PrismaAdminRepository implements IAdminRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async dashboard() {
    const [userCount, productCount, orderCount, totalRevenue] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.product.count({ where: { deletedAt: null } }),
      this.prisma.order.count(),
      this.prisma.order.aggregate({ _sum: { total: true }, where: { status: "DELIVERED" } }),
    ]);
    return {
      users: userCount,
      products: productCount,
      orders: orderCount,
      revenue: totalRevenue._sum.total ? Number(totalRevenue._sum.total) : 0,
    };
  }

  async revenue() {
    const result = await this.prisma.order.aggregate({
      _sum: { total: true },
      where: { status: "DELIVERED" },
    });
    return { total: result._sum.total ? Number(result._sum.total) : 0 };
  }

  async usersStats() {
    const total = await this.prisma.user.count({ where: { deletedAt: null } });
    const byRole = await this.prisma.user.groupBy({
      by: ["roleId"],
      _count: true,
      where: { deletedAt: null },
    });
    const roles = await this.prisma.role.findMany();
    return {
      total,
      byRole: byRole.map((r) => ({
        roleId: r.roleId,
        roleName: roles.find((x) => x.id === r.roleId)?.name,
        count: r._count,
      })),
    };
  }

  async productsStats() {
    const total = await this.prisma.product.count({ where: { deletedAt: null } });
    const active = await this.prisma.product.count({ where: { deletedAt: null, active: true } });
    return { total, active };
  }

  async ordersStats() {
    return this.prisma.order.groupBy({
      by: ["status"],
      _count: true,
    });
  }

  async listOrders(limit: number, status?: OrderStatus) {
    const orders = await this.prisma.order.findMany({
      where: status ? { status } : undefined,
      include: {
        items: { include: { product: { select: { id: true, name: true, image: true } } } },
        user: { select: { id: true, email: true, fullName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return orders.map((o) => ({
      ...o,
      subtotal: Number(o.subtotal),
      discount: Number(o.discount),
      shipping: Number(o.shipping),
      total: Number(o.total),
      items: o.items.map((i) => ({ ...i, price: Number(i.price) })),
    }));
  }

  async listReviews(limit: number, status?: string) {
    return this.prisma.review.findMany({
      where: status ? { status } : undefined,
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        product: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async reportSales() {
    const byStatus = await this.prisma.order.groupBy({
      by: ["status"],
      _count: true,
      _sum: { total: true },
    });
    return byStatus.map((s) => ({
      status: s.status,
      count: s._count,
      total: s._sum.total ? Number(s._sum.total) : 0,
    }));
  }

  async reportRevenue() {
    const delivered = await this.prisma.order.aggregate({
      _sum: { total: true },
      where: { status: "DELIVERED" },
    });
    const refunded = await this.prisma.order.aggregate({
      _sum: { total: true },
      where: { status: "REFUNDED" },
    });
    return {
      revenue: delivered._sum.total ? Number(delivered._sum.total) : 0,
      refunded: refunded._sum.total ? Number(refunded._sum.total) : 0,
    };
  }

  async reportTrend(days: number) {
    const from = new Date();
    from.setDate(from.getDate() - days);
    from.setUTCHours(0, 0, 0, 0);

    type Row = { date: string | Date; orders: number | bigint; revenue: number | string };
    const rows = await this.prisma.$queryRaw<Row[]>`
      SELECT
        (o.created_at)::date AS date,
        COUNT(*)::int AS orders,
        COALESCE(SUM(CASE WHEN o.status = 'DELIVERED' THEN o.total ELSE 0 END), 0)::float AS revenue
      FROM orders o
      WHERE o.created_at >= ${from}
      GROUP BY (o.created_at)::date
      ORDER BY date
    `;

    return rows.map((r) => ({
      date: formatSqlReportDay(r.date),
      orders: Number(r.orders),
      revenue: Number(r.revenue),
    }));
  }

  async reportByCategory() {
    type Row = { name: string; count: string; revenue: string };
    const rows = await this.prisma.$queryRaw<Row[]>`
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

    return rows.map((r) => ({
      name: r.name,
      count: Number(r.count),
      revenue: Number(r.revenue),
    }));
  }

  async listCoupons(activeOnly: boolean) {
    const coupons = await this.prisma.coupon.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return coupons.map((c) => mapCoupon(c));
  }

  async createCoupon(body: {
    code: string;
    type?: string;
    value: number;
    minOrder?: number | null;
    maxUses?: number | null;
    expiresAt?: string | null;
    active?: boolean;
  }) {
    const { code, type, value, minOrder, maxUses, expiresAt, active } = body;
    if (!code || value == null) throw AppErrorFactory.validation("code and value required");
    const coupon = await this.prisma.coupon.create({
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
    return mapCoupon(coupon);
  }

  async updateCoupon(
    id: string,
    body: Partial<{
      code: string;
      type: string;
      value: number;
      minOrder: number | null;
      maxUses: number | null;
      expiresAt: string | null;
      active: boolean;
    }>
  ) {
    const coupon = await this.prisma.coupon.update({
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
    return mapCoupon(coupon);
  }

  async deleteCoupon(id: string) {
    await this.prisma.coupon.delete({ where: { id } });
  }

  async listLogs(limit: number) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { user: { select: { id: true, email: true } } },
    });
  }
}
