import { db } from "@/lib/db";
import { walletTransactionsTable } from "@workspace/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function getWalletBalance(userId: string): Promise<string> {
  const result = await db
    .select({
      balance: sql<string>`coalesce(sum(case when ${walletTransactionsTable.type} = 'credit' then ${walletTransactionsTable.amount} else -${walletTransactionsTable.amount} end), 0)::text`,
    })
    .from(walletTransactionsTable)
    .where(eq(walletTransactionsTable.userId, userId));

  return result[0]?.balance ?? "0";
}

export async function getWalletTransactions(userId: string) {
  return db
    .select()
    .from(walletTransactionsTable)
    .where(eq(walletTransactionsTable.userId, userId))
    .orderBy(desc(walletTransactionsTable.createdAt));
}
