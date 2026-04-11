import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { upgradeRequestsTable } from "@workspace/db/schema";
import { desc } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { approveUpgrade, rejectUpgrade } from "./actions";

export const dynamic = "force-dynamic";

function statusBadge(status: string) {
  switch (status) {
    case "pending":
      return <Badge variant="default">Pending</Badge>;
    case "approved":
      return (
        <Badge variant="secondary" className="text-green-600">
          Approved
        </Badge>
      );
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default async function UpgradeRequestsPage() {
  await requireAdmin();

  const requests = await db
    .select()
    .from(upgradeRequestsTable)
    .orderBy(desc(upgradeRequestsTable.submittedAt));

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Upgrade Requests</h1>

      {requests.length === 0 && (
        <p className="text-muted-foreground">No upgrade requests yet.</p>
      )}

      {requests.map((request) => (
        <Card key={request.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{request.userName}</CardTitle>
              {statusBadge(request.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div>
                <span className="text-muted-foreground">Email:</span>{" "}
                {request.userEmail}
              </div>
              <div>
                <span className="text-muted-foreground">Unit:</span>{" "}
                {request.unitNumber}
              </div>
              <div>
                <span className="text-muted-foreground">Resident ID:</span>{" "}
                {request.residentId}
              </div>
              <div>
                <span className="text-muted-foreground">Development:</span>{" "}
                {request.developmentName}
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Submitted:</span>{" "}
                {request.submittedAt.toLocaleDateString()}
              </div>
              {request.reviewedAt && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Reviewed:</span>{" "}
                  {request.reviewedAt.toLocaleDateString()}
                </div>
              )}
            </div>

            {request.status === "pending" && (
              <div className="flex gap-2">
                <form action={approveUpgrade}>
                  <input type="hidden" name="requestId" value={request.id} />
                  <Button type="submit" size="sm">
                    Approve
                  </Button>
                </form>
                <form action={rejectUpgrade}>
                  <input type="hidden" name="requestId" value={request.id} />
                  <Button type="submit" size="sm" variant="destructive">
                    Reject
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
