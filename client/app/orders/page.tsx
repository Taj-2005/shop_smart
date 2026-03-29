"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Container } from "@/components/layout/container";
import { orderApi, type ApiOrder } from "@/api/order.api";

function formatPrice(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function OrderCard({ order }: { order: ApiOrder }) {
  const [expanded, setExpanded] = useState(false);
  const status = order.status?.toLowerCase() ?? "pending";

  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-muted/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-accent"
      >
        <div className="min-w-0">
          <p className="font-heading font-semibold text-primary">{order.id.slice(0, 8)}…</p>
          <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="rounded-full px-2.5 py-0.5 text-xs font-medium capitalize bg-muted text-muted-foreground">
            {status}
          </span>
          <span className="font-semibold text-primary">{formatPrice(order.total)}</span>
          <span className="text-muted-foreground" aria-hidden>{expanded ? "▼" : "▶"}</span>
        </div>
      </button>
      {expanded && (
        <div className="border-t border-border p-4 space-y-4">
          <ul className="space-y-2">
            {order.items?.map((item) => (
              <li key={item.id} className="flex gap-3 text-sm">
                {item.product?.image && (
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-muted">
                    <Image src={item.product.image} alt={item.product?.name ?? ""} fill className="object-cover" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-medium text-primary">{item.product?.name ?? "Item"}</p>
                  <p className="text-muted-foreground">
                    Qty: {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <Link
            href="/shop"
            className="inline-block rounded-[var(--radius-sm)] bg-accent px-3 py-2 text-sm font-medium text-on-accent hover:bg-accent/90"
          >
            Order again
          </Link>
        </div>
      )}
    </div>
  );
}

function OrdersContent() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    orderApi
      .list()
      .then((res) => {
        if (res.success && res.data) setOrders(res.data);
      })
      .catch(() => setError("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" aria-hidden />
      </div>
    );
  }

  if (error) {
    return (
      <Container as="div" className="py-8 lg:py-12">
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-error)] bg-[var(--color-error)]/10 p-6 text-[var(--color-error)]">
          {error}
        </div>
      </Container>
    );
  }

  return (
    <Container as="div" className="py-8 lg:py-12">
      <h1 className="font-heading text-3xl font-bold tracking-tight text-primary">
        Order history
      </h1>
      <p className="mt-2 text-muted-foreground">
        View and manage your orders.
      </p>

      {orders.length === 0 ? (
        <div className="mt-12 rounded-[var(--radius-lg)] border border-border bg-surface py-16 text-center">
          <p className="text-muted-foreground">You haven’t placed any orders yet.</p>
          <Link
            href="/shop"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-[var(--radius)] bg-accent px-6 text-sm font-medium text-on-accent hover:bg-accent/90"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-4" role="list">
          {orders.map((order) => (
            <li key={order.id}>
              <OrderCard order={order} />
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersContent />
    </ProtectedRoute>
  );
}
