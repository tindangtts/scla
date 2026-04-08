import { pgTable, text, timestamp, numeric, pgEnum, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const invoiceStatusEnum = pgEnum("invoice_status", ["unpaid", "partially_paid", "paid"]);

export const invoicesTable = pgTable("invoices", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  invoiceNumber: text("invoice_number").notNull(),
  userId: text("user_id").notNull(),
  unitNumber: text("unit_number").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  issueDate: text("issue_date").notNull(),
  dueDate: text("due_date").notNull(),
  totalAmount: numeric("total_amount", { precision: 15, scale: 2 }).notNull(),
  paidAmount: numeric("paid_amount", { precision: 15, scale: 2 }).notNull().default("0"),
  status: invoiceStatusEnum("status").notNull().default("unpaid"),
  month: text("month").notNull(),
  lineItems: json("line_items").notNull().$type<Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertInvoiceSchema = createInsertSchema(invoicesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoicesTable.$inferSelect;
