/** Format a USD price, e.g. 68345.12 -> "$68,345.12". */
export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Format a fractional return as a signed percentage, e.g. 0.0012 -> "+0.12%". */
export function formatSignedPercent(value: number): string {
  const pct = value * 100;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

/** Format a plain (unsigned) percentage, e.g. 0.834 -> "83.4%". Used for PSI-adjacent stats. */
export function formatPercent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

/** Format an ISO timestamp string as a readable local date + time. */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/** Format a Date as a short local time, e.g. "4:32:10 PM". Used for "last updated". */
export function formatClockTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeStyle: "medium",
  }).format(date);
}

/** Round a PSI score to 3 decimals for display. */
export function formatPsi(value: number): string {
  return value.toFixed(3);
}
