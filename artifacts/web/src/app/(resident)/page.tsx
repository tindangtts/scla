import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { getDashboardData } from "@/lib/queries/dashboard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatMMK(amount: string | number) {
  return Number(amount).toLocaleString() + " MMK";
}

export default async function ResidentHomePage() {
  const user = await requireAuth();

  const dbUsers = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, user.email!))
    .limit(1);

  const dbUser = dbUsers[0];

  if (!dbUser) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              User account not found. Please contact support.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Guest user: show upgrade prompt
  if (dbUser.userType === "guest") {
    return (
      <div className="p-4 space-y-4">
        <h2 className="text-2xl font-bold">Welcome to Star City Living</h2>

        <Card>
          <CardHeader>
            <CardTitle>Community Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">
              You are browsing as a guest. Upgrade to a verified resident to
              access bills, wallet, maintenance tickets, and more.
            </p>
            <Link
              href="/upgrade"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Upgrade to Resident
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Resident user: show full dashboard
  const data = await getDashboardData(dbUser.id);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">
        Welcome, {dbUser.name.split(" ")[0]}
      </h2>

      {/* Wallet Balance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Wallet Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatMMK(data.walletBalance)}</p>
          <Link
            href="/wallet"
            className="text-sm text-blue-600 hover:underline mt-1 inline-block"
          >
            View Wallet
          </Link>
        </CardContent>
      </Card>

      {/* Unpaid Bills */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Unpaid Bills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {data.unpaidBillsCount}{" "}
            <span className="text-base font-normal text-muted-foreground">
              bill{data.unpaidBillsCount !== 1 ? "s" : ""}
            </span>
          </p>
          {data.unpaidBillsCount > 0 && (
            <p className="text-sm text-muted-foreground">
              Total: {formatMMK(data.unpaidBillsTotal)}
            </p>
          )}
          <Link
            href="/bills?status=unpaid"
            className="text-sm text-blue-600 hover:underline mt-1 inline-block"
          >
            View Unpaid Bills
          </Link>
        </CardContent>
      </Card>

      {/* Recent Tickets */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Recent Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentTickets.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent tickets</p>
          ) : (
            <ul className="space-y-2">
              {data.recentTickets.map((ticket) => (
                <li key={ticket.id}>
                  <Link
                    href={`/star-assist/${ticket.id}`}
                    className="flex items-center justify-between hover:bg-muted/50 rounded p-2 -mx-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{ticket.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {ticket.ticketNumber}
                      </p>
                    </div>
                    <Badge
                      variant={
                        ticket.status === "open"
                          ? "destructive"
                          : ticket.status === "completed"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {ticket.status.replace("_", " ")}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <Link
          href="/bills"
          className="flex flex-col items-center gap-1 p-3 bg-white border rounded-lg text-center hover:bg-muted/50"
        >
          <span className="text-sm font-medium">Pay Bills</span>
        </Link>
        <Link
          href="/star-assist"
          className="flex flex-col items-center gap-1 p-3 bg-white border rounded-lg text-center hover:bg-muted/50"
        >
          <span className="text-sm font-medium">New Ticket</span>
        </Link>
        <Link
          href="/wallet"
          className="flex flex-col items-center gap-1 p-3 bg-white border rounded-lg text-center hover:bg-muted/50"
        >
          <span className="text-sm font-medium">View Wallet</span>
        </Link>
      </div>
    </div>
  );
}
