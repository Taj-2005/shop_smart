"use client";

import { memo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { TimeSeriesPoint } from "@/types/dashboard";
import { CHART_COLORS, CHART_GRAY, TOOLTIP_STYLE } from "./chart-constants";

type RevenueTrendChartProps = {
  data: TimeSeriesPoint[];
  loading?: boolean;
};

function formatAxisDate(label: unknown) {
  const dateStr = typeof label === "string" ? label : String(label ?? "");
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

function RevenueTrendChartComponent({ data, loading }: RevenueTrendChartProps) {
  if (loading) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-[var(--radius-lg)] border border-border bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" aria-hidden />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="flex h-[320px] flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-border bg-surface p-4 text-center">
        <p className="text-sm font-medium text-muted-foreground">No trend data yet</p>
        <p className="text-xs text-muted-foreground">Run the database seed to add orders over the last 60 days.</p>
      </div>
    );
  }

  return (
    <div className="h-[320px] w-full rounded-[var(--radius-lg)] border border-border bg-surface p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRAY} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatAxisDate}
            tick={{ fontSize: 11, fill: "var(--text-muted)" }}
            axisLine={{ stroke: CHART_GRAY }}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 11, fill: "var(--text-muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11, fill: "var(--text-muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE.contentStyle}
            labelStyle={TOOLTIP_STYLE.labelStyle}
            labelFormatter={formatAxisDate}
            formatter={(value, name) => {
              const numericValue = typeof value === "number" ? value : Number(value ?? 0);
              const key = String(name);

              if (key === "revenue") return [`₹${numericValue.toLocaleString("en-IN")}`, "Revenue"];
              if (key === "orders") return [numericValue, "Orders"];
              if (key === "users") return [numericValue, "New users"];
              return [numericValue, key];
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value) => (value === "revenue" ? "Revenue" : value === "orders" ? "Orders" : "Users")}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            name="revenue"
            stroke={CHART_COLORS[0]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: CHART_COLORS[0] }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="orders"
            name="orders"
            stroke={CHART_COLORS[1]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: CHART_COLORS[1] }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export const RevenueTrendChart = memo(RevenueTrendChartComponent);
