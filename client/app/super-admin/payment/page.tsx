"use client";

import { useState, useEffect } from "react";
import { superAdminApi } from "@/api/super-admin.api";
import { toApiError } from "@/api/axios";

export default function SuperAdminPaymentPage() {
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    superAdminApi
      .getPaymentConfig()
      .then((res) => {
        if (res.success && res.data) setConfig(res.data);
      })
      .catch(() => setError("Failed to load payment config"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await superAdminApi.updatePaymentConfig(config);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (e) {
      setError(toApiError(e).message ?? "Failed to save");
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
    <h1 className="font-heading text-2xl font-bold tracking-tight text-primary">Payment Gateway</h1>
    <p className="mt-1 text-sm text-muted-foreground">Configure your payment provider and settings.</p>
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

  <form onSubmit={handleSave} className="max-w-md rounded-[var(--radius-lg)] border border-border bg-surface">
    {/* Provider field */}
    <div className="space-y-4 p-6">
      <div className="space-y-1.5">
        <label htmlFor="payment-provider" className="block text-sm font-medium text-primary">
          Provider
        </label>
        <input
          id="payment-provider"
          type="text"
          value={(config.provider as string) ?? ""}
          onChange={(e) => setConfig((c) => ({ ...c, provider: e.target.value }))}
          placeholder="e.g. stripe"
          className="w-full rounded-[var(--radius-sm)] border border-border bg-muted/30 px-3 py-2.5 text-sm text-primary placeholder:text-muted-foreground/60 transition-colors focus:border-accent focus:bg-surface focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
        <p className="text-xs text-muted-foreground">Supported: stripe, paypal, razorpay</p>
      </div>

      {/* Enabled toggle */}
      <div className="flex items-center justify-between rounded-[var(--radius-sm)] border border-border bg-muted/20 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-primary">Enable payments</p>
          <p className="text-xs text-muted-foreground">Accept live transactions on the storefront</p>
        </div>
        <label className="relative shrink-0 cursor-pointer">
          <input
            id="payment-enabled"
            type="checkbox"
            checked={!!config.enabled}
            onChange={(e) => setConfig((c) => ({ ...c, enabled: e.target.checked }))}
            className="peer sr-only"
          />
          <div className="h-5 w-9 rounded-full border border-border bg-muted transition-colors peer-checked:border-accent peer-checked:bg-accent" />
          <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
        </label>
      </div>
    </div>

    {/* Footer */}
    <div className="flex items-center justify-end border-t border-border px-6 py-4">
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
