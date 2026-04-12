/**
 * Shared formatters used across resident and admin UIs.
 * Keep these pure + deterministic (no Intl.RelativeTimeFormat inside server components).
 */

export function formatMMK(amount: string | number | null | undefined): string {
  const n = typeof amount === "string" ? Number(amount) : (amount ?? 0);
  if (!Number.isFinite(n)) return "0 MMK";
  return `${Math.round(n).toLocaleString("en-US")} MMK`;
}

export function formatDate(
  value: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" },
): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", options);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  return formatDate(value, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function greeting(hour = new Date().getHours()): "Good morning" | "Good afternoon" | "Good evening" {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * Map status strings to our semantic badge-* utility classes defined in globals.css.
 * Falls back to badge-closed (muted gray) for unknown statuses.
 */
export function statusBadgeClass(status: string | null | undefined): string {
  switch (status) {
    case "paid":
      return "badge-paid";
    case "unpaid":
      return "badge-unpaid";
    case "partially_paid":
    case "partially-paid":
      return "badge-partially-paid";
    case "overdue":
      return "badge-overdue";
    case "open":
      return "badge-open";
    case "in_progress":
    case "in-progress":
      return "badge-in-progress";
    case "completed":
    case "resolved":
      return "badge-completed";
    case "upcoming":
    case "confirmed":
      return "badge-upcoming";
    case "cancelled":
    case "canceled":
      return "badge-cancelled";
    case "closed":
      return "badge-closed";
    default:
      return "badge-closed";
  }
}

export function humanizeStatus(status: string | null | undefined): string {
  if (!status) return "—";
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
