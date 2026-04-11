import { db, auditLogsTable } from "@workspace/db";
import { logger } from "./logger.js";

interface AuditLogParams {
  actorId: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}

export async function auditLog(params: AuditLogParams): Promise<void> {
  const { actorId, actorEmail, action, targetType, targetId, metadata } = params;
  try {
    await db.insert(auditLogsTable).values({
      actorId,
      actorEmail,
      action: action as typeof auditLogsTable.$inferInsert["action"],
      targetType,
      targetId,
      metadata: metadata ?? null,
    });
  } catch (err) {
    logger.error({ err, params }, "Failed to write audit log");
    // Do NOT throw — audit failure must not break the admin operation
  }
}
