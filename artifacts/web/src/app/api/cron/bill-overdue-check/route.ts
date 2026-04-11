import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invoicesTable } from "@workspace/db/schema";
import { eq, and, lt, sql } from "drizzle-orm";
import { notifyBillOverdue } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  // Auth check: if CRON_SECRET is configured, require matching header
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.get("x-cron-secret") !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const force = request.nextUrl.searchParams.get("force") === "true";

  // Find overdue invoices
  const conditions = [eq(invoicesTable.status, "unpaid")];

  if (force) {
    // All overdue: dueDate < today
    conditions.push(lt(invoicesTable.dueDate, sql`current_date`));
  } else {
    // Only newly overdue: dueDate was yesterday
    conditions.push(
      sql`${invoicesTable.dueDate} = current_date - interval '1 day'`
    );
  }

  const overdueInvoices = await db
    .select({
      id: invoicesTable.id,
      userId: invoicesTable.userId,
      invoiceNumber: invoicesTable.invoiceNumber,
      totalAmount: invoicesTable.totalAmount,
    })
    .from(invoicesTable)
    .where(and(...conditions));

  let processed = 0;
  let errors = 0;

  for (const invoice of overdueInvoices) {
    try {
      await notifyBillOverdue(
        invoice.userId,
        invoice.invoiceNumber,
        Number(invoice.totalAmount)
      );
      processed++;
    } catch {
      errors++;
    }
  }

  return NextResponse.json({
    processed,
    errors,
    total: overdueInvoices.length,
  });
}
