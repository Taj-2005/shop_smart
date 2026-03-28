"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { adminApi, type DashboardData } from "@/api/admin.api";
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
} from "@/components/admin/dashboard";

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [trendData, setTrendData] = useState<TimeSeriesPoint[]>([]);
  const [salesData, setSalesData] = useState<{ status: string; count: number; total: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; count: number; revenue: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DashboardFiltersType>(getDefaultFilters);
  const [trendDays, setTrendDays] = useState(30);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [dashboardRes, salesRes, trendRes, categoryRes] = await Promise.all([
          adminApi.getDashboard(),
          adminApi.getSalesReport(),
          adminApi.getTrend(trendDays),
          adminApi.getSalesByCategory(),
        ]);

        if (dashboardRes.success && dashboardRes.data) setDashboard(dashboardRes.data);
        if (salesRes.success && salesRes.data) setSalesData(salesRes.data);
        if (trendRes.success && trendRes.data) setTrendData(trendRes.data);
        if (categoryRes.success && categoryRes.data) setCategoryData(categoryRes.data);
      } catch {
        setError("Failed to load dashboard");
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

  const avgOrderValue = useMemo(() => {
    if (!dashboard || dashboard.orders === 0) return 0;
    return Math.round(dashboard.revenue / dashboard.orders);
  }, [dashboard]);

  if (error && !dashboard) {
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
          Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Overview of your store performance and analytics.
        </p>
      </div>

      <DashboardFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onDatePreset={handleDatePreset}
        activePresetDays={activePresetDays}
      />

      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">
          Key metrics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Total Revenue"
            value={dashboard?.revenue ?? 0}
            format={(v) => `₹${v.toLocaleString("en-IN")}`}
            loading={loading}
          />
          <KpiCard
            title="Total Orders"
            value={dashboard?.orders ?? 0}
            loading={loading}
          />
          <KpiCard
            title="Active Users"
            value={dashboard?.users ?? 0}
            loading={loading}
          />
          <KpiCard
            title="Products"
            value={dashboard?.products ?? 0}
            loading={loading}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <KpiCard
            title="Avg. Order Value"
            value={avgOrderValue}
            format={(v) => `₹${v.toLocaleString("en-IN")}`}
            subtitle="Revenue per order (from DB)"
            loading={loading}
          />
        </div>
      </section>

      <section aria-labelledby="trend-heading">
        <h2 id="trend-heading" className="mb-2 font-heading text-lg font-semibold text-primary">
          Revenue & orders trend
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Daily revenue and order count from your database (last {trendDays} days).
        </p>
        <RevenueTrendChart data={trendData} loading={loading} />
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="orders-status-heading">
          <h2 id="orders-status-heading" className="mb-2 font-heading text-lg font-semibold text-primary">
            Orders by status
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Order count and revenue by status (from DB).
          </p>
          <OrdersByStatusChart data={ordersByStatusChartData} loading={loading} />
        </section>
        <section aria-labelledby="category-heading">
          <h2 id="category-heading" className="mb-2 font-heading text-lg font-semibold text-primary">
            Sales by category
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Share of delivered order value by category (from DB).
          </p>
          <CategoryDistributionChart data={categoryDistributionChartData} loading={loading} />
        </section>
      </div>
    </div>
  );
}
