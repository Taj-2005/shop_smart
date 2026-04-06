import type { Prisma, RoleType, PrismaClient } from "@prisma/client";
import type { ISuperAdminRepository } from "../interfaces/ISuperAdminRepository";

export class PrismaSuperAdminRepository implements ISuperAdminRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findAdminRole() {
    return this.prisma.role.findUnique({ where: { name: "ADMIN" } });
  }

  findUserByEmailNotDeleted(email: string) {
    return this.prisma.user.findFirst({ where: { email, deletedAt: null }, select: { id: true } });
  }

  createAdminUser(data: { email: string; passwordHash: string; fullName: string; roleId: string }) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        fullName: data.fullName,
        roleId: data.roleId,
        emailVerified: true,
      },
      select: { id: true, email: true, fullName: true, role: true },
    });
  }

  findUserWithRoleNotDeleted(id: string) {
    return this.prisma.user.findFirst({ where: { id, deletedAt: null }, include: { role: true } });
  }

  async softDeleteUser(id: string) {
    await this.prisma.user.update({ where: { id }, data: { deletedAt: new Date(), active: false } });
  }

  findRoleByName(name: RoleType) {
    return this.prisma.role.findUnique({ where: { name }, select: { id: true } });
  }

  updateUserRole(id: string, roleId: string) {
    return this.prisma.user.update({
      where: { id, deletedAt: null },
      data: { roleId },
      select: { id: true, email: true, fullName: true, role: true },
    });
  }

  async getConfigValue(key: string) {
    const row = await this.prisma.systemConfig.findUnique({ where: { key } });
    return row?.value ?? null;
  }

  async getAllConfig() {
    const rows = await this.prisma.systemConfig.findMany();
    return rows.reduce((acc, r) => ({ ...acc, [r.key]: r.value }), {} as Record<string, unknown>);
  }

  async patchConfig(key: string, value: unknown) {
    const json = (value ?? {}) as Prisma.InputJsonValue;
    await this.prisma.systemConfig.upsert({
      where: { key },
      create: { key, value: json },
      update: { value: json },
    });
  }

  async getPaymentConfig() {
    const row = await this.prisma.systemConfig.findUnique({ where: { key: "payment_gateway" } });
    return row?.value ?? { provider: null, enabled: false };
  }

  async patchPaymentConfig(value: Record<string, unknown>) {
    const json = value as Prisma.InputJsonValue;
    await this.prisma.systemConfig.upsert({
      where: { key: "payment_gateway" },
      create: { key: "payment_gateway", value: json },
      update: { value: json },
    });
  }

  async getShippingProviders() {
    const row = await this.prisma.systemConfig.findUnique({ where: { key: "shipping_providers" } });
    return (row?.value as unknown[]) ?? [];
  }

  async patchShippingProviders(value: unknown[]) {
    const json = value as Prisma.InputJsonValue;
    await this.prisma.systemConfig.upsert({
      where: { key: "shipping_providers" },
      create: { key: "shipping_providers", value: json },
      update: { value: json },
    });
  }

  async getFeatureFlags() {
    const row = await this.prisma.systemConfig.findUnique({ where: { key: "feature_flags" } });
    return (row?.value as Record<string, boolean>) ?? { newCheckout: true, reviewsModeration: true };
  }

  async patchFeatureFlags(value: Record<string, boolean>) {
    const json = value as Prisma.InputJsonValue;
    await this.prisma.systemConfig.upsert({
      where: { key: "feature_flags" },
      create: { key: "feature_flags", value: json },
      update: { value: json },
    });
  }

  async topProducts(limit: number) {
    type Row = { productId: string; productName: string; unitsSold: string; revenue: string };
    const rows = await this.prisma.$queryRaw<Row[]>`
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
    return rows.map((r) => ({
      productId: r.productId,
      productName: r.productName,
      unitsSold: Number(r.unitsSold),
      revenue: Number(r.revenue),
    }));
  }

  async analytics(days: number) {
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
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.product.count({ where: { deletedAt: null } }),
      this.prisma.order.count(),
      this.prisma.order.aggregate({ _sum: { total: true }, where: { status: "DELIVERED" } }),
      this.prisma.order.aggregate({ _sum: { total: true }, where: { status: "REFUNDED" } }),
      this.prisma.order.count({ where: { status: "CANCELLED" } }),
      this.prisma.order.groupBy({ by: ["status"], _count: true, _sum: { total: true } }),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { status: "DELIVERED", createdAt: { gte: periodStart, lte: periodEnd } },
      }),
      this.prisma.order.count({ where: { createdAt: { gte: periodStart, lte: periodEnd } } }),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { status: "DELIVERED", createdAt: { gte: previousStart, lt: periodStart } },
      }),
      this.prisma.order.count({ where: { createdAt: { gte: previousStart, lt: periodStart } } }),
      this.prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { email: true, fullName: true } },
          items: { include: { product: { select: { name: true } } }, take: 5 },
        },
      }),
      this.prisma.user.count({ where: { deletedAt: null, createdAt: { gte: periodStart, lte: periodEnd } } }),
      this.prisma.user.count({ where: { deletedAt: null, createdAt: { gte: previousStart, lt: periodStart } } }),
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

    return {
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
    };
  }
}
