import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { getBillById } from "@/lib/queries/bills";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PayButton } from "./pay-button";

export const dynamic = "force-dynamic";

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
      <div className="p-4">
        <p className="text-muted-foreground">User account not found.</p>
      </div>
    );
  }

  const bill = await getBillById(id, dbUser.id);
  if (!bill) {
    notFound();
  }

  const remainingAmount = Number(bill.totalAmount) - Number(bill.paidAmount);
  const lineItems = bill.lineItems ?? [];

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Invoice Details</h2>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{bill.invoiceNumber}</CardTitle>
            <Badge variant={statusVariant(bill.status)}>{bill.status.replace("_", " ")}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Category</p>
              <p className="font-medium">{bill.category}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Month</p>
              <p className="font-medium">{bill.month}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Issue Date</p>
              <p className="font-medium">{bill.issueDate}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Due Date</p>
              <p className="font-medium">{bill.dueDate}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="text-sm">{bill.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium">Description</th>
                  <th className="pb-2 font-medium text-right">Qty</th>
                  <th className="pb-2 font-medium text-right">Unit Price</th>
                  <th className="pb-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2">{item.description}</td>
                    <td className="py-2 text-right">{item.quantity}</td>
                    <td className="py-2 text-right">{formatMMK(item.unitPrice)}</td>
                    <td className="py-2 text-right">{formatMMK(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-semibold">
                  <td colSpan={3} className="pt-2 text-right">
                    Total
                  </td>
                  <td className="pt-2 text-right">{formatMMK(bill.totalAmount)}</td>
                </tr>
                {Number(bill.paidAmount) > 0 && (
                  <>
                    <tr className="text-muted-foreground">
                      <td colSpan={3} className="pt-1 text-right">
                        Paid
                      </td>
                      <td className="pt-1 text-right">{formatMMK(bill.paidAmount)}</td>
                    </tr>
                    <tr className="font-semibold">
                      <td colSpan={3} className="pt-1 text-right">
                        Remaining
                      </td>
                      <td className="pt-1 text-right">{formatMMK(remainingAmount)}</td>
                    </tr>
                  </>
                )}
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pay Button */}
      {bill.status !== "paid" && (
        <PayButton invoiceId={bill.id} amount={formatMMK(remainingAmount)} />
      )}
    </div>
  );
}
