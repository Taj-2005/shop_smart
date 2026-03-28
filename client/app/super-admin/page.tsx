"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { superAdminApi, type SuperAdminAnalytics, type TopProduct } from "@/api/super-admin.api";
import { adminApi } from "@/api/admin.api";
import {
  getDefaultFilters,
  getDateRangeFromDays,
  type DashboardFilters as DashboardFiltersType,
} from "@/types/dashboard";
import type { TimeSeriesPoint, OrdersByStatusItem, CategoryDistributionItem } from "@/types/dashboard";
import {
  KpiCard,
  RevenueTrendChart,
  OrdersByStatusChart,
  CategoryDistributionChart,
  DashboardFilters,
  TopProductsTable,
  RecentOrdersTable,
} from "@/components/admin/dashboard";

function growthPercent(current: number, previous: number): number | undefined {
  if (previous === 0) return current > 0 ? 100 : undefined;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export default function SuperAdminDashboardPage() {
  const [analytics, setAnalytics] = useState<SuperAdminAnalytics | null>(null);
  const [trendData, setTrendData] = useState<TimeSeriesPoint[]>([]);
  const [salesData, setSalesData] = useState<{ status: string; count: number; total: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; count: number; revenue: number }[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DashboardFiltersType>(getDefaultFilters);
  const [trendDays, setTrendDays] = useState(30);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [analyticsRes, trendRes, salesRes, categoryRes, topRes] = await Promise.all([
          superAdminApi.getAnalytics(trendDays),
          adminApi.getTrend(trendDays),
          adminApi.getSalesReport(),
          adminApi.getSalesByCategory(),
          superAdminApi.getTopProducts(10),
        ]);

        if (analyticsRes.success && analyticsRes.data) setAnalytics(analyticsRes.data);
        if (trendRes.success && trendRes.data) setTrendData(trendRes.data);
        if (salesRes.success && salesRes.data) setSalesData(salesRes.data);
        if (categoryRes.success && categoryRes.data) setCategoryData(categoryRes.data);
        if (topRes.success && topRes.data) setTopProducts(topRes.data);
      } catch {
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [trendDays]);

  const ordersByStatusChartData = useMemo<OrdersByStatusItem[]>(() => {
    const filtered = filters.status
      ? salesData.filter((s) => s.status === filters.status)
      : salesData;
    return filtered.map((s) => ({
      status: s.status,
      count: s.count,
      totalRevenue: s.total,
    }));
  }, [salesData, filters.status]);

  const categorySlugToName: Record<string, string> = {
    electronics: "Electronics",
    fashion: "Fashion",
    home: "Home",
    sports: "Sports",
  };

  const categoryDistributionChartData = useMemo<CategoryDistributionItem[]>(() => {
    const filtered = filters.category
      ? categoryData.filter((c) => c.name === categorySlugToName[filters.category] || c.name.toLowerCase().replace(/\s+/g, "-") === filters.category)
      : categoryData;
    const total = filtered.reduce((sum, c) => sum + c.revenue, 0);
    if (total === 0) return filtered.map((c) => ({ name: c.name, value: 0, count: c.count }));
    return filtered.map((c) => ({
      name: c.name,
      value: Math.round((c.revenue / total) * 1000) / 10,
      count: c.count,
    }));
  }, [categoryData, filters.category]);

  const handleFiltersChange = useCallback((next: Partial<DashboardFiltersType>) => {
    setFilters((prev) => ({ ...prev, ...next }));
    if (next.dateFrom !== undefined || next.dateTo !== undefined) {
      const from = next.dateFrom ?? filters.dateFrom;
      const to = next.dateTo ?? filters.dateTo;
      const fromDate = new Date(from);
      const toDate = new Date(to);
      const days = Math.round((toDate.getTime() - fromDate.getTime()) / 86400000);
      if (days >= 1 && days <= 365) setTrendDays(days);
    }
  }, [filters.dateFrom, filters.dateTo]);

  const handleDatePreset = useCallback((days: number) => {
    setTrendDays(days);
    setFilters((prev) => ({
      ...prev,
      ...getDateRangeFromDays(days),
    }));
  }, []);

  const activePresetDays = [7, 30, 90].includes(trendDays) ? trendDays : undefined;

  const comparison = analytics?.comparison;
  const revenueGrowth = comparison ? growthPercent(comparison.revenueCurrent, comparison.revenuePrevious) : undefined;
  const ordersGrowth = comparison ? growthPercent(comparison.ordersCurrent, comparison.ordersPrevious) : undefined;
  const usersGrowth = comparison ? growthPercent(comparison.usersCurrent, comparison.usersPrevious) : undefined;

  const avgOrderValue = useMemo(() => {
    if (!analytics || analytics.orders === 0) return 0;
    return Math.round(analytics.revenue / analytics.orders);
  }, [analytics]);

  if (error && !analytics) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-error)] bg-[var(--color-error)]/10 p-6 text-[var(--color-error)]">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-primary">
          Full analytics
        </h1>
        <p className="mt-1 text-muted-foreground">
          System-wide metrics, trends, and performance. Super Admin only.
        </p>
      </div>

      <DashboardFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onDatePreset={handleDatePreset}
        activePresetDays={activePresetDays}
      />

      <section aria-labelledby="super-stats-heading">
        <h2 id="super-stats-heading" className="sr-only">
          Key metrics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Total revenue"
            value={analytics?.revenue ?? 0}
            format={(v) => `₹${v.toLocaleString("en-IN")}`}
            growthPercent={revenueGrowth}
            loading={loading}
          />
          <KpiCard
            title="Orders"
            value={analytics?.orders ?? 0}
            growthPercent={ordersGrowth}
            loading={loading}
          />
          <KpiCard
            title="Users"
            value={analytics?.users ?? 0}
            growthPercent={usersGrowth}
            loading={loading}
          />
          <KpiCard
            title="Products"
            value={analytics?.products ?? 0}
            loading={loading}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Refunded"
            value={analytics?.refunded ?? 0}
            format={(v) => `₹${v.toLocaleString("en-IN")}`}
            subtitle="Total refunded amount"
            loading={loading}
          />
          <KpiCard
            title="Cancelled orders"
            value={analytics?.cancelledCount ?? 0}
            loading={loading}
          />
          <KpiCard
            title="Avg. order value"
            value={avgOrderValue}
            format={(v) => `₹${v.toLocaleString("en-IN")}`}
            subtitle="Revenue per order"
            loading={loading}
          />
          <KpiCard
            title="Period"
            value={trendDays}
            format={(v) => `${v} days`}
            subtitle="Comparison window"
            loading={false}
          />
        </div>
      </section>

      <section aria-labelledby="super-trend-heading">
        <h2 id="super-trend-heading" className="mb-2 font-heading text-lg font-semibold text-primary">
          Revenue & orders trend
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Daily revenue (delivered) and order count — last {trendDays} days.
        </p>
        <RevenueTrendChart data={trendData} loading={loading} />
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="super-orders-status-heading">
          <h2 id="super-orders-status-heading" className="mb-2 font-heading text-lg font-semibold text-primary">
            Orders by status
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Count and revenue by order status.
          </p>
          <OrdersByStatusChart data={ordersByStatusChartData} loading={loading} />
        </section>
        <section aria-labelledby="super-category-heading">
          <h2 id="super-category-heading" className="mb-2 font-heading text-lg font-semibold text-primary">
            Sales by category
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Share of delivered order value by category.
          </p>
          <CategoryDistributionChart data={categoryDistributionChartData} loading={loading} />
        </section>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="super-top-products-heading">
          <h2 id="super-top-products-heading" className="mb-2 font-heading text-lg font-semibold text-primary">
            Top products (by units sold)
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Best-selling products from delivered orders.
          </p>
          <TopProductsTable data={topProducts} loading={loading} />
        </section>
        <section aria-labelledby="super-recent-orders-heading">
          <h2 id="super-recent-orders-heading" className="mb-2 font-heading text-lg font-semibold text-primary">
            Recent orders
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Latest 10 orders across the platform.
          </p>
          <RecentOrdersTable
            data={analytics?.recentOrders ?? []}
            loading={loading}
          />
        </section>
      </div>
    </div>
  );
}
