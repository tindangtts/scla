import { useState } from "react";
import { useLocation } from "wouter";
import { useListTickets, getListTicketsQueryKey, useGetTicketSummary, getGetTicketSummaryQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { formatDateTime, getStatusBadgeClass, getStatusLabel } from "@/lib/format";
import { ChevronRight, Plus, Ticket, HelpCircle } from "lucide-react";
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
        <div className="bg-gradient-teal px-5 pt-14 pb-8 rounded-b-[2rem] shadow-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 blur-3xl rounded-full" />
          
          <div className="relative z-10 flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-accent" />
              <h1 className="text-xl font-extrabold text-primary-foreground tracking-tight">Star Assist</h1>
            </div>
            <button
              onClick={() => setLocation("/star-assist/new")}
              className="flex items-center gap-1.5 bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:scale-105 transition-transform"
              data-testid="button-new-ticket"
            >
              <Plus className="w-4 h-4" />
              New Ticket
            </button>
          </div>
          
          {summary && (
            <div className="grid grid-cols-3 gap-3 relative z-10">
              {[
                { label: "Open", value: summary.openCount, cls: "bg-white/10 text-white" },
                { label: "In Progress", value: summary.inProgressCount, cls: "bg-white/10 text-white" },
                { label: "Completed", value: summary.completedCount, cls: "bg-white/10 text-white" },
              ].map(s => (
                <div key={s.label} className={`${s.cls} rounded-2xl p-3 text-center border border-white/10 backdrop-blur-sm`}>
                  <p className="text-2xl font-black tracking-tight">{s.value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

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
              data-testid={`filter-${f.label.toLowerCase().replace(" ", "-")}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="px-5 pb-8 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
            </div>
          ) : !tickets || tickets.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                <Ticket className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <p className="font-extrabold text-xl text-foreground">No tickets yet</p>
              <p className="text-muted-foreground font-medium text-sm mt-2 leading-relaxed max-w-[250px] mx-auto">Need help with your unit or have a general enquiry?</p>
              <button
                onClick={() => setLocation("/star-assist/new")}
                className="mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
                data-testid="button-create-first-ticket"
              >
                Create your first ticket
              </button>
            </div>
          ) : (
            tickets.map(ticket => (
              <div
                key={ticket.id}
                className="bg-card border border-card-border rounded-2xl p-5 cursor-pointer shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                onClick={() => setLocation(`/star-assist/${ticket.id}`)}
                data-testid={`card-ticket-${ticket.id}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-2.5">
                      <span className={`text-[10px] font-bold px-2.5 py-1 uppercase tracking-wide rounded-md ${getStatusBadgeClass(ticket.status)}`}>
                        {getStatusLabel(ticket.status)}
                      </span>
                      <span className="text-xs font-bold text-muted-foreground/70 uppercase tracking-widest">{ticket.ticketNumber}</span>
                    </div>
                    <p className="font-extrabold text-base text-foreground line-clamp-1 leading-snug">{ticket.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded-md">
                        {categoryLabels[ticket.category] ?? ticket.category}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground/70">
                        {formatDateTime(ticket.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-full mt-1">
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
