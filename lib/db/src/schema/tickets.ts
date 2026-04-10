import { pgTable, text, timestamp, pgEnum, json, pgSequence } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ticketNumberSeq = pgSequence("ticket_number_seq", {
  startWith: 1,
  increment: 1,
  minValue: 1,
  maxValue: 9999,
  cycle: false,
});

export const ticketCategoryEnum = pgEnum("ticket_category", [
  "electricals", "plumbing", "housekeeping", "general_enquiry",
  "air_conditioning", "pest_control", "civil_works", "other"
]);
export const ticketStatusEnum = pgEnum("ticket_status", ["open", "in_progress", "completed", "closed"]);

export const ticketsTable = pgTable("tickets", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  ticketNumber: text("ticket_number").notNull(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  category: ticketCategoryEnum("category").notNull(),
  serviceType: text("service_type").notNull(),
  status: ticketStatusEnum("status").notNull().default("open"),
  unitNumber: text("unit_number"),
  description: text("description").notNull(),
  attachmentUrl: text("attachment_url"),
  assignedTo: text("assigned_to"),
  updates: json("updates").notNull().$type<Array<{
    id: string;
    message: string;
    author: string;
    authorType: "resident" | "staff";
    createdAt: string;
  }>>().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTicketSchema = createInsertSchema(ticketsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof ticketsTable.$inferSelect;
