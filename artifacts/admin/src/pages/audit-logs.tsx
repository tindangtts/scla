import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, formatDateTime } from "@/lib/api";
import { AdminLayout } from "@/components/layout/admin-layout";
import { ScrollText, Search } from "lucide-react";

interface AuditLog {
  id: string;
  actorId: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

const AUDIT_ACTIONS = [
  "upgrade_approve",
  "upgrade_reject",
  "booking_cancel",
  "staff_create",
  "staff_deactivate",
  "staff_update",
  "content_create",
  "content_update",
  "content_delete",
  "wallet_adjust",
];

function formatAction(action: string): string {
  return action
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

async function fetchAuditLogs(
  action: string,
  from: string,
  to: string,
  page: number
): Promise<AuditLogsResponse> {
  const params = new URLSearchParams();
  if (action) params.set("action", action);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  params.set("page", String(page));
  params.set("limit", "20");

  return apiRequest<AuditLogsResponse>(
    "GET",
    `/admin/audit-logs?${params.toString()}`
  );
}

export default function AuditLogsPage() {
  const [actionFilter, setActionFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [pendingAction, setPendingAction] = useState("");
  const [pendingFrom, setPendingFrom] = useState("");
  const [pendingTo, setPendingTo] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-audit-logs", actionFilter, fromDate, toDate, page],
    queryFn: () => fetchAuditLogs(actionFilter, fromDate, toDate, page),
  });

  const logs = data?.logs ?? [];
  const total = data?.total ?? 0;
  const limit = data?.limit ?? 20;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  function handleSearch() {
    setActionFilter(pendingAction);
    setFromDate(pendingFrom);
    setToDate(pendingTo);
    setPage(1);
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <ScrollText className="w-5 h-5 text-primary" />
          <div>
            <h1 className="text-xl font-bold text-foreground">Audit Logs</h1>
            <p className="text-sm text-muted-foreground">{total} log entries</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Action</label>
          <select
            value={pendingAction}
            onChange={e => setPendingAction(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm bg-background min-w-[180px]"
          >
            <option value="">All Actions</option>
            {AUDIT_ACTIONS.map(a => (
              <option key={a} value={a}>{formatAction(a)}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">From</label>
          <input
            type="date"
            value={pendingFrom}
            onChange={e => setPendingFrom(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm bg-background"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">To</label>
          <input
            type="date"
            value={pendingTo}
            onChange={e => setPendingTo(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm bg-background"
          />
        </div>
        <button
          onClick={handleSearch}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Search className="w-4 h-4" /> Search
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12 text-sm text-muted-foreground">Loading...</div>
        ) : error ? (
          <div className="flex justify-center py-12 text-sm text-red-500">Failed to load audit logs.</div>
        ) : logs.length === 0 ? (
          <div className="flex justify-center py-12 text-sm text-muted-foreground">No audit logs found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Date / Time</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Actor</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Action</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Target Type</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Target ID</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                    {formatDateTime(log.createdAt)}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-xs max-w-[160px] truncate">
                    {log.actorEmail}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium whitespace-nowrap">
                      {formatAction(log.action)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground capitalize">
                    {log.targetType ?? "—"}
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground font-mono max-w-[100px] truncate">
                    {log.targetId ?? "—"}
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground max-w-[200px] truncate">
                    {log.metadata
                      ? JSON.stringify(log.metadata).slice(0, 50)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </AdminLayout>
  );
}
