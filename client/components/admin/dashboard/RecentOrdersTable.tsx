"use client";

import { memo } from "react";

export type RecentOrderRow = {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  user: { email: string; fullName: string };
  items: { productName: string; quantity: number; price: number }[];
};

type RecentOrdersTableProps = {
  data: RecentOrderRow[];
  loading?: boolean;
};

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-IN", { dateStyle: "short" });
}

function RecentOrdersTableComponent({ data, loading }: RecentOrdersTableProps) {
  if (loading) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
        <div className="flex h-[240px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" aria-hidden />
        </div>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-border bg-surface p-8 text-center">
        <p className="text-sm font-medium text-muted-foreground">No recent orders</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Customer</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-4 py-2.5 text-muted-foreground">{formatDate(row.createdAt)}</td>
                <td className="px-4 py-2.5">
                  <span className="font-medium text-primary">{row.user?.fullName || row.user?.email}</span>
                  {row.user?.email && (
                    <span className="ml-1 block text-xs text-muted-foreground">{row.user.email}</span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-primary">
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums font-medium">₹{row.total.toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const RecentOrdersTable = memo(RecentOrdersTableComponent);
