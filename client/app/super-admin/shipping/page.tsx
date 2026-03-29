"use client";

import { useState, useEffect } from "react";
import { superAdminApi } from "@/api/super-admin.api";
import { toApiError } from "@/api/axios";

export default function SuperAdminShippingPage() {
  const [providers, setProviders] = useState<{ id?: string; name: string; enabled?: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    superAdminApi
      .getShippingProviders()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) setProviders(res.data.length ? res.data : [{ name: "", enabled: true }]);
        else setProviders([{ name: "", enabled: true }]);
      })
      .catch(() => setError("Failed to load shipping providers"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = providers.filter((p) => p.name?.trim());
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await superAdminApi.updateShippingProviders(valid.length ? valid : []);
      setProviders(valid.length ? valid : [{ name: "", enabled: true }]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (e) {
      setError(toApiError(e).message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const addRow = () => setProviders((p) => [...p, { name: "", enabled: true }]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" aria-hidden />
      </div>
    );
  }

 return (
  <div className="space-y-6">
    <div>
      <h1 className="font-heading text-2xl font-bold tracking-tight text-primary">Shipping Providers</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage and configure your shipping options.</p>
    </div>

    {error && (
      <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-error)]/30 bg-[var(--color-error)]/8 px-4 py-3 text-sm text-[var(--color-error)]">
        <span className="shrink-0">⚠</span>
        {error}
      </div>
    )}
    {success && (
      <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-green-500/30 bg-green-500/8 px-4 py-3 text-sm text-green-600">
        <span className="shrink-0">✓</span>
        Changes saved successfully.
      </div>
    )}

    <form onSubmit={handleSave} className="rounded-[var(--radius-lg)] border border-border bg-surface">
      {/* Provider rows */}
      {providers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <span className="text-2xl">🚚</span>
          <p className="text-sm font-medium text-primary">No providers yet</p>
          <p className="text-xs text-muted-foreground">Add a provider to get started.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {providers.map((p, i) => (
            <li key={i} className="flex items-center gap-4 px-5 py-4">
              {/* Index badge */}
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs text-muted-foreground">
                {i + 1}
              </span>

              {/* Name input */}
              <input
                type="text"
                value={p.name}
                onChange={(e) =>
                  setProviders((prev) =>
                    prev.map((x, j) => (j === i ? { ...x, name: e.target.value } : x))
                  )
                }
                placeholder="Provider name (e.g. FedEx)"
                className="flex-1 rounded-[var(--radius-sm)] border border-border bg-muted/30 px-3 py-2 text-sm text-primary placeholder:text-muted-foreground/60 transition-colors focus:border-accent focus:bg-surface focus:outline-none focus:ring-2 focus:ring-accent/20"
              />

              {/* Toggle */}
              <label className="relative shrink-0 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!p.enabled}
                  onChange={(e) =>
                    setProviders((prev) =>
                      prev.map((x, j) => (j === i ? { ...x, enabled: e.target.checked } : x))
                    )
                  }
                  className="peer sr-only"
                />
                <div className="h-5 w-9 rounded-full border border-border bg-muted transition-colors peer-checked:border-accent peer-checked:bg-accent" />
                <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
              </label>

              {/* Remove */}
              <button
                type="button"
                onClick={() => setProviders((prev) => prev.filter((_, j) => j !== i))}
                className="shrink-0 rounded-[var(--radius-sm)] p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                aria-label="Remove provider"
              >
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M6 5l-3 3 3 3M10 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border px-5 py-4">
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-dashed border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-accent hover:text-accent"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Add provider
        </button>

        <button
          type="submit"
          disabled={saving}
          className="rounded-[var(--radius)] bg-accent px-5 py-2.5 text-sm font-medium text-on-accent transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3"/>
                <path d="M14 8a6 6 0 00-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Saving…
            </span>
          ) : "Save changes"}
        </button>
      </div>
    </form>
  </div>
);
}
