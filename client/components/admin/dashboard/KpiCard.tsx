"use client";

import { memo } from "react";

const CHART_COLORS = {
  up: "#059669",
  down: "#dc2626",
  neutral: "rgb(34 34 34 / 0.5)",
};

export type KpiCardProps = {
  title: string;
  value: number;
  subtitle?: string;
  format?: (v: number) => string;
  growthPercent?: number;
  loading?: boolean;
};

function KpiCardComponent({
  title,
  value,
  subtitle,
  format = (v: number) => v.toLocaleString("en-IN"),
  growthPercent,
  loading = false,
}: KpiCardProps) {
  const trend =
    growthPercent === undefined
      ? null
      : growthPercent > 0
        ? "up"
        : growthPercent < 0
          ? "down"
          : "neutral";

  return (
    <div
      className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md"
      role="group"
      aria-busy={loading}
    >
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      {loading ? (
        <div className="mt-2 h-8 w-24 animate-pulse rounded bg-muted" aria-hidden />
      ) : (
        <>
          <p className="mt-1 font-heading text-2xl font-bold text-primary">{format(value)}</p>
          {(subtitle != null || trend != null) && (
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {trend != null && (
                <span
                  className="text-xs font-medium"
                  style={{
                    color:
                      trend === "up"
                        ? CHART_COLORS.up
                        : trend === "down"
                          ? CHART_COLORS.down
                          : CHART_COLORS.neutral,
                  }}
                >
                  {trend === "up" && "+"}
                  {growthPercent}% vs previous period
                </span>
              )}
              {subtitle && (
                <span className="text-xs text-muted-foreground">{subtitle}</span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export const KpiCard = memo(KpiCardComponent);
