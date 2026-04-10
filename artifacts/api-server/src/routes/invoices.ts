import { Router } from "express";
import type { Request, Response } from "express";
import { db } from "@workspace/db";
import { invoicesTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth-middleware.js";

const router = Router();

function mapInvoice(i: typeof invoicesTable.$inferSelect) {
  return {
    id: i.id,
    invoiceNumber: i.invoiceNumber,
    unitNumber: i.unitNumber,
    category: i.category,
    description: i.description,
    issueDate: i.issueDate,
    dueDate: i.dueDate,
    totalAmount: parseFloat(i.totalAmount as string),
    paidAmount: parseFloat(i.paidAmount as string),
    status: i.status,
    month: i.month,
    lineItems: i.lineItems ?? [],
  };
}

router.get("/summary", requireAuth, async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;

  const invoices = await db.select().from(invoicesTable).where(eq(invoicesTable.userId, user.id));
  const unpaid = invoices.filter(i => i.status === "unpaid");
  const partial = invoices.filter(i => i.status === "partially_paid");

  const totalOutstandingCents = [...unpaid, ...partial].reduce((sum, i) => {
    return sum + Math.round(parseFloat(i.totalAmount as string) * 100) - Math.round(parseFloat(i.paidAmount as string) * 100);
  }, 0);
  const totalOutstanding = totalOutstandingCents / 100;

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const thisMonth = invoices.filter(i => i.month === currentMonth);
  const totalThisMonthCents = thisMonth.reduce((sum, i) => sum + Math.round(parseFloat(i.totalAmount as string) * 100), 0);
  const totalThisMonth = totalThisMonthCents / 100;

  const paid = invoices.filter(i => i.status === "paid").sort((a, b) =>
    new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
  );

  return res.json({
    totalOutstanding,
    totalThisMonth,
    unpaidCount: unpaid.length,
    partiallyPaidCount: partial.length,
    lastPaymentDate: paid[0]?.dueDate ?? null,
    lastPaymentAmount: paid[0] ? parseFloat(paid[0].totalAmount as string) : null,
  });
});

router.get("/", requireAuth, async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;

  const { status, month } = req.query as { status?: string; month?: string };

  let invoices = await db.select().from(invoicesTable)
    .where(eq(invoicesTable.userId, user.id))
    .orderBy(desc(invoicesTable.dueDate));

  if (status) invoices = invoices.filter(i => i.status === status);
  if (month) invoices = invoices.filter(i => i.month === month);

  return res.json(invoices.map(mapInvoice));
});

router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  const id = req.params.id as string;

  const [invoice] = await db.select().from(invoicesTable)
    .where(and(eq(invoicesTable.id, id), eq(invoicesTable.userId, user.id)))
    .limit(1);

  if (!invoice) return res.status(404).json({ error: "not_found", message: "Invoice not found" });
  return res.json(mapInvoice(invoice));
});

router.post("/:id/pay", requireAuth, async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;

  const { paymentMethod, invoiceIds } = req.body;
  if (!paymentMethod || !invoiceIds?.length) {
    return res.status(400).json({ error: "validation_error", message: "Payment method and invoice IDs required" });
  }

  const invoices = await db.select().from(invoicesTable)
    .where(eq(invoicesTable.userId, user.id));

  const selectedInvoices = invoices.filter(i => invoiceIds.includes(i.id));
  const totalAmountCents = selectedInvoices.reduce((sum, i) =>
    sum + Math.round(parseFloat(i.totalAmount as string) * 100) - Math.round(parseFloat(i.paidAmount as string) * 100), 0);
  const totalAmount = totalAmountCents / 100;

  const sessionId = crypto.randomUUID();
  const redirectUrl = paymentMethod === "wavepay"
    ? `https://wavepay.com/pay?session=${sessionId}&amount=${totalAmount}`
    : `https://kbzpay.com/pay?session=${sessionId}&amount=${totalAmount}`;

  return res.json({
    sessionId,
    paymentMethod,
    totalAmount,
    redirectUrl,
    status: "pending",
  });
});

export default router;
