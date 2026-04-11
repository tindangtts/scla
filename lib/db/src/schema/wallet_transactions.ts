import { pgTable, text, timestamp, numeric, pgEnum } from "drizzle-orm/pg-core";

export const walletTransactionTypeEnum = pgEnum("wallet_transaction_type", ["credit", "debit"]);

export const walletTransactionsTable = pgTable("wallet_transactions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  type: walletTransactionTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  description: text("description").notNull(),
  reference: text("reference"),
  category: text("category").notNull().default("wallet"),
  reason: text("reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type WalletTransaction = typeof walletTransactionsTable.$inferSelect;
export type InsertWalletTransaction = typeof walletTransactionsTable.$inferInsert;
