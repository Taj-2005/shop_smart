"use client";

import { useState, useEffect, useCallback } from "react";
import { adminApi, type AdminOrder } from "@/api/admin.api";
import { orderApi } from "@/api/order.api";
import { toApiError } from "@/api/axios";

const STATUS_OPTIONS = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"] as const;

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-indigo-100 text-indigo-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-muted text-muted-foreground",
  REFUNDED: "bg-red-100 text-red-800",
};

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewOrder, setViewOrder] = useState<AdminOrder | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const loadOrders = useCallback(() => {
    setLoading(true);
    setError(null);
    adminApi
      .listOrders({ status: statusFilter !== "all" ? statusFilter : undefined })
      .then((res) => {
        if (res.success && res.data) setOrders(res.data);
      })
      .catch(() => setError("Failed to load orders"))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filtered = orders;

  const handleUpdateStatus = async (orderId: string, status: string) => {
    setStatusError(null);
    setStatusUpdating(true);
    try {
      await orderApi.updateStatus(orderId, status);
      loadOrders();
      setViewOrder((prev) => (prev?.id === orderId ? { ...prev, status } : prev));
    } catch (e) {
      setStatusError(toApiError(e).message ?? "Failed to update status");
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" aria-hidden />
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-error)] bg-[var(--color-error)]/10 p-6 text-[var(--color-error)]">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-primary">
          Orders
        </h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-[var(--radius-sm)] border border-border bg-surface px-3 py-2 text-sm text-primary focus-visible:outline focus-visible:ring-2 focus-visible:ring-accent"
        >
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 font-semibold text-primary">Order ID</th>
                <th className="px-4 py-3 font-semibold text-primary">Date</th>
                <th className="px-4 py-3 font-semibold text-primary">Customer</th>
                <th className="px-4 py-3 font-semibold text-primary">Status</th>
                <th className="px-4 py-3 font-semibold text-primary">Total</th>
                <th className="px-4 py-3 font-semibold text-primary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-primary">{o.id.slice(0, 8)}…</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{o.user?.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[o.status] ?? "bg-muted text-muted-foreground"}`}
                    >
                      {o.status.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setViewOrder(o)}
                      className="text-accent hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="order-detail-title">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-lg">
            <h2 id="order-detail-title" className="font-heading text-lg font-semibold text-primary">
              Order {viewOrder.id.slice(0, 8)}…
            </h2>
            {statusError && <p className="mt-2 text-sm text-[var(--color-error)]">{statusError}</p>}
            <p className="mt-1 text-sm text-muted-foreground">{formatDate(viewOrder.createdAt)} · {viewOrder.user?.email}</p>
            <p className="mt-2 font-medium text-primary">Total: {formatPrice(viewOrder.total)}</p>
            <ul className="mt-3 space-y-1 text-sm">
              {viewOrder.items?.map((i) => (
                <li key={i.id}>
                  {i.product?.name ?? "Item"} × {i.quantity} — {formatPrice(i.price * i.quantity)}
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <label htmlFor="order-status-select" className="block text-sm font-medium text-primary">
                Status
              </label>
              <select
                id="order-status-select"
                value={viewOrder.status}
                onChange={(e) => handleUpdateStatus(viewOrder.id, e.target.value)}
                disabled={statusUpdating}
                className="mt-1 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-3 py-2 text-primary"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setViewOrder(null)}
                className="rounded-[var(--radius-sm)] border border-border px-4 py-2 text-sm font-medium text-primary hover:bg-muted"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
