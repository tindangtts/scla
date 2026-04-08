import { useState } from "react";
import { useLocation } from "wouter";
import { useListTickets, getListTicketsQueryKey, useGetTicketSummary, getGetTicketSummaryQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { formatDateTime, getStatusBadgeClass, getStatusLabel } from "@/lib/format";
import { ChevronRight, Plus, Ticket } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_FILTERS = [
  { value: undefined, label: "All" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

export default function StarAssistPage() {
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const { data: summary } = useGetTicketSummary({
    query: { queryKey: getGetTicketSummaryQueryKey() }
  });

  const { data: tickets, isLoading } = useListTickets(
    statusFilter ? { status: statusFilter as "open" | "in_progress" | "completed" } : {},
    { query: { queryKey: getListTicketsQueryKey(statusFilter ? { status: statusFilter as "open" | "in_progress" | "completed" } : {}) } }
  );

  const categoryLabels: Record<string, string> = {
    electricals: "Electricals", plumbing: "Plumbing", housekeeping: "Housekeeping",
    general_enquiry: "General Enquiry", air_conditioning: "Air Conditioning",
    pest_control: "Pest Control", civil_works: "Civil Works", other: "Other",
  };

  return (
    <AppLayout>
      <div className="page-enter">
        <div className="bg-primary px-4 pt-12 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-primary-foreground">Star Assist</h1>
            <button
              onClick={() => setLocation("/star-assist/new")}
              className="flex items-center gap-1.5 bg-accent text-accent-foreground px-3 py-1.5 rounded-full text-sm font-medium"
              data-testid="button-new-ticket"
            >
              <Plus className="w-4 h-4" />
              New Ticket
            </button>
          </div>
          {summary && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Open", value: summary.openCount, cls: "bg-red-500/20 text-red-100" },
                { label: "In Progress", value: summary.inProgressCount, cls: "bg-amber-500/20 text-amber-100" },
                { label: "Completed", value: summary.completedCount, cls: "bg-emerald-500/20 text-emerald-100" },
              ].map(s => (
                <div key={s.label} className={`${s.cls} rounded-lg p-2.5 text-center`}>
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-xs opacity-80">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

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
              data-testid={`filter-${f.label.toLowerCase().replace(" ", "-")}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="px-4 pb-6 space-y-2">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
            </div>
          ) : !tickets || tickets.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <Ticket className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground">No tickets yet</p>
              <p className="text-muted-foreground text-sm mt-1">Tap "New Ticket" to report an issue or make an enquiry.</p>
              <button
                onClick={() => setLocation("/star-assist/new")}
                className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium"
                data-testid="button-create-first-ticket"
              >
                Create your first ticket
              </button>
            </div>
          ) : (
            tickets.map(ticket => (
              <div
                key={ticket.id}
                className="bg-card border border-card-border rounded-xl p-4 cursor-pointer hover:bg-muted transition-colors"
                onClick={() => setLocation(`/star-assist/${ticket.id}`)}
                data-testid={`card-ticket-${ticket.id}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusBadgeClass(ticket.status)}`}>
                        {getStatusLabel(ticket.status)}
                      </span>
                      <span className="text-xs text-muted-foreground">{ticket.ticketNumber}</span>
                    </div>
                    <p className="font-medium text-sm text-foreground line-clamp-1">{ticket.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {categoryLabels[ticket.category] ?? ticket.category} · {formatDateTime(ticket.createdAt)}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
