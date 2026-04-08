import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, formatDate } from "@/lib/api";
import { AdminLayout } from "@/components/layout/admin-layout";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface UpgradeRequest {
  id: string; userId: string; userName: string; userEmail: string;
  unitNumber: string; residentId: string; developmentName: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string; reviewedAt: string | null; reviewNote: string | null;
}

const tabs = ["pending", "approved", "rejected"] as const;

export default function UpgradeRequestsPage() {
  const [tab, setTab] = useState<typeof tabs[number]>("pending");
  const [rejectNote, setRejectNote] = useState<Record<string, string>>({});
  const [rejectOpen, setRejectOpen] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-upgrade-requests", tab],
    queryFn: () => apiRequest<UpgradeRequest[]>("GET", `/admin/upgrade-requests?status=${tab}`),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, action, reviewNote }: { id: string; action: string; reviewNote?: string }) =>
      apiRequest("PATCH", `/admin/upgrade-requests/${id}`, { action, reviewNote }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-upgrade-requests"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
      setRejectOpen(null);
    },
  });

  const tabCounts = { pending: 0, approved: 0, rejected: 0 };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Upgrade Requests</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Resident verification queue</p>
      </div>

      <div className="flex gap-1 mb-4 bg-muted/40 p-1 rounded-lg w-fit">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${tab === t ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">Loading...</div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Clock className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">No {tab} requests</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">User</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Unit Number</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Resident ID</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Development</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Submitted</th>
                  {tab === "pending" && <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Actions</th>}
                  {tab !== "pending" && <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Review Note</th>}
                </tr>
              </thead>
              <tbody>
                {data.map(req => (
                  <tr key={req.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 px-4">
                      <p className="font-medium text-foreground">{req.userName}</p>
                      <p className="text-xs text-muted-foreground">{req.userEmail}</p>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-foreground">{req.unitNumber}</td>
                    <td className="py-3 px-4 font-mono text-xs text-foreground">{req.residentId}</td>
                    <td className="py-3 px-4 text-muted-foreground">{req.developmentName}</td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">{formatDate(req.submittedAt)}</td>
                    {tab === "pending" && (
                      <td className="py-3 px-4">
                        {rejectOpen === req.id ? (
                          <div className="flex flex-col gap-2 min-w-[200px]">
                            <input
                              placeholder="Rejection reason..."
                              value={rejectNote[req.id] ?? ""}
                              onChange={e => setRejectNote(p => ({ ...p, [req.id]: e.target.value }))}
                              className="px-2 py-1 border border-border rounded text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={() => reviewMutation.mutate({ id: req.id, action: "reject", reviewNote: rejectNote[req.id] })}
                                disabled={reviewMutation.isPending}
                                className="flex-1 py-1 bg-destructive text-destructive-foreground rounded text-xs font-medium hover:bg-destructive/90"
                              >Confirm</button>
                              <button onClick={() => setRejectOpen(null)} className="flex-1 py-1 bg-muted text-muted-foreground rounded text-xs">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => reviewMutation.mutate({ id: req.id, action: "approve" })}
                              disabled={reviewMutation.isPending}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-60 transition-colors"
                            >
                              <CheckCircle className="w-3 h-3" /> Approve
                            </button>
                            <button
                              onClick={() => setRejectOpen(req.id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                            >
                              <XCircle className="w-3 h-3" /> Reject
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                    {tab !== "pending" && (
                      <td className="py-3 px-4 text-xs text-muted-foreground">{req.reviewNote ?? "—"}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
