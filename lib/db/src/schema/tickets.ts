import {
  pgTable,
  text,
  timestamp,
  pgEnum,
  pgSequence,
  uuid,
  index,
  json,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { staffUsersTable } from "./staff_users";

export const ticketNumberSeq = pgSequence("ticket_number_seq", {
  startWith: 1,
  increment: 1,
  minValue: 1,
  maxValue: 999999,
  cycle: true,
});

export const ticketCategoryEnum = pgEnum("ticket_category", [
  "electricals",
  "plumbing",
  "housekeeping",
  "general_enquiry",
  "air_conditioning",
  "pest_control",
  "civil_works",
  "other",
]);
export const ticketStatusEnum = pgEnum("ticket_status", [
  "open",
  "in_progress",
  "completed",
  "closed",
]);

export const ticketsTable = pgTable(
  "tickets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ticketNumber: text("ticket_number").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    category: ticketCategoryEnum("category").notNull(),
    serviceType: text("service_type").notNull(),
    status: ticketStatusEnum("status").notNull().default("open"),
    unitNumber: text("unit_number"),
    description: text("description").notNull(),
    attachmentUrl: text("attachment_url"),
    assignedTo: uuid("assigned_to").references(() => staffUsersTable.id, { onDelete: "set null" }),
    // Deprecated: migrate to ticket_messages table, then remove this column
    updates: json("updates")
      .notNull()
      .$type<
        Array<{
          id: string;
          message: string;
          author: string;
          authorType: "resident" | "staff";
          createdAt: string;
        }>
      >()
      .default([]),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_tickets_user_id").on(table.userId),
    index("idx_tickets_status").on(table.status),
    index("idx_tickets_assigned_to").on(table.assignedTo),
    index("idx_tickets_category").on(table.category),
    index("idx_tickets_user_status").on(table.userId, table.status),
  ],
);

export const insertTicketSchema = createInsertSchema(ticketsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof ticketsTable.$inferSelect;
