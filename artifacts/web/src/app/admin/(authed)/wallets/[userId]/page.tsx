import { requireAdmin } from "@/lib/auth";
import { getResidentWalletDetail } from "@/lib/queries/admin-wallets";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/layout/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import { formatMMK, formatDateTime } from "@/lib/format";
import { Wallet as WalletIcon, ArrowDownCircle, ArrowUpCircle, Inbox } from "lucide-react";
import { adjustWallet } from "../actions";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function WalletDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await requireAdmin();
  const { userId } = await params;
  const { user, balance, recentTransactions } = await getResidentWalletDetail(userId);
  if (!user) notFound();

  return (
    <div>
      <AdminPageHeader
        title={user.name}
        description={user.email}
        backHref="/admin/wallets"
        backLabel="Wallets"
      />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        {/* Balance + recent txns */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-card border border-card-border p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Current balance
                </p>
                <p className="text-3xl font-extrabold text-foreground mt-1 tracking-tight tabular-nums">
                  {formatMMK(balance)}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <WalletIcon className="w-6 h-6" aria-hidden="true" />
              </div>
            </div>
          </div>

          <section aria-labelledby="tx-heading" className="rounded-2xl bg-card border border-card-border shadow-sm overflow-hidden">
            <div className="px-5 pt-4 pb-3 border-b border-border">
              <h2 id="tx-heading" className="text-sm font-bold tracking-tight">
                Recent transactions
              </h2>
            </div>
            {recentTransactions.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No transactions"
                description="Adjustments will appear here once recorded."
                className="rounded-none border-0 bg-transparent"
              />
            ) : (
              <ul className="divide-y divide-border">
                {recentTransactions.map((tx) => {
                  const isCredit = tx.type === "credit";
                  return (
                    <li
                      key={tx.id}
                      className="px-5 py-3.5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
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
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">
                            {tx.description}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-medium tabular-nums">
                            {formatDateTime(tx.createdAt)}
                            {tx.reason ? ` · ${tx.reason}` : ""}
                          </p>
                        </div>
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

        {/* Adjustment form */}
        <form
          action={adjustWallet}
          className="rounded-2xl bg-card border border-card-border p-6 shadow-sm space-y-4 h-fit"
        >
          <div>
            <h3 className="text-sm font-bold tracking-tight">Adjust wallet</h3>
            <p className="text-xs text-muted-foreground mt-1">
              All adjustments are recorded in the audit log.
            </p>
          </div>
          <input type="hidden" name="userId" value={userId} />

          <div className="space-y-1.5">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              name="type"
              required
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            >
              <option value="credit">Credit (add funds)</option>
              <option value="debit">Debit (remove funds)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount (MMK)</Label>
            <Input
              id="amount"
              type="number"
              name="amount"
              required
              step="0.01"
              min="0.01"
              inputMode="decimal"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              type="text"
              name="description"
              required
              placeholder="Monthly allowance, Penalty charge..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reason">Reason (internal note)</Label>
            <Input id="reason" type="text" name="reason" placeholder="Optional" />
          </div>

          <Button type="submit" className="w-full h-11 font-bold">
            Submit adjustment
          </Button>
        </form>
      </div>
    </div>
  );
}
