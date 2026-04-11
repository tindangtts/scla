import { pgTable, text, timestamp, pgEnum, json } from "drizzle-orm/pg-core";

export const auditActionEnum = pgEnum("audit_action", [
  "upgrade_approve",
  "upgrade_reject",
  "booking_cancel",
  "staff_create",
  "staff_deactivate",
  "staff_update",
  "content_create",
  "content_update",
  "content_delete",
  "wallet_adjust",
]);

export const auditLogsTable = pgTable("audit_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  actorId: text("actor_id").notNull(),
  actorEmail: text("actor_email").notNull(),
  action: auditActionEnum("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type AuditLog = typeof auditLogsTable.$inferSelect;
export type InsertAuditLog = typeof auditLogsTable.$inferInsert;
