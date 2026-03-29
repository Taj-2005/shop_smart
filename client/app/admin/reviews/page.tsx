"use client";

import { useState, useEffect, useCallback } from "react";
import { adminApi, type AdminReview } from "@/api/admin.api";
import { reviewApi } from "@/api/review.api";
import { toApiError } from "@/api/axios";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadReviews = useCallback(() => {
    setLoading(true);
    setError(null);
    adminApi
      .getReviews({ status: filter !== "all" ? filter : undefined })
      .then((res) => {
        if (res.success && res.data) setReviews(res.data);
      })
      .catch(() => setError("Failed to load reviews"))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleStatus = async (id: string, status: "approved" | "rejected" | "pending" | "flagged") => {
    setUpdatingId(id);
    try {
      await reviewApi.updateStatus(id, status);
      loadReviews();
    } catch (e) {
      setError(toApiError(e).message ?? "Failed to update review");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" aria-hidden />
      </div>
    );
  }

  if (error && reviews.length === 0) {
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
          Ratings & Reviews
        </h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-[var(--radius-sm)] border border-border bg-surface px-3 py-2 text-sm text-primary focus-visible:outline focus-visible:ring-2 focus-visible:ring-accent"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="flagged">Flagged</option>
        </select>
      </div>

      <div className="space-y-4">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="rounded-[var(--radius-lg)] border border-border bg-surface p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-primary">{r.product?.name ?? "Product"}</p>
                <p className="text-sm text-muted-foreground">
                  {r.user?.fullName ?? r.user?.email} · {r.rating} ★
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                  r.status === "approved"
                    ? "bg-green-100 text-green-800"
                    : r.status === "flagged" || r.status === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-amber-100 text-amber-800"
                }`}
              >
                {r.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-primary">{r.body ?? "—"}</p>
            <div className="mt-3 flex gap-2">
              {r.status === "pending" && (
                <>
                  <button
                    type="button"
                    disabled={updatingId === r.id}
                    onClick={() => handleStatus(r.id, "approved")}
                    className="rounded-[var(--radius-sm)] bg-accent px-3 py-1.5 text-xs font-medium text-on-accent hover:bg-accent/90 disabled:opacity-50"
                  >
                    {updatingId === r.id ? "Updating…" : "Approve"}
                  </button>
                  <button
                    type="button"
                    disabled={updatingId === r.id}
                    onClick={() => handleStatus(r.id, "rejected")}
                    className="rounded-[var(--radius-sm)] border border-border px-3 py-1.5 text-xs font-medium text-primary hover:bg-muted disabled:opacity-50"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
