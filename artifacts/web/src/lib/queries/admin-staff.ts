import { db } from "@/lib/db";
import { staffUsersTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import type { StaffUser } from "@workspace/db/schema";

export async function getAllStaff(): Promise<StaffUser[]> {
  return db
    .select()
    .from(staffUsersTable)
    .orderBy(desc(staffUsersTable.createdAt));
}

export async function getStaffById(id: string): Promise<StaffUser | null> {
  const rows = await db
    .select()
    .from(staffUsersTable)
    .where(eq(staffUsersTable.id, id))
    .limit(1);

  return rows[0] ?? null;
}
