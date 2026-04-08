import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const upgradeRequestStatusEnum = pgEnum("upgrade_request_status", ["pending", "approved", "rejected"]);

export const upgradeRequestsTable = pgTable("upgrade_requests", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  userEmail: text("user_email").notNull(),
  unitNumber: text("unit_number").notNull(),
  residentId: text("resident_id").notNull(),
  developmentName: text("development_name").notNull(),
  status: upgradeRequestStatusEnum("status").notNull().default("pending"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewNote: text("review_note"),
});

export const insertUpgradeRequestSchema = createInsertSchema(upgradeRequestsTable).omit({
  id: true,
  submittedAt: true,
});

export type InsertUpgradeRequest = z.infer<typeof insertUpgradeRequestSchema>;
export type UpgradeRequest = typeof upgradeRequestsTable.$inferSelect;
