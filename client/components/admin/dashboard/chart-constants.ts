/**
 * Shared chart styling aligned with app theme (teal accent, charcoal text).
 */

export const CHART_COLORS = [
  "#00C2B2", // teal (accent)
  "#0f766e",
  "#134e4a",
  "#64748b",
  "#475569",
  "#334155",
] as const;

export const CHART_GRAY = "rgb(34 34 34 / 0.2)";

export const TOOLTIP_STYLE = {
  contentStyle: {
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--color-border)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    padding: "10px 12px",
  },
  labelStyle: { fontWeight: 600, color: "var(--text-primary)" },
  itemStyle: { color: "var(--text-muted)" },
} as const;
