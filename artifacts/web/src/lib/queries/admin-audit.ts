import { db } from "@/lib/db";
import { auditLogsTable } from "@workspace/db/schema";
import { eq, desc, gte, lte, and } from "drizzle-orm";
import type { AuditLog } from "@workspace/db/schema";
import type { SQL } from "drizzle-orm";

export async function getAuditLogs(
  actionFilter?: string,
  dateFrom?: string,
  dateTo?: string
): Promise<AuditLog[]> {
  const conditions: SQL[] = [];

  if (actionFilter) {
    conditions.push(eq(auditLogsTable.action, actionFilter as typeof auditLogsTable.action.enumValues[number]));
  }

  if (dateFrom) {
    conditions.push(gte(auditLogsTable.createdAt, new Date(dateFrom)));
  }

  if (dateTo) {
    // Include the entire end date by adding a day
    const endDate = new Date(dateTo);
    endDate.setDate(endDate.getDate() + 1);
    conditions.push(lte(auditLogsTable.createdAt, endDate));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return db
    .select()
    .from(auditLogsTable)
    .where(whereClause)
    .orderBy(desc(auditLogsTable.createdAt))
    .limit(100);
}
