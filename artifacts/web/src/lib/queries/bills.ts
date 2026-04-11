import { db } from "@/lib/db";
import { invoicesTable } from "@workspace/db/schema";
import { eq, and, desc, lt, sql } from "drizzle-orm";

export async function getBills(userId: string, status?: string) {
  const conditions = [eq(invoicesTable.userId, userId)];

  if (status === "overdue") {
    conditions.push(eq(invoicesTable.status, "unpaid"));
    conditions.push(
      lt(invoicesTable.dueDate, sql`current_date`)
    );
  } else if (status === "unpaid" || status === "paid" || status === "partially_paid") {
    conditions.push(eq(invoicesTable.status, status));
  }

  return db
    .select()
    .from(invoicesTable)
    .where(and(...conditions))
    .orderBy(desc(invoicesTable.createdAt));
}

export async function getBillById(id: string, userId: string) {
  const results = await db
    .select()
    .from(invoicesTable)
    .where(and(eq(invoicesTable.id, id), eq(invoicesTable.userId, userId)))
    .limit(1);

  return results[0] ?? null;
}
