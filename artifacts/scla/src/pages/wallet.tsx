import { useLocation } from "wouter";
import { useGetWallet, getGetWalletQueryKey, useGetDeposit, getGetDepositQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { formatMMK, formatDateTime } from "@/lib/format";
import { ChevronLeft, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function WalletPage() {
  const [, setLocation] = useLocation();

  const { data: wallet, isLoading: walletLoading } = useGetWallet({
    query: { queryKey: getGetWalletQueryKey() }
  });

  const { data: deposit, isLoading: depositLoading } = useGetDeposit({
    query: { queryKey: getGetDepositQueryKey() }
  });

  return (
    <AppLayout>
      <div className="page-enter">
        <div className="bg-primary px-4 pt-12 pb-6">
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => setLocation("/")} className="p-2 bg-primary-foreground/10 rounded-full" data-testid="button-back">
              <ChevronLeft className="w-4 h-4 text-primary-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-primary-foreground">Wallet & Deposits</h1>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-primary-foreground/10 rounded-xl p-4">
              <p className="text-primary-foreground/70 text-xs">Wallet Balance</p>
              {walletLoading ? (
                <Skeleton className="h-7 w-28 mt-1 bg-primary-foreground/20" />
              ) : (
                <p className="text-primary-foreground text-xl font-bold mt-1" data-testid="text-wallet-balance">
                  {formatMMK(wallet?.balance ?? 0)}
                </p>
              )}
            </div>
            <div className="bg-primary-foreground/10 rounded-xl p-4">
              <p className="text-primary-foreground/70 text-xs">Deposit Balance</p>
              {depositLoading ? (
                <Skeleton className="h-7 w-28 mt-1 bg-primary-foreground/20" />
              ) : (
                <p className="text-primary-foreground text-xl font-bold mt-1" data-testid="text-deposit-balance">
                  {formatMMK(deposit?.balance ?? 0)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 py-4 pb-6 space-y-5">
          <div>
            <h2 className="font-semibold text-sm mb-3">Wallet Transactions</h2>
            {walletLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {(wallet?.transactions ?? []).map(tx => (
                  <div key={tx.id} className="bg-card border border-card-border rounded-xl p-4 flex items-center gap-3" data-testid={`tx-${tx.id}`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      tx.type === "credit" ? "bg-emerald-100" : "bg-red-100"
                    }`}>
                      {tx.type === "credit" ? (
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-1">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(tx.date)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-semibold text-sm ${tx.type === "credit" ? "text-emerald-600" : "text-red-500"}`}>
                        {tx.type === "credit" ? "+" : "-"}{formatMMK(tx.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">Bal: {formatMMK(tx.balance)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="font-semibold text-sm mb-3">Deposit History</h2>
            {depositLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 rounded-xl" />
              </div>
            ) : (
              <div className="space-y-2">
                {(deposit?.transactions ?? []).map(tx => (
                  <div key={tx.id} className="bg-card border border-card-border rounded-xl p-4 flex items-center gap-3" data-testid={`deposit-tx-${tx.id}`}>
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-1">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(tx.date)}</p>
                    </div>
                    <p className="font-semibold text-sm text-blue-600 flex-shrink-0">
                      +{formatMMK(tx.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
