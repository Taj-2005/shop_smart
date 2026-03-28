"use client";

import { memo } from "react";

export type TopProductRow = {
  productId: string;
  productName: string;
  unitsSold: number;
  revenue: number;
};

type TopProductsTableProps = {
  data: TopProductRow[];
  loading?: boolean;
};

function TopProductsTableComponent({ data, loading }: TopProductsTableProps) {
  if (loading) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
        <div className="flex h-[280px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" aria-hidden />
        </div>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-border bg-surface p-8 text-center">
        <p className="text-sm font-medium text-muted-foreground">No top products yet</p>
        <p className="text-xs text-muted-foreground">Delivered orders will populate this list.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">#</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Product</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Units sold</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.productId} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-4 py-2.5 font-medium text-muted-foreground">{i + 1}</td>
                <td className="px-4 py-2.5 font-medium text-primary">{row.productName}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{row.unitsSold.toLocaleString("en-IN")}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">₹{row.revenue.toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const TopProductsTable = memo(TopProductsTableComponent);
