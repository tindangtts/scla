import { useState } from "react";
import { useLocation } from "wouter";
import { useListInvoices, getListInvoicesQueryKey, useGetInvoiceSummary, getGetInvoiceSummaryQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { formatMMK, formatDate, getStatusBadgeClass, getStatusLabel } from "@/lib/format";
import { ChevronRight, ChevronLeft, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_FILTERS = [
  { value: undefined, label: "All" },
  { value: "unpaid", label: "Unpaid" },
  { value: "partially_paid", label: "Partial" },
  { value: "paid", label: "Paid" },
];

export default function BillsPage() {
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const { data: summary } = useGetInvoiceSummary({
    query: { queryKey: getGetInvoiceSummaryQueryKey() }
  });

  const { data: invoices, isLoading } = useListInvoices(
    statusFilter ? { status: statusFilter as "unpaid" | "partially_paid" | "paid" } : {},
    { query: { queryKey: getListInvoicesQueryKey(statusFilter ? { status: statusFilter as "unpaid" | "partially_paid" | "paid" } : {}) } }
  );

  const grouped = (invoices ?? []).reduce<Record<string, typeof invoices>>((acc, inv) => {
    if (!acc[inv.month]) acc[inv.month] = [];
    acc[inv.month]!.push(inv);
    return acc;
  }, {});

  return (
    <AppLayout>
      <div className="page-enter">
        <div className="bg-gradient-teal px-5 pt-14 pb-8 rounded-b-[2rem] shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full" />
          
          <div className="relative z-10 flex items-center gap-3 mb-6">
            <button onClick={() => setLocation("/")} className="p-2.5 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors" data-testid="button-back">
              <ChevronLeft className="w-5 h-5 text-primary-foreground" />
            </button>
            <h1 className="text-xl font-extrabold text-primary-foreground tracking-tight">Bill Payment</h1>
          </div>
          
          {summary && (
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-[1.5rem] p-5 shadow-inner">
              <p className="text-primary-foreground/80 text-xs font-bold uppercase tracking-wider">Total Outstanding</p>
              <p className="text-primary-foreground text-3xl font-black mt-1.5 tracking-tight" data-testid="text-total-outstanding">
                {formatMMK(summary.totalOutstanding)}
              </p>
              <div className="flex gap-4 mt-3 pt-3 border-t border-white/10 text-xs font-medium text-primary-foreground/90">
                <span className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  {summary.unpaidCount + summary.partiallyPaidCount} pending invoice{(summary.unpaidCount + summary.partiallyPaidCount) !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Status filter */}
        <div className="px-5 py-5 flex gap-2.5 overflow-x-auto no-scrollbar -mt-2">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.label}
              onClick={() => setStatusFilter(f.value)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm ${
                statusFilter === f.value
                  ? "bg-primary text-primary-foreground scale-105"
                  : "bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              data-testid={`filter-${f.label.toLowerCase()}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="px-5 pb-8 space-y-8">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-foreground font-bold text-lg">No invoices found</p>
              <p className="text-muted-foreground font-medium text-sm mt-1">You're all caught up with your bills.</p>
            </div>
          ) : (
            Object.entries(grouped)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([month, monthInvoices]) => (
                <div key={month}>
                  <h2 className="text-sm font-extrabold text-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {new Date(month + "-01").toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                  </h2>
                  <div className="space-y-3">
                    {monthInvoices!.map(inv => (
                      <div
                        key={inv.id}
                        className="bg-card border border-card-border rounded-2xl p-5 cursor-pointer shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                        onClick={() => setLocation(`/bills/${inv.id}`)}
                        data-testid={`card-invoice-${inv.id}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-[10px] font-bold px-2.5 py-1 uppercase tracking-wide rounded-md ${getStatusBadgeClass(inv.status)}`}>
                                {getStatusLabel(inv.status)}
                              </span>
                            </div>
                            <p className="font-bold text-base text-foreground leading-tight">{inv.description}</p>
                            <p className="text-xs font-medium text-muted-foreground mt-1.5">
                              #{inv.invoiceNumber} · Due {formatDate(inv.dueDate)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="text-right">
                              <p className="font-black text-base text-foreground tracking-tight" data-testid={`text-amount-${inv.id}`}>
                                {formatMMK(inv.totalAmount)}
                              </p>
                              {inv.paidAmount > 0 && inv.paidAmount < inv.totalAmount && (
                                <p className="text-[11px] font-bold text-emerald-600 mt-1">Paid: {formatMMK(inv.paidAmount)}</p>
                              )}
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
