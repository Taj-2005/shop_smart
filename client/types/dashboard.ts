/** Dashboard chart data types (aligned with API responses). */

export type TimeSeriesPoint = {
  date: string;
  revenue: number;
  orders: number;
};

export type OrdersByStatusItem = {
  status: string;
  count: number;
  totalRevenue: number;
};

export type CategoryDistributionItem = {
  name: string;
  value: number;
  count: number;
};

export type DashboardFilters = {
  dateFrom: string;
  dateTo: string;
  category: string;
  status: string;
};

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function getDefaultFilters(): DashboardFilters {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    dateFrom: formatDate(from),
    dateTo: formatDate(to),
    category: "",
    status: "",
  };
}

export function getDateRangeFromDays(days: number): { dateFrom: string; dateTo: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return { dateFrom: formatDate(from), dateTo: formatDate(to) };
}
