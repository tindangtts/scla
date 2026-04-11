import { db } from "@/lib/db";
import { usersTable, walletTransactionsTable } from "@workspace/db/schema";
import { eq, ilike, or, desc, sql } from "drizzle-orm";
import type { User, WalletTransaction } from "@workspace/db/schema";

export async function searchResidents(search?: string): Promise<User[]> {
  let query = db
    .select()
    .from(usersTable)
    .where(eq(usersTable.userType, "resident"))
    .$dynamic();

  if (search) {
    query = query.where(
      or(
        ilike(usersTable.name, `%${search}%`),
        ilike(usersTable.email, `%${search}%`)
      )
    );
  }

  return query.orderBy(usersTable.name);
}

export async function getResidentWalletDetail(userId: string): Promise<{
  user: User | null;
  balance: string;
  recentTransactions: WalletTransaction[];
}> {
  const userRows = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  const user = userRows[0] ?? null;

  if (!user) {
    return { user: null, balance: "0", recentTransactions: [] };
  }

  const [balanceResult] = await db
    .select({
      balance: sql<string>`coalesce(sum(case when ${walletTransactionsTable.type} = 'credit' then ${walletTransactionsTable.amount} else -${walletTransactionsTable.amount} end), 0)::text`,
    })
    .from(walletTransactionsTable)
    .where(eq(walletTransactionsTable.userId, userId));

  const balance = balanceResult?.balance ?? "0";

  const recentTransactions = await db
    .select()
    .from(walletTransactionsTable)
    .where(eq(walletTransactionsTable.userId, userId))
    .orderBy(desc(walletTransactionsTable.createdAt))
    .limit(20);

  return { user, balance, recentTransactions };
}
