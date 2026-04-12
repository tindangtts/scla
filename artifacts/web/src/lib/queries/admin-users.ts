import { db } from "@/lib/db";
import { usersTable, walletTransactionsTable } from "@workspace/db/schema";
import { eq, sql, ilike, or, desc } from "drizzle-orm";
import type { User } from "@workspace/db/schema";

export async function getUsers(search?: string, roleFilter?: string): Promise<User[]> {
  let query = db.select().from(usersTable).$dynamic();

  const conditions = [];

  if (search) {
    conditions.push(
      or(ilike(usersTable.name, `%${search}%`), ilike(usersTable.email, `%${search}%`))!,
    );
  }

  if (roleFilter && (roleFilter === "guest" || roleFilter === "resident")) {
    conditions.push(eq(usersTable.userType, roleFilter));
  }

  if (conditions.length === 1) {
    query = query.where(conditions[0]);
  } else if (conditions.length === 2) {
    query = query.where(sql`${conditions[0]} AND ${conditions[1]}`);
  }

  return query.orderBy(desc(usersTable.createdAt));
}

export async function getUserById(id: string): Promise<User | null> {
  const rows = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);

  return rows[0] ?? null;
}

export async function getUserWalletBalance(userId: string): Promise<string> {
  const [result] = await db
    .select({
      balance: sql<string>`coalesce(sum(case when ${walletTransactionsTable.type} = 'credit' then ${walletTransactionsTable.amount} else -${walletTransactionsTable.amount} end), 0)::text`,
    })
    .from(walletTransactionsTable)
    .where(eq(walletTransactionsTable.userId, userId));

  return result?.balance ?? "0";
}
