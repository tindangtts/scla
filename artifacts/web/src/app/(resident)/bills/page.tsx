import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { getBills } from "@/lib/queries/bills";
import { AppHeader } from "@/components/layout/app-header";
import { EmptyState } from "@/components/ui/empty-state";
import { formatMMK, formatDate, humanizeStatus, statusBadgeClass } from "@/lib/format";
import { Receipt, ChevronRight, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_FILTERS: Array<{ label: string; value?: string; href: string }> = [
  { label: "All", href: "/bills" },
  { label: "Unpaid", value: "unpaid", href: "/bills?status=unpaid" },
  { label: "Paid", value: "paid", href: "/bills?status=paid" },
  { label: "Overdue", value: "overdue", href: "/bills?status=overdue" },
];

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
      <div className="p-5">
        <p className="text-muted-foreground">User account not found.</p>
      </div>
    );
  }

  const bills = await getBills(dbUser.id, status);
  const totalDue = bills
    .filter((b) => b.status !== "paid")
    .reduce((acc, b) => acc + (Number(b.totalAmount) - Number(b.paidAmount)), 0);

  return (
    <>
      <AppHeader name="Bills" subtitle={bills.length === 0 ? "No invoices" : `${bills.length} invoice${bills.length === 1 ? "" : "s"}`} />

      <div className="px-5 -mt-8 pb-8 relative z-20 space-y-5">
        {/* Summary card */}
        <div className="rounded-2xl bg-card border border-card-border p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Outstanding balance
              </p>
              <p className="text-2xl font-extrabold text-foreground mt-1 tracking-tight tabular-nums">
                {formatMMK(totalDue)}
              </p>
            </div>
            <div className={cn("p-3 rounded-2xl", totalDue > 0 ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-600")}>
              <Receipt className="w-6 h-6" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div role="tablist" aria-label="Filter bills" className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {STATUS_FILTERS.map((filter) => {
            const isActive = (status ?? undefined) === filter.value;
            return (
              <Link
                key={filter.label}
                href={filter.href}
                role="tab"
                aria-selected={isActive}
                className={cn(
                  "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card border border-card-border text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>

        {/* Bills list */}
        {bills.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No bills found"
            description={status ? "Try clearing the filter to see all your invoices." : "Your invoices will appear here once issued."}
            action={
              status ? (
                <Link
                  href="/bills"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors"
                >
                  Clear filter
                </Link>
              ) : undefined
            }
          />
        ) : (
          <ul className="space-y-2.5">
            {bills.map((bill) => {
              const remaining = Number(bill.totalAmount) - Number(bill.paidAmount);
              const isPaid = bill.status === "paid";
              return (
                <li key={bill.id}>
                  <Link
                    href={`/bills/${bill.id}`}
                    className="block rounded-2xl bg-card border border-card-border p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-[transform,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-foreground tabular-nums truncate">
                          {bill.invoiceNumber}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium capitalize truncate">
                          {bill.category.replace(/_/g, " ")} · {bill.month}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0",
                          statusBadgeClass(bill.status),
                        )}
                      >
                        {humanizeStatus(bill.status)}
                      </span>
                    </div>
                    <div className="flex items-end justify-between gap-2">
                      <div>
                        <p className="text-lg font-extrabold text-foreground tracking-tight tabular-nums">
                          {formatMMK(isPaid ? bill.totalAmount : remaining)}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Due {formatDate(bill.dueDate)}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground self-center" aria-hidden="true" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
