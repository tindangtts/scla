import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useGetWallet, getGetWalletQueryKey, useGetDeposit, getGetDepositQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { formatMMK, formatDateTime } from "@/lib/format";
import { ChevronLeft, TrendingUp, TrendingDown, Wallet as WalletIcon, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type TabType = "wallet" | "deposit";
type TypeFilter = "all" | "credit" | "debit";

interface TxWithReason {
  id: string;
  type: string;
  amount: number;
  description: string;
  date: Date | string;
  balance?: number;
  reason?: string;
}

export default function WalletPage() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<TabType>("wallet");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const { data: wallet, isLoading: walletLoading } = useGetWallet({
    query: { queryKey: getGetWalletQueryKey() }
  });

  const { data: deposit, isLoading: depositLoading } = useGetDeposit({
    query: { queryKey: getGetDepositQueryKey() }
  });

  function handleTabChange(tab: TabType) {
    setActiveTab(tab);
    setTypeFilter("all");
  }

  const isLoading = activeTab === "wallet" ? walletLoading : depositLoading;

  const rawTransactions: TxWithReason[] = activeTab === "wallet"
    ? ((wallet?.transactions ?? []) as unknown as TxWithReason[])
    : ((deposit?.transactions ?? []) as unknown as TxWithReason[]);

  const filteredTransactions = typeFilter === "all"
    ? rawTransactions
    : rawTransactions.filter(tx => tx.type === typeFilter);

  return (
    <AppLayout>
      <div className="page-enter bg-slate-50 min-h-full">
        <div className="bg-gradient-teal px-5 pt-14 pb-8 rounded-b-[2.5rem] shadow-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10 flex items-center gap-3 mb-6">
            <button onClick={() => setLocation("/")} className="p-2.5 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors" data-testid="button-back">
              <ChevronLeft className="w-5 h-5 text-primary-foreground" />
            </button>
            <h1 className="text-xl font-extrabold text-primary-foreground tracking-tight">{t("wallet.title")}</h1>
          </div>

          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-[1.5rem] p-5 shadow-inner">
              <div className="flex items-center gap-2 mb-2">
                <WalletIcon className="w-4 h-4 text-accent" />
                <p className="text-primary-foreground/80 text-[11px] font-bold uppercase tracking-wider">Wallet</p>
              </div>
              {walletLoading ? (
                <Skeleton className="h-8 w-28 mt-1 bg-white/20" />
              ) : (
                <p className="text-primary-foreground text-2xl font-black tracking-tight" data-testid="text-wallet-balance">
                  {formatMMK(wallet?.balance ?? 0)}
                </p>
              )}
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-[1.5rem] p-5 shadow-inner">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-primary-foreground/60" />
                <p className="text-primary-foreground/70 text-[11px] font-bold uppercase tracking-wider">Deposit</p>
              </div>
              {depositLoading ? (
                <Skeleton className="h-8 w-28 mt-1 bg-white/10" />
              ) : (
                <p className="text-primary-foreground/90 text-2xl font-black tracking-tight" data-testid="text-deposit-balance">
                  {formatMMK(deposit?.balance ?? 0)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="px-5 py-6 pb-12 space-y-4">
          {/* Tab toggle: Wallet vs Security Deposit */}
          <div className="flex gap-2">
            <button
              onClick={() => handleTabChange("wallet")}
              className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-colors ${
                activeTab === "wallet"
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-card text-muted-foreground border border-border hover:bg-muted"
              }`}
            >
              Wallet
            </button>
            <button
              onClick={() => handleTabChange("deposit")}
              className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-colors ${
                activeTab === "deposit"
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-card text-muted-foreground border border-border hover:bg-muted"
              }`}
            >
              Security Deposit
            </button>
          </div>

          {/* Type filter chips */}
          <div className="flex gap-2">
            {(["all", "credit", "debit"] as TypeFilter[]).map(f => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors capitalize ${
                  typeFilter === f
                    ? "bg-foreground text-background"
                    : "bg-card text-muted-foreground border border-border hover:bg-muted"
                }`}
              >
                {f === "all" ? "All" : f === "credit" ? "Credits" : "Debits"}
              </button>
            ))}
          </div>

          {/* Transaction list */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-[1.5rem]" />)}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="bg-card border border-card-border rounded-[1.5rem] p-8 text-center shadow-sm">
              <p className="text-muted-foreground font-medium text-sm">
                {typeFilter !== "all"
                  ? `No ${typeFilter} transactions found.`
                  : activeTab === "wallet"
                  ? "No wallet transactions yet."
                  : "No deposit history."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map(tx => {
                const isCredit = tx.type === "credit";
                const isDebit = tx.type === "debit";
                const iconBg = activeTab === "deposit" && isDebit
                  ? "bg-red-500/10 text-red-500"
                  : isCredit
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-red-500/10 text-red-500";
                const amountColor = isCredit ? "text-emerald-600" : "text-foreground";

                return (
                  <div
                    key={tx.id}
                    className="bg-card border border-card-border rounded-[1.5rem] p-4 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow"
                    data-testid={activeTab === "wallet" ? `tx-${tx.id}` : `deposit-tx-${tx.id}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                      {isCredit ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground line-clamp-1 leading-snug">{tx.description}</p>
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-1">{formatDateTime(String(tx.date))}</p>
                      {tx.reason && (
                        <p className="text-[11px] italic text-muted-foreground mt-1">Reason: {tx.reason}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-black text-base tracking-tight ${amountColor}`}>
                        {isCredit ? "+" : "-"}{formatMMK(tx.amount)}
                      </p>
                      {tx.balance !== undefined && (
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Bal: {formatMMK(tx.balance)}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
