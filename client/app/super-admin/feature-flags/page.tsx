"use client";

import { useState, useEffect } from "react";
import { superAdminApi } from "@/api/super-admin.api";
import { toApiError } from "@/api/axios";

export default function SuperAdminFeatureFlagsPage() {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    superAdminApi
      .getFeatureFlags()
      .then((res) => {
        if (res.success && res.data) setFlags(res.data);
      })
      .catch(() => setError("Failed to load feature flags"))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (key: string, value: boolean) => {
    const next = { ...flags, [key]: value };
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await superAdminApi.updateFeatureFlags(next);
      setFlags(next);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (e) {
      setError(toApiError(e).message ?? "Failed to update");
    } finally {
      setSaving(false);
    }
  };

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
      <h1 className="font-heading text-2xl font-bold tracking-tight text-primary">Feature Flags</h1>
      <p className="mt-1 text-sm text-muted-foreground">Enable or disable platform features globally.</p>
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

    <div className="rounded-[var(--radius-lg)] border border-border bg-surface">
      {Object.keys(flags).length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <span className="text-2xl">⚑</span>
          <p className="text-sm font-medium text-primary">No flags configured</p>
          <p className="text-xs text-muted-foreground">Defaults will be set on first save.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {Object.entries(flags).map(([key, value]) => (
            <li key={key}>
              <label className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/50">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-primary">{key}</p>
                  <p className="text-xs text-muted-foreground">{value ? "Enabled" : "Disabled"}</p>
                </div>
                {/* Toggle switch */}
                <div className="relative shrink-0">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handleToggle(key, e.target.checked)}
                    disabled={saving}
                    className="peer sr-only"
                  />
                  <div className="h-5 w-9 rounded-full border border-border bg-muted transition-colors peer-checked:border-accent peer-checked:bg-accent peer-disabled:opacity-50" />
                  <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
                </div>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);
}
