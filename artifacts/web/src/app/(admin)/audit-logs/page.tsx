import { requireAdmin } from "@/lib/auth";
import { getAuditLogs } from "@/lib/queries/admin-audit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

function formatAction(action: string): string {
  return action
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

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
    dateTo || undefined
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Audit Logs</h2>

      <form method="GET" className="flex flex-wrap gap-3 mb-6">
        <select
          name="action"
          defaultValue={actionFilter}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <option value="">All Actions</option>
          {AUDIT_ACTIONS.map((a) => (
            <option key={a} value={a}>
              {formatAction(a)}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="dateFrom"
          defaultValue={dateFrom}
          className="px-3 py-2 border rounded-md text-sm"
          placeholder="From"
        />

        <input
          type="date"
          name="dateTo"
          defaultValue={dateTo}
          className="px-3 py-2 border rounded-md text-sm"
          placeholder="To"
        />

        <Button type="submit" size="sm">
          Filter
        </Button>
      </form>

      {logs.length === 0 ? (
        <p className="text-muted-foreground">No audit logs found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 px-3 font-medium">Date</th>
                <th className="py-2 px-3 font-medium">Actor Email</th>
                <th className="py-2 px-3 font-medium">Action</th>
                <th className="py-2 px-3 font-medium">Target Type</th>
                <th className="py-2 px-3 font-medium">Target ID</th>
                <th className="py-2 px-3 font-medium">Metadata</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const metaStr = log.metadata
                  ? JSON.stringify(log.metadata)
                  : "-";
                const truncatedMeta =
                  metaStr.length > 100
                    ? metaStr.substring(0, 100) + "..."
                    : metaStr;

                return (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3 whitespace-nowrap">
                      {log.createdAt.toLocaleString()}
                    </td>
                    <td className="py-2 px-3">{log.actorEmail}</td>
                    <td className="py-2 px-3">
                      <Badge variant="outline">
                        {formatAction(log.action)}
                      </Badge>
                    </td>
                    <td className="py-2 px-3">{log.targetType}</td>
                    <td className="py-2 px-3 font-mono text-xs">
                      {log.targetId.substring(0, 8)}...
                    </td>
                    <td className="py-2 px-3 text-xs max-w-[200px] truncate">
                      {truncatedMeta}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
