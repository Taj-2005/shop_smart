"use client";

import { memo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { CategoryDistributionItem } from "@/types/dashboard";
import { CHART_COLORS, TOOLTIP_STYLE } from "./chart-constants";

type CategoryDistributionChartProps = {
  data: CategoryDistributionItem[];
  loading?: boolean;
};

function CategoryDistributionChartComponent({ data, loading }: CategoryDistributionChartProps) {
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
        <p className="text-sm font-medium text-muted-foreground">No sales by category</p>
        <p className="text-xs text-muted-foreground">Delivered orders with items will appear here. Run the seed to add data.</p>
      </div>
    );
  }

  return (
    <div className="h-[280px] w-full rounded-[var(--radius-lg)] border border-border bg-surface p-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={2}
            label={({ name, value }) => `${name} ${value}%`}
            labelLine={false}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={TOOLTIP_STYLE.contentStyle}
            labelStyle={TOOLTIP_STYLE.labelStyle}
            formatter={(value, name, item) => {
              const percent = typeof value === "number" ? value : Number(value ?? 0);
              const countRaw =
                item && typeof item === "object" && "payload" in item
                  ? // Recharts keeps the original datum on `payload`
                    (item.payload as { count?: number } | undefined)?.count
                  : undefined;
              const count = typeof countRaw === "number" ? countRaw : 0;

              return [
                `${percent}% (${count.toLocaleString("en-IN")} orders)`,
                String(name),
              ];
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export const CategoryDistributionChart = memo(CategoryDistributionChartComponent);
