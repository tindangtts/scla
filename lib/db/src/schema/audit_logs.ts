import { pgTable, text, timestamp, pgEnum, json, uuid, index } from "drizzle-orm/pg-core";
import { staffUsersTable } from "./staff_users";

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
  id: uuid("id").defaultRandom().primaryKey(),
  actorId: uuid("actor_id").notNull().references(() => staffUsersTable.id, { onDelete: "restrict" }),
  actorEmail: text("actor_email").notNull(),
  action: auditActionEnum("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: uuid("target_id").notNull(),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_audit_logs_actor_id").on(table.actorId),
  index("idx_audit_logs_action").on(table.action),
  index("idx_audit_logs_target").on(table.targetType, table.targetId),
  index("idx_audit_logs_created_at").on(table.createdAt),
]);

export type AuditLog = typeof auditLogsTable.$inferSelect;
export type InsertAuditLog = typeof auditLogsTable.$inferInsert;
