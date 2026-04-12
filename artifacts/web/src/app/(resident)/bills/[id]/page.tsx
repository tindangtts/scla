import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { getBillById } from "@/lib/queries/bills";
import { notFound } from "next/navigation";
import { AppSubHeader } from "@/components/layout/app-header";
import { PayButton } from "./pay-button";
import { formatMMK, formatDate, humanizeStatus, statusBadgeClass } from "@/lib/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const { id } = await params;

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

  const bill = await getBillById(id, dbUser.id);
  if (!bill) notFound();

  const remainingAmount = Number(bill.totalAmount) - Number(bill.paidAmount);
  const lineItems = bill.lineItems ?? [];
  const isPaid = bill.status === "paid";

  return (
    <>
      <AppSubHeader title={bill.invoiceNumber} backHref="/bills" backLabel="All bills" />

      <div className="px-5 -mt-6 pb-8 relative z-20 space-y-4">
        {/* Hero amount + status */}
        <div className="rounded-2xl bg-card border border-card-border p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {isPaid ? "Total paid" : "Amount due"}
              </p>
              <p className="text-3xl font-extrabold text-foreground mt-1 tracking-tight tabular-nums">
                {formatMMK(isPaid ? bill.totalAmount : remainingAmount)}
              </p>
              {!isPaid && Number(bill.paidAmount) > 0 ? (
                <p className="text-xs text-muted-foreground mt-1 tabular-nums">
                  {formatMMK(bill.paidAmount)} of {formatMMK(bill.totalAmount)} paid
                </p>
              ) : null}
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

          <dl className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-border">
            <DetailItem label="Category" value={bill.category.replace(/_/g, " ")} capitalize />
            <DetailItem label="Month" value={bill.month} />
            <DetailItem label="Issue date" value={formatDate(bill.issueDate)} />
            <DetailItem label="Due date" value={formatDate(bill.dueDate)} />
          </dl>

          {bill.description ? (
            <div className="pt-4 mt-4 border-t border-border">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Description
              </p>
              <p className="text-sm text-foreground leading-relaxed">{bill.description}</p>
            </div>
          ) : null}
        </div>

        {/* Line items */}
        <div className="rounded-2xl bg-card border border-card-border shadow-sm overflow-hidden">
          <div className="px-5 pt-4 pb-3 border-b border-border">
            <h2 className="text-sm font-bold tracking-tight">Line items</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/40">
                  <th className="px-5 py-2 font-bold">Description</th>
                  <th className="px-2 py-2 font-bold text-right">Qty</th>
                  <th className="px-2 py-2 font-bold text-right">Unit</th>
                  <th className="px-5 py-2 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item) => (
                  <tr key={item.id} className="border-t border-border">
                    <td className="px-5 py-3 font-medium text-foreground">{item.description}</td>
                    <td className="px-2 py-3 text-right text-muted-foreground tabular-nums">{item.quantity}</td>
                    <td className="px-2 py-3 text-right text-muted-foreground tabular-nums">
                      {formatMMK(item.unitPrice)}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">
                      {formatMMK(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/40">
                <tr className="border-t border-border">
                  <td colSpan={3} className="px-5 py-2 text-right font-bold">
                    Total
                  </td>
                  <td className="px-5 py-2 text-right font-extrabold tabular-nums">
                    {formatMMK(bill.totalAmount)}
                  </td>
                </tr>
                {Number(bill.paidAmount) > 0 ? (
                  <>
                    <tr>
                      <td colSpan={3} className="px-5 py-1 text-right text-xs text-muted-foreground">
                        Paid
                      </td>
                      <td className="px-5 py-1 text-right text-xs text-muted-foreground tabular-nums">
                        {formatMMK(bill.paidAmount)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-5 py-2 text-right font-bold">
                        Remaining
                      </td>
                      <td className="px-5 py-2 text-right font-extrabold text-destructive tabular-nums">
                        {formatMMK(remainingAmount)}
                      </td>
                    </tr>
                  </>
                ) : null}
              </tfoot>
            </table>
          </div>
        </div>

        {/* Pay button */}
        {!isPaid ? <PayButton invoiceId={bill.id} amount={formatMMK(remainingAmount)} /> : null}
      </div>
    </>
  );
}

function DetailItem({
  label,
  value,
  capitalize,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className={cn("mt-0.5 font-semibold text-foreground", capitalize && "capitalize")}>{value}</dd>
    </div>
  );
}
