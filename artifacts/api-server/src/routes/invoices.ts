import { Router } from "express";
import { db } from "@workspace/db";
import { invoicesTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import * as jwt from "../lib/jwt.js";

const router = Router();

function requireResident(req: any, res: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.slice(7);
  return jwt.verify(token);
}

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

router.get("/summary", async (req, res) => {
  const payload = requireResident(req, res);
  if (!payload) return res.status(401).json({ error: "unauthorized", message: "Authentication required" });

  const invoices = await db.select().from(invoicesTable).where(eq(invoicesTable.userId, payload.userId));
  const unpaid = invoices.filter(i => i.status === "unpaid");
  const partial = invoices.filter(i => i.status === "partially_paid");

  const totalOutstanding = [...unpaid, ...partial].reduce((sum, i) => {
    return sum + parseFloat(i.totalAmount as string) - parseFloat(i.paidAmount as string);
  }, 0);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const thisMonth = invoices.filter(i => i.month === currentMonth);
  const totalThisMonth = thisMonth.reduce((sum, i) => sum + parseFloat(i.totalAmount as string), 0);

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

router.get("/", async (req, res) => {
  const payload = requireResident(req, res);
  if (!payload) return res.status(401).json({ error: "unauthorized", message: "Authentication required" });

  const { status, month } = req.query as { status?: string; month?: string };

  let invoices = await db.select().from(invoicesTable)
    .where(eq(invoicesTable.userId, payload.userId))
    .orderBy(desc(invoicesTable.dueDate));

  if (status) invoices = invoices.filter(i => i.status === status);
  if (month) invoices = invoices.filter(i => i.month === month);

  return res.json(invoices.map(mapInvoice));
});

router.get("/:id", async (req, res) => {
  const payload = requireResident(req, res);
  if (!payload) return res.status(401).json({ error: "unauthorized", message: "Authentication required" });

  const [invoice] = await db.select().from(invoicesTable)
    .where(and(eq(invoicesTable.id, req.params.id), eq(invoicesTable.userId, payload.userId)))
    .limit(1);

  if (!invoice) return res.status(404).json({ error: "not_found", message: "Invoice not found" });
  return res.json(mapInvoice(invoice));
});

router.post("/:id/pay", async (req, res) => {
  const payload = requireResident(req, res);
  if (!payload) return res.status(401).json({ error: "unauthorized", message: "Authentication required" });

  const { paymentMethod, invoiceIds } = req.body;
  if (!paymentMethod || !invoiceIds?.length) {
    return res.status(400).json({ error: "validation_error", message: "Payment method and invoice IDs required" });
  }

  const invoices = await db.select().from(invoicesTable)
    .where(eq(invoicesTable.userId, payload.userId));

  const selectedInvoices = invoices.filter(i => invoiceIds.includes(i.id));
  const totalAmount = selectedInvoices.reduce((sum, i) =>
    sum + parseFloat(i.totalAmount as string) - parseFloat(i.paidAmount as string), 0);

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
