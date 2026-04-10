import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const senderTypeEnum = pgEnum("sender_type", ["resident", "staff"]);

export const ticketMessagesTable = pgTable("ticket_messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  ticketId: text("ticket_id").notNull(),
  senderId: text("sender_id").notNull(),
  senderType: senderTypeEnum("sender_type").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTicketMessageSchema = createInsertSchema(ticketMessagesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertTicketMessage = z.infer<typeof insertTicketMessageSchema>;
export type TicketMessage = typeof ticketMessagesTable.$inferSelect;
