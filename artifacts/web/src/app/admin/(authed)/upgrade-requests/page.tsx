import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { upgradeRequestsTable } from "@workspace/db/schema";
import { desc } from "drizzle-orm";
import { AdminPageHeader } from "@/components/layout/admin-page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { approveUpgrade, rejectUpgrade } from "./actions";
import { formatDate } from "@/lib/format";
import { ShieldCheck, Check, X, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_META: Record<string, { label: string; tint: string }> = {
  pending: { label: "Pending", tint: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  approved: { label: "Approved", tint: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  rejected: { label: "Rejected", tint: "bg-destructive/10 text-destructive" },
};

export default async function UpgradeRequestsPage() {
  await requireAdmin();

  const requests = await db
    .select()
    .from(upgradeRequestsTable)
    .orderBy(desc(upgradeRequestsTable.submittedAt));

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div>
      <AdminPageHeader
        title="Upgrade requests"
        description={`${pendingCount} pending · ${requests.length} total`}
        action={
          pendingCount > 0 ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              {pendingCount} need review
            </span>
          ) : null
        }
      />

      {requests.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No upgrade requests yet"
          description="Residents will appear here when they submit unit verification."
        />
      ) : (
        <ul className="space-y-3">
          {requests.map((request) => {
            const meta = STATUS_META[request.status] ?? {
              label: request.status,
              tint: "bg-secondary text-secondary-foreground",
            };
            return (
              <li
                key={request.id}
                className="rounded-2xl bg-card border border-card-border p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-base font-extrabold tracking-tight">{request.userName}</p>
                    <p className="text-xs text-muted-foreground font-medium">{request.userEmail}</p>
                  </div>
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0",
                      meta.tint,
                    )}
                  >
                    {meta.label}
                  </span>
                </div>

                <dl className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-border text-sm">
                  <DetailCell label="Unit" value={request.unitNumber} />
                  <DetailCell label="Resident ID" value={request.residentId} />
                  <DetailCell label="Development" value={request.developmentName} />
                  <DetailCell label="Submitted" value={formatDate(request.submittedAt)} />
                  {request.reviewedAt ? (
                    <DetailCell label="Reviewed" value={formatDate(request.reviewedAt)} />
                  ) : null}
                </dl>

                {request.status === "pending" ? (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                    <form action={approveUpgrade}>
                      <input type="hidden" name="requestId" value={request.id} />
                      <Button type="submit" size="sm" className="font-bold">
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        Approve
                      </Button>
                    </form>
                    <form action={rejectUpgrade}>
                      <input type="hidden" name="requestId" value={request.id} />
                      <Button type="submit" size="sm" variant="destructive" className="font-bold">
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                        Reject
                      </Button>
                    </form>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm font-semibold text-foreground truncate">{value}</dd>
    </div>
  );
}
