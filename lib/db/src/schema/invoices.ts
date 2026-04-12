import {
  pgTable,
  text,
  timestamp,
  numeric,
  pgEnum,
  json,
  uuid,
  date,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const invoiceStatusEnum = pgEnum("invoice_status", ["unpaid", "partially_paid", "paid"]);

export const invoicesTable = pgTable(
  "invoices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    invoiceNumber: text("invoice_number").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    unitNumber: text("unit_number").notNull(),
    category: text("category").notNull(),
    description: text("description").notNull(),
    issueDate: date("issue_date").notNull(),
    dueDate: date("due_date").notNull(),
    totalAmount: numeric("total_amount", { precision: 15, scale: 2 }).notNull(),
    paidAmount: numeric("paid_amount", { precision: 15, scale: 2 }).notNull().default("0"),
    status: invoiceStatusEnum("status").notNull().default("unpaid"),
    month: text("month").notNull(),
    lineItems: json("line_items").notNull().$type<
      Array<{
        id: string;
        description: string;
        quantity: number;
        unitPrice: number;
        amount: number;
      }>
    >(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_invoices_user_id").on(table.userId),
    index("idx_invoices_status").on(table.status),
    index("idx_invoices_user_status").on(table.userId, table.status),
    index("idx_invoices_due_date").on(table.dueDate),
    index("idx_invoices_month").on(table.month),
    index("idx_invoices_unit_number").on(table.unitNumber),
  ],
);

export const insertInvoiceSchema = createInsertSchema(invoicesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoicesTable.$inferSelect;
