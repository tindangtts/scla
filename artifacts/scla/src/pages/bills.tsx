import { useState } from "react";
import { useLocation } from "wouter";
import { useListInvoices, getListInvoicesQueryKey, useGetInvoiceSummary, getGetInvoiceSummaryQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { formatMMK, formatDate, getStatusBadgeClass, getStatusLabel } from "@/lib/format";
import { ChevronRight, ChevronLeft } from "lucide-react";
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
        <div className="bg-primary px-4 pt-12 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setLocation("/")} className="p-2 bg-primary-foreground/10 rounded-full" data-testid="button-back">
              <ChevronLeft className="w-4 h-4 text-primary-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-primary-foreground">Bill Payment</h1>
          </div>
          {summary && (
            <div className="bg-primary-foreground/10 rounded-xl p-4">
              <p className="text-primary-foreground/70 text-xs">Total Outstanding</p>
              <p className="text-primary-foreground text-2xl font-bold mt-1" data-testid="text-total-outstanding">
                {formatMMK(summary.totalOutstanding)}
              </p>
              <div className="flex gap-4 mt-2 text-xs text-primary-foreground/60">
                <span>{summary.unpaidCount + summary.partiallyPaidCount} invoice{(summary.unpaidCount + summary.partiallyPaidCount) !== 1 ? "s" : ""} due</span>
              </div>
            </div>
          )}
        </div>

        {/* Status filter */}
        <div className="px-4 py-3 flex gap-2 overflow-x-auto">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.label}
              onClick={() => setStatusFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`filter-${f.label.toLowerCase()}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="px-4 pb-6 space-y-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No invoices found</p>
            </div>
          ) : (
            Object.entries(grouped)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([month, monthInvoices]) => (
                <div key={month}>
                  <h2 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    {new Date(month + "-01").toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                  </h2>
                  <div className="space-y-2">
                    {monthInvoices!.map(inv => (
                      <div
                        key={inv.id}
                        className="bg-card border border-card-border rounded-xl p-4 cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => setLocation(`/bills/${inv.id}`)}
                        data-testid={`card-invoice-${inv.id}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusBadgeClass(inv.status)}`}>
                                {getStatusLabel(inv.status)}
                              </span>
                            </div>
                            <p className="font-medium text-sm text-foreground">{inv.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {inv.invoiceNumber} · Due {formatDate(inv.dueDate)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="text-right">
                              <p className="font-semibold text-sm" data-testid={`text-amount-${inv.id}`}>
                                {formatMMK(inv.totalAmount)}
                              </p>
                              {inv.paidAmount > 0 && inv.paidAmount < inv.totalAmount && (
                                <p className="text-xs text-muted-foreground">Paid: {formatMMK(inv.paidAmount)}</p>
                              )}
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
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
