"use client";

import { useState, useEffect } from "react";
import { superAdminApi } from "@/api/super-admin.api";

export default function SuperAdminConfigPage() {
  const [config, setConfig] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    superAdminApi
      .getConfig()
      .then((res) => {
        if (res.success && res.data) setConfig(res.data as Record<string, unknown>);
      })
      .catch(() => setError("Failed to load config"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" aria-hidden />
      </div>
    );
  }

  if (error) {
    return <p className="text-[var(--color-error)]">{error}</p>;
  }

return (
  <div className="space-y-6">
    <div>
      <h1 className="font-heading text-2xl font-bold tracking-tight text-primary">System Config</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Key-value configuration. Edit via API or dedicated sections — Payment, Shipping, Feature Flags.
      </p>
    </div>

    {config && Object.keys(config).length > 0 ? (
      <div className="rounded-[var(--radius-lg)] border border-border bg-surface">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="font-mono text-xs text-muted-foreground">config.json</span>
          </div>
          <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
            {Object.keys(config).length} keys
          </span>
        </div>

        {/* Key-value rows */}
        <ul className="divide-y divide-border">
          {Object.entries(config).map(([key, value]) => (
            <li key={key} className="flex items-start gap-4 px-5 py-3 transition-colors hover:bg-muted/40">
              <span className="mt-0.5 shrink-0 font-mono text-xs font-semibold text-accent">{key}</span>
              <span className="ml-auto min-w-0 break-all font-mono text-xs text-muted-foreground">
                {typeof value === "object"
                  ? JSON.stringify(value)
                  : String(value)}
              </span>
            </li>
          ))}
        </ul>

        {/* Raw JSON toggle */}
        <details className="group border-t border-border">
          <summary className="flex cursor-pointer select-none items-center justify-between px-5 py-3 text-xs font-medium text-muted-foreground transition-colors hover:text-primary">
            Raw JSON
            <svg
              className="h-3.5 w-3.5 transition-transform group-open:rotate-180"
              viewBox="0 0 16 16" fill="none"
            >
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </summary>
          <pre className="overflow-auto bg-muted/30 px-5 py-4 font-mono text-xs text-primary">
            {JSON.stringify(config, null, 2)}
          </pre>
        </details>
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-dashed border-border py-14 text-center">
        <span className="text-2xl">⚙</span>
        <p className="text-sm font-medium text-primary">No config keys set yet</p>
        <p className="text-xs text-muted-foreground">Keys will appear here once added via the API.</p>
      </div>
    )}
  </div>
);
}
