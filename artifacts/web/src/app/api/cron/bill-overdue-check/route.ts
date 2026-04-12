import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invoicesTable } from "@workspace/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { notifyBillOverdue } from "@/lib/notifications";

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true; // local dev — no secret configured
  const headerSecret = request.headers.get("x-cron-secret");
  if (headerSecret && headerSecret === cronSecret) return true;
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader === `Bearer ${cronSecret}`) return true;
  return false;
}

async function runOverdueCheck(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const force = request.nextUrl.searchParams.get("force") === "true";

  // due_date column is stored as text (legacy schema) — cast to date for comparison
  const conditions = [eq(invoicesTable.status, "unpaid")];

  if (force) {
    // All overdue: dueDate < today
    conditions.push(sql`${invoicesTable.dueDate}::date < current_date`);
  } else {
    // Only newly overdue: dueDate was yesterday
    conditions.push(sql`${invoicesTable.dueDate}::date = current_date - interval '1 day'`);
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
      await notifyBillOverdue(invoice.userId, invoice.invoiceNumber, Number(invoice.totalAmount));
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

export async function GET(request: NextRequest) {
  return runOverdueCheck(request);
}

export async function POST(request: NextRequest) {
  return runOverdueCheck(request);
}
