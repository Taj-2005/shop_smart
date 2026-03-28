"use client";

import { memo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { OrdersByStatusItem } from "@/types/dashboard";
import { CHART_COLORS, CHART_GRAY, TOOLTIP_STYLE } from "./chart-constants";

type OrdersByStatusChartProps = {
  data: OrdersByStatusItem[];
  loading?: boolean;
};

function OrdersByStatusChartComponent({ data, loading }: OrdersByStatusChartProps) {
  if (loading) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-[var(--radius-lg)] border border-border bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" aria-hidden />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="flex h-[280px] flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-border bg-surface p-4 text-center">
        <p className="text-sm font-medium text-muted-foreground">No orders by status</p>
        <p className="text-xs text-muted-foreground">Run the database seed to add orders.</p>
      </div>
    );
  }

  return (
    <div className="h-[280px] w-full rounded-[var(--radius-lg)] border border-border bg-surface p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 80, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRAY} horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
            tick={{ fontSize: 11, fill: "var(--text-muted)" }}
            axisLine={{ stroke: CHART_GRAY }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="status"
            width={72}
            tick={{ fontSize: 11, fill: "var(--text-muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE.contentStyle}
            labelStyle={TOOLTIP_STYLE.labelStyle}
            formatter={(value, name) => {
              const numericValue = typeof value === "number" ? value : Number(value ?? 0);
              const key = String(name);

              if (key === "count") return [numericValue, "Orders"];
              if (key === "totalRevenue") return [`₹${numericValue.toLocaleString("en-IN")}`, "Revenue"];
              return [numericValue, key];
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar
            dataKey="count"
            name="Orders"
            fill={CHART_COLORS[0]}
            radius={[0, 4, 4, 0]}
            maxBarSize={28}
          />
          <Bar
            dataKey="totalRevenue"
            name="Revenue (₹)"
            fill={CHART_COLORS[1]}
            radius={[0, 4, 4, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export const OrdersByStatusChart = memo(OrdersByStatusChartComponent);
