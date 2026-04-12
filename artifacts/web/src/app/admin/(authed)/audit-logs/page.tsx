import { requireAdmin } from "@/lib/auth";
import { getAuditLogs } from "@/lib/queries/admin-audit";
import { AdminPageHeader } from "@/components/layout/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime, humanizeStatus } from "@/lib/format";
import { ScrollText, Filter } from "lucide-react";

export const dynamic = "force-dynamic";

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

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; dateFrom?: string; dateTo?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const actionFilter = params.action || "";
  const dateFrom = params.dateFrom || "";
  const dateTo = params.dateTo || "";

  const logs = await getAuditLogs(
    actionFilter || undefined,
    dateFrom || undefined,
    dateTo || undefined,
  );

  return (
    <div>
      <AdminPageHeader
        title="Audit logs"
        description={`${logs.length} entr${logs.length === 1 ? "y" : "ies"}${actionFilter ? ` · ${humanizeStatus(actionFilter)}` : ""}`}
      />

      <form
        method="GET"
        className="rounded-2xl bg-card border border-card-border p-3 shadow-sm mb-6 flex flex-wrap items-end gap-2.5"
      >
        <div className="space-y-1 flex-1 min-w-[180px]">
          <label
            htmlFor="action"
            className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
          >
            Action
          </label>
          <select
            id="action"
            name="action"
            defaultValue={actionFilter}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          >
            <option value="">All actions</option>
            {AUDIT_ACTIONS.map((a) => (
              <option key={a} value={a}>
                {humanizeStatus(a)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label
            htmlFor="dateFrom"
            className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
          >
            From
          </label>
          <Input
            id="dateFrom"
            type="date"
            name="dateFrom"
            defaultValue={dateFrom}
            className="h-9"
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="dateTo"
            className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
          >
            To
          </label>
          <Input id="dateTo" type="date" name="dateTo" defaultValue={dateTo} className="h-9" />
        </div>
        <Button type="submit" size="default" className="font-bold">
          <Filter className="w-4 h-4" aria-hidden="true" />
          Filter
        </Button>
      </form>

      {logs.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No audit entries"
          description="Staff actions will appear here as they happen."
        />
      ) : (
        <div className="rounded-2xl bg-card border border-card-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/60 border-b border-border">
                  <th className="py-3 px-4 font-bold">When</th>
                  <th className="py-3 px-4 font-bold">Actor</th>
                  <th className="py-3 px-4 font-bold">Action</th>
                  <th className="py-3 px-4 font-bold">Target</th>
                  <th className="py-3 px-4 font-bold">Target ID</th>
                  <th className="py-3 px-4 font-bold">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => {
                  const metaStr = log.metadata ? JSON.stringify(log.metadata) : "—";
                  const truncatedMeta =
                    metaStr.length > 100 ? metaStr.substring(0, 100) + "…" : metaStr;
                  return (
                    <tr key={log.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-muted-foreground tabular-nums">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="py-3 px-4">{log.actorEmail}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-wider">
                          {humanizeStatus(log.action)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{log.targetType}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                        {log.targetId.substring(0, 8)}…
                      </td>
                      <td className="py-3 px-4 text-[11px] max-w-[240px] truncate text-muted-foreground font-mono">
                        {truncatedMeta}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
