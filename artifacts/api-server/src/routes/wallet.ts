import { Router } from "express";
import { db } from "@workspace/db";
import { walletTransactionsTable } from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth-middleware.js";
import type { Request } from "express";
import type { usersTable } from "@workspace/db";

type AuthenticatedRequest = Request & { user: typeof usersTable.$inferSelect };

const router = Router();

function computeBalanceSql(category: string) {
  return sql<string>`COALESCE(SUM(CASE WHEN ${walletTransactionsTable.type} = 'credit' THEN ${walletTransactionsTable.amount} ELSE -${walletTransactionsTable.amount} END), 0)`;
}

router.get("/wallet", requireAuth, async (req, res) => {
  const user = (req as AuthenticatedRequest).user;

  const { type, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  // Compute total wallet balance
  const [balanceResult] = await db
    .select({ balance: computeBalanceSql("wallet") })
    .from(walletTransactionsTable)
    .where(and(
      eq(walletTransactionsTable.userId, user.id),
      eq(walletTransactionsTable.category, "wallet")
    ));

  // Build conditions for transaction listing
  const conditions: ReturnType<typeof eq>[] = [
    eq(walletTransactionsTable.userId, user.id),
    eq(walletTransactionsTable.category, "wallet"),
  ];
  if (type === "credit" || type === "debit") {
    conditions.push(eq(walletTransactionsTable.type, type));
  }

  const transactions = await db
    .select()
    .from(walletTransactionsTable)
    .where(and(...conditions))
    .orderBy(desc(walletTransactionsTable.createdAt))
    .limit(limitNum)
    .offset(offset);

  // Count total for pagination
  const allTransactions = await db
    .select({ id: walletTransactionsTable.id })
    .from(walletTransactionsTable)
    .where(and(...conditions));

  return res.json({
    balance: parseFloat(balanceResult.balance),
    transactions: transactions.map(t => ({
      id: t.id,
      type: t.type,
      amount: parseFloat(t.amount as string),
      description: t.description,
      reference: t.reference,
      reason: t.reason,
      createdAt: t.createdAt,
    })),
    total: allTransactions.length,
    page: pageNum,
    limit: limitNum,
  });
});

router.get("/deposit", requireAuth, async (req, res) => {
  const user = (req as AuthenticatedRequest).user;

  const { type, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  // Compute total deposit balance
  const [balanceResult] = await db
    .select({ balance: computeBalanceSql("deposit") })
    .from(walletTransactionsTable)
    .where(and(
      eq(walletTransactionsTable.userId, user.id),
      eq(walletTransactionsTable.category, "deposit")
    ));

  // Build conditions for transaction listing
  const conditions: ReturnType<typeof eq>[] = [
    eq(walletTransactionsTable.userId, user.id),
    eq(walletTransactionsTable.category, "deposit"),
  ];
  if (type === "credit" || type === "debit") {
    conditions.push(eq(walletTransactionsTable.type, type));
  }

  const transactions = await db
    .select()
    .from(walletTransactionsTable)
    .where(and(...conditions))
    .orderBy(desc(walletTransactionsTable.createdAt))
    .limit(limitNum)
    .offset(offset);

  // Count total for pagination
  const allTransactions = await db
    .select({ id: walletTransactionsTable.id })
    .from(walletTransactionsTable)
    .where(and(...conditions));

  return res.json({
    balance: parseFloat(balanceResult.balance),
    transactions: transactions.map(t => ({
      id: t.id,
      type: t.type,
      amount: parseFloat(t.amount as string),
      description: t.description,
      reference: t.reference,
      reason: t.reason,
      createdAt: t.createdAt,
    })),
    total: allTransactions.length,
    page: pageNum,
    limit: limitNum,
  });
});

export default router;
