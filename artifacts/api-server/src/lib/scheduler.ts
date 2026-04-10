import { db } from "@workspace/db";
import { invoicesTable } from "@workspace/db";
import { and, lt, or, eq } from "drizzle-orm";
import { sendBillOverdueEmail } from "./email-service.js";
import { sendPushToUser } from "./push-service.js";
import { logger } from "./logger.js";

const INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

async function checkBillOverdue(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  const overdueInvoices = await db
    .select()
    .from(invoicesTable)
    .where(
      and(
        lt(invoicesTable.dueDate, today),
        or(
          eq(invoicesTable.status, "unpaid"),
          eq(invoicesTable.status, "partially_paid")
        )
      )
    );

  if (overdueInvoices.length === 0) {
    logger.info("Scheduler: no overdue invoices found");
    return;
  }

  logger.info({ count: overdueInvoices.length }, "Scheduler: processing overdue invoices");

  await Promise.allSettled(
    overdueInvoices.map(async (invoice) => {
      const amountDue = (
        parseFloat(invoice.totalAmount as string) - parseFloat(invoice.paidAmount as string)
      ).toFixed(2);

      await Promise.allSettled([
        sendBillOverdueEmail(invoice.userId, invoice.invoiceNumber, amountDue, invoice.dueDate),
        sendPushToUser(invoice.userId, {
          title: "Invoice Overdue",
          body: `Invoice ${invoice.invoiceNumber} of MMK ${amountDue} is overdue. Please pay now.`,
          url: "/bills",
        }),
      ]);
    })
  );

  logger.info({ count: overdueInvoices.length }, "Scheduler: overdue invoice notifications sent");
}

export function startScheduler(): void {
  // Run immediately on startup (non-blocking)
  checkBillOverdue().catch((err) =>
    logger.error({ err }, "Scheduler: startup bill-overdue check failed")
  );

  // Repeat every 24 hours
  setInterval(() => {
    checkBillOverdue().catch((err) =>
      logger.error({ err }, "Scheduler: periodic bill-overdue check failed")
    );
  }, INTERVAL_MS);

  logger.info({ intervalMs: INTERVAL_MS }, "Scheduler: bill-overdue job started");
}
