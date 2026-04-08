export function formatMMK(amount: number | null | undefined): string {
  if (amount == null) return "0 MMK";
  return `${amount.toLocaleString("en-US")} MMK`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric"
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

export function getStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    unpaid: "badge-unpaid",
    partially_paid: "badge-partially-paid",
    paid: "badge-paid",
    open: "badge-open",
    in_progress: "badge-in-progress",
    completed: "badge-completed",
    upcoming: "badge-upcoming",
    cancelled: "badge-cancelled",
    pending: "badge-partially-paid",
    approved: "badge-paid",
    rejected: "badge-unpaid",
  };
  return map[status] ?? "bg-gray-100 text-gray-600";
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    unpaid: "Unpaid",
    partially_paid: "Partially Paid",
    paid: "Paid",
    open: "Open",
    in_progress: "In Progress",
    completed: "Completed",
    upcoming: "Upcoming",
    cancelled: "Cancelled",
    pending: "Pending Review",
    approved: "Approved",
    rejected: "Rejected",
    none: "Not Requested",
  };
  return map[status] ?? status;
}
