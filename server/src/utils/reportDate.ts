/** Format a DB/report date value without relying on instanceof Date. */
export function formatSqlReportDay(value: string | Date | number): string {
  const d = new Date(value);
  if (!Number.isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }
  return String(value).slice(0, 10);
}
