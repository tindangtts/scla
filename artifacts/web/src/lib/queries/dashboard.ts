import { db } from "@/lib/db";
import {
  invoicesTable,
  ticketsTable,
  walletTransactionsTable,
} from "@workspace/db/schema";
import { eq, sql, desc, and } from "drizzle-orm";

export async function getDashboardData(userId: string) {
  // Unpaid bills count and total
  const unpaidBills = await db
    .select({
      count: sql<number>`count(*)::int`,
      total: sql<string>`coalesce(sum(${invoicesTable.totalAmount} - ${invoicesTable.paidAmount}), 0)::text`,
    })
    .from(invoicesTable)
    .where(
      and(eq(invoicesTable.userId, userId), eq(invoicesTable.status, "unpaid"))
    );

  // Recent tickets (last 3)
  const recentTickets = await db
    .select({
      id: ticketsTable.id,
      ticketNumber: ticketsTable.ticketNumber,
      title: ticketsTable.title,
      status: ticketsTable.status,
      createdAt: ticketsTable.createdAt,
    })
    .from(ticketsTable)
    .where(eq(ticketsTable.userId, userId))
    .orderBy(desc(ticketsTable.createdAt))
    .limit(3);

  // Wallet balance
  const balanceResult = await db
    .select({
      balance: sql<string>`coalesce(sum(case when ${walletTransactionsTable.type} = 'credit' then ${walletTransactionsTable.amount} else -${walletTransactionsTable.amount} end), 0)::text`,
    })
    .from(walletTransactionsTable)
    .where(eq(walletTransactionsTable.userId, userId));

  return {
    unpaidBillsCount: unpaidBills[0]?.count ?? 0,
    unpaidBillsTotal: unpaidBills[0]?.total ?? "0",
    recentTickets,
    walletBalance: balanceResult[0]?.balance ?? "0",
  };
}
