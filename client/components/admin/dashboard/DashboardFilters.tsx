"use client";

import { memo } from "react";
import type { DashboardFilters as DashboardFiltersType } from "@/types/dashboard";

const DATE_PRESETS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
] as const;

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
];

const CATEGORY_OPTIONS = [
  { value: "", label: "All categories" },
  { value: "electronics", label: "Electronics" },
  { value: "fashion", label: "Fashion" },
  { value: "home", label: "Home & Living" },
  { value: "sports", label: "Sports" },
];

export type DashboardFiltersProps = {
  filters: DashboardFiltersType;
  onFiltersChange: (f: Partial<DashboardFiltersType>) => void;
  onDatePreset?: (days: number) => void;
  /** Which date preset is active (7, 30, or 90) — that button will use accent/green style. */
  activePresetDays?: number;
};

function DashboardFiltersComponent({
  filters,
  onFiltersChange,
  onDatePreset,
  activePresetDays,
}: DashboardFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Date range</span>
        {DATE_PRESETS.map(({ label, days }) => {
          const isActive = activePresetDays !== undefined && activePresetDays === days;
          return (
            <button
              key={days}
              type="button"
              onClick={() => onDatePreset?.(days)}
              className={`rounded-[var(--radius-sm)] border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                isActive
                  ? "border-accent bg-accent text-on-accent hover:opacity-90"
                  : "border-border bg-muted text-primary hover:bg-accent hover:text-on-accent"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div className="h-6 w-px bg-border" aria-hidden />
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">From</span>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onFiltersChange({ dateFrom: e.target.value })}
            className="rounded-[var(--radius-sm)] border border-border bg-surface px-2 py-1.5 text-sm text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">To</span>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onFiltersChange({ dateTo: e.target.value })}
            className="rounded-[var(--radius-sm)] border border-border bg-surface px-2 py-1.5 text-sm text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />
        </label>
      </div>
      <div className="h-6 w-px bg-border" aria-hidden />
      <label className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Category</span>
        <select
          value={filters.category}
          onChange={(e) => onFiltersChange({ category: e.target.value })}
          className="rounded-[var(--radius-sm)] border border-border bg-surface px-2 py-1.5 text-sm text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {CATEGORY_OPTIONS.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Status</span>
        <select
          value={filters.status}
          onChange={(e) => onFiltersChange({ status: e.target.value })}
          className="rounded-[var(--radius-sm)] border border-border bg-surface px-2 py-1.5 text-sm text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export const DashboardFilters = memo(DashboardFiltersComponent);
