import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { getBills } from "@/lib/queries/bills";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_FILTERS = [
  { label: "All", value: undefined, href: "/bills" },
  { label: "Unpaid", value: "unpaid", href: "/bills?status=unpaid" },
  { label: "Paid", value: "paid", href: "/bills?status=paid" },
  { label: "Overdue", value: "overdue", href: "/bills?status=overdue" },
];

function formatMMK(amount: string | number) {
  return Number(amount).toLocaleString() + " MMK";
}

function statusVariant(status: string) {
  switch (status) {
    case "unpaid":
      return "destructive" as const;
    case "paid":
      return "default" as const;
    case "partially_paid":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
}

export default async function BillsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireAuth();
  const { status } = await searchParams;

  const dbUsers = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, user.email!))
    .limit(1);

  const dbUser = dbUsers[0];
  if (!dbUser) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground">User account not found.</p>
      </div>
    );
  }

  const bills = await getBills(dbUser.id, status);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Bills & Invoices</h2>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((filter) => (
          <Link key={filter.label} href={filter.href}>
            <Badge
              variant={(status ?? undefined) === filter.value ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap"
            >
              {filter.label}
            </Badge>
          </Link>
        ))}
      </div>

      {/* Bills List */}
      {bills.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No bills found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bills.map((bill) => (
            <Link key={bill.id} href={`/bills/${bill.id}`}>
              <Card className="hover:bg-muted/50 transition-colors mb-3">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{bill.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {bill.category} - {bill.month}
                      </p>
                    </div>
                    <Badge variant={statusVariant(bill.status)}>
                      {bill.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm font-semibold">{formatMMK(bill.totalAmount)}</p>
                    {Number(bill.paidAmount) > 0 && bill.status !== "paid" && (
                      <p className="text-xs text-muted-foreground">
                        Paid: {formatMMK(bill.paidAmount)}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
