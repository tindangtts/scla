import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useGetWallet, getGetWalletQueryKey, useGetDeposit, getGetDepositQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { formatMMK, formatDateTime } from "@/lib/format";
import { ChevronLeft, TrendingUp, TrendingDown, Wallet as WalletIcon, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function WalletPage() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  const { data: wallet, isLoading: walletLoading } = useGetWallet({
    query: { queryKey: getGetWalletQueryKey() }
  });

  const { data: deposit, isLoading: depositLoading } = useGetDeposit({
    query: { queryKey: getGetDepositQueryKey() }
  });

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

        <div className="px-5 py-8 pb-12 space-y-8">
          <div>
            <h2 className="font-extrabold text-lg text-foreground mb-4 tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Wallet Transactions
            </h2>
            {walletLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-[1.5rem]" />)}
              </div>
            ) : (wallet?.transactions ?? []).length === 0 ? (
              <div className="bg-card border border-card-border rounded-[1.5rem] p-8 text-center shadow-sm">
                <p className="text-muted-foreground font-medium text-sm">No wallet transactions yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(wallet?.transactions ?? []).map(tx => (
                  <div key={tx.id} className="bg-card border border-card-border rounded-[1.5rem] p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow" data-testid={`tx-${tx.id}`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      tx.type === "credit" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"
                    }`}>
                      {tx.type === "credit" ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground line-clamp-1 leading-snug">{tx.description}</p>
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-1">{formatDateTime(tx.date)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-black text-base tracking-tight ${tx.type === "credit" ? "text-emerald-600" : "text-foreground"}`}>
                        {tx.type === "credit" ? "+" : "-"}{formatMMK(tx.amount)}
                      </p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Bal: {formatMMK(tx.balance)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="font-extrabold text-lg text-foreground mb-4 tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" /> Deposit History
            </h2>
            {depositLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 rounded-[1.5rem]" />
              </div>
            ) : (deposit?.transactions ?? []).length === 0 ? (
              <div className="bg-card border border-card-border rounded-[1.5rem] p-8 text-center shadow-sm">
                <p className="text-muted-foreground font-medium text-sm">No deposit history.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(deposit?.transactions ?? []).map(tx => (
                  <div key={tx.id} className="bg-card border border-card-border rounded-[1.5rem] p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow" data-testid={`deposit-tx-${tx.id}`}>
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground line-clamp-1 leading-snug">{tx.description}</p>
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-1">{formatDateTime(tx.date)}</p>
                    </div>
                    <p className="font-black text-base tracking-tight text-blue-600 flex-shrink-0">
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
