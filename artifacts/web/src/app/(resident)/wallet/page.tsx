import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { getWalletBalance, getWalletTransactions } from "@/lib/queries/wallet";
import { AppHeader } from "@/components/layout/app-header";
import { EmptyState } from "@/components/ui/empty-state";
import { formatMMK, formatDate } from "@/lib/format";
import { Wallet as WalletIcon, ArrowDownCircle, ArrowUpCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function WalletPage() {
  const user = await requireAuth();

  const dbUsers = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, user.email!))
    .limit(1);

  const dbUser = dbUsers[0];
  if (!dbUser) {
    return (
      <div className="p-5">
        <p className="text-muted-foreground">User account not found.</p>
      </div>
    );
  }

  const [balance, transactions] = await Promise.all([
    getWalletBalance(dbUser.id),
    getWalletTransactions(dbUser.id),
  ]);

  const credits = transactions.filter((t) => t.type === "credit").reduce((sum, t) => sum + Number(t.amount), 0);
  const debits = transactions.filter((t) => t.type === "debit").reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <>
      <AppHeader name="Wallet" subtitle="Balance and transactions" />

      <div className="px-5 -mt-8 pb-8 relative z-20 space-y-5">
        {/* Balance hero */}
        <div className="rounded-[1.75rem] bg-card border border-card-border p-6 shadow-lg shadow-primary/5">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Current balance
              </p>
              <p className="text-4xl font-extrabold text-foreground mt-1 tracking-tight tabular-nums">
                {formatMMK(balance)}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <WalletIcon className="w-6 h-6" aria-hidden="true" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="rounded-xl border border-border bg-emerald-500/5 px-3 py-2.5">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                <ArrowDownCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <p className="text-[10px] font-bold uppercase tracking-wider">Credits</p>
              </div>
              <p className="text-sm font-extrabold text-foreground mt-1 tabular-nums">
                {formatMMK(credits)}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-destructive/5 px-3 py-2.5">
              <div className="flex items-center gap-1.5 text-destructive">
                <ArrowUpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <p className="text-[10px] font-bold uppercase tracking-wider">Debits</p>
              </div>
              <p className="text-sm font-extrabold text-foreground mt-1 tabular-nums">
                {formatMMK(debits)}
              </p>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <section aria-labelledby="tx-heading" className="space-y-3">
          <div className="flex items-end justify-between">
            <h2 id="tx-heading" className="text-base font-bold tracking-tight">
              Transaction history
            </h2>
            {transactions.length > 0 ? (
              <span className="text-xs font-semibold text-muted-foreground">
                {transactions.length} entr{transactions.length === 1 ? "y" : "ies"}
              </span>
            ) : null}
          </div>

          {transactions.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No transactions yet"
              description="Credits and debits appear here as you top up or pay bills."
            />
          ) : (
            <ul className="rounded-2xl bg-card border border-card-border shadow-sm divide-y divide-border overflow-hidden">
              {transactions.map((tx) => {
                const isCredit = tx.type === "credit";
                return (
                  <li key={tx.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                    <div
                      className={cn(
                        "p-2 rounded-xl shrink-0",
                        isCredit
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-destructive/10 text-destructive",
                      )}
                    >
                      {isCredit ? (
                        <ArrowDownCircle className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <ArrowUpCircle className="w-4 h-4" aria-hidden="true" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">
                        {tx.description}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-medium">
                        {formatDate(tx.createdAt)}
                      </p>
                    </div>
                    <p
                      className={cn(
                        "text-sm font-extrabold tabular-nums shrink-0",
                        isCredit ? "text-emerald-600" : "text-destructive",
                      )}
                    >
                      {isCredit ? "+" : "−"}
                      {formatMMK(tx.amount)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
