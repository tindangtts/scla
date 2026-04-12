import { pgTable, text, timestamp, pgEnum, uuid, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { ticketsTable } from "./tickets";

export const senderTypeEnum = pgEnum("sender_type", ["resident", "staff"]);

export const ticketMessagesTable = pgTable(
  "ticket_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ticketId: uuid("ticket_id")
      .notNull()
      .references(() => ticketsTable.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id").notNull(),
    senderType: senderTypeEnum("sender_type").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_ticket_messages_ticket_id").on(table.ticketId),
    index("idx_ticket_messages_sender_id").on(table.senderId),
    index("idx_ticket_messages_ticket_created").on(table.ticketId, table.createdAt),
  ],
);

export const insertTicketMessageSchema = createInsertSchema(ticketMessagesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertTicketMessage = z.infer<typeof insertTicketMessageSchema>;
export type TicketMessage = typeof ticketMessagesTable.$inferSelect;
