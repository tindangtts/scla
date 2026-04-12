import { pgTable, text, timestamp, pgEnum, uuid, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const upgradeRequestStatusEnum = pgEnum("upgrade_request_status", [
  "pending",
  "approved",
  "rejected",
]);

export const upgradeRequestsTable = pgTable(
  "upgrade_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    userName: text("user_name").notNull(),
    userEmail: text("user_email").notNull(),
    unitNumber: text("unit_number").notNull(),
    residentId: text("resident_id").notNull(),
    developmentName: text("development_name").notNull(),
    status: upgradeRequestStatusEnum("status").notNull().default("pending"),
    submittedAt: timestamp("submitted_at").notNull().defaultNow(),
    reviewedAt: timestamp("reviewed_at"),
    reviewNote: text("review_note"),
  },
  (table) => [
    index("idx_upgrade_requests_user_id").on(table.userId),
    index("idx_upgrade_requests_status").on(table.status),
  ],
);

export const insertUpgradeRequestSchema = createInsertSchema(upgradeRequestsTable).omit({
  id: true,
  submittedAt: true,
});

export type InsertUpgradeRequest = z.infer<typeof insertUpgradeRequestSchema>;
export type UpgradeRequest = typeof upgradeRequestsTable.$inferSelect;
