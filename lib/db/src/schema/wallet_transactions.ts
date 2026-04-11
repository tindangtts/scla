import { pgTable, text, timestamp, numeric, pgEnum, uuid, index } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const walletTransactionTypeEnum = pgEnum("wallet_transaction_type", ["credit", "debit"]);

export const walletTransactionsTable = pgTable("wallet_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  type: walletTransactionTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  description: text("description").notNull(),
  reference: text("reference"),
  category: text("category").notNull().default("wallet"),
  reason: text("reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_wallet_transactions_user_id").on(table.userId),
  index("idx_wallet_transactions_type").on(table.type),
  index("idx_wallet_transactions_user_type").on(table.userId, table.type),
  index("idx_wallet_transactions_created_at").on(table.createdAt),
]);

export type WalletTransaction = typeof walletTransactionsTable.$inferSelect;
export type InsertWalletTransaction = typeof walletTransactionsTable.$inferInsert;
