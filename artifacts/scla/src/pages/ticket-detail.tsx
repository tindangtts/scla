import { useParams, useLocation } from "wouter";
import { useGetTicket, getGetTicketQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { formatDateTime, getStatusBadgeClass, getStatusLabel } from "@/lib/format";
import { ChevronLeft, User, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const categoryLabels: Record<string, string> = {
  electricals: "Electricals", plumbing: "Plumbing", housekeeping: "Housekeeping",
  general_enquiry: "General Enquiry", air_conditioning: "Air Conditioning",
  pest_control: "Pest Control", civil_works: "Civil Works", other: "Other",
};

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const { data: ticket, isLoading } = useGetTicket(id, {
    query: { queryKey: getGetTicketQueryKey(id) }
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-4 space-y-4 pt-12">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  if (!ticket) {
    return <AppLayout><div className="p-4 text-center text-muted-foreground pt-12">Ticket not found</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="page-enter">
        <div className="bg-primary px-4 pt-12 pb-4">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => setLocation("/star-assist")} className="p-2 bg-primary-foreground/10 rounded-full" data-testid="button-back">
              <ChevronLeft className="w-4 h-4 text-primary-foreground" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-primary-foreground line-clamp-1">{ticket.title}</h1>
              <p className="text-primary-foreground/60 text-xs">{ticket.ticketNumber}</p>
            </div>
          </div>
          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(ticket.status)}`} data-testid="text-ticket-status">
            {getStatusLabel(ticket.status)}
          </span>
        </div>

        <div className="px-4 py-4 space-y-4 pb-8">
          <div className="bg-card border border-card-border rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="font-medium">{categoryLabels[ticket.category] ?? ticket.category}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Service Type</p>
                <p className="font-medium">{ticket.serviceType}</p>
              </div>
              {ticket.unitNumber && (
                <div>
                  <p className="text-xs text-muted-foreground">Unit</p>
                  <p className="font-medium">{ticket.unitNumber}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Submitted</p>
                <p className="font-medium">{formatDateTime(ticket.createdAt)}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Description</p>
              <p className="text-sm text-foreground">{ticket.description}</p>
            </div>
          </div>

          {/* Conversation history */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Updates</h3>
            <div className="space-y-3">
              {ticket.updates.map((update: { id: string; message: string; author: string; authorType: string; createdAt: string }) => (
                <div
                  key={update.id}
                  className={`flex gap-3 ${update.authorType === "resident" ? "flex-row-reverse" : ""}`}
                  data-testid={`ticket-update-${update.id}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    update.authorType === "staff" ? "bg-primary/10" : "bg-accent/10"
                  }`}>
                    {update.authorType === "staff" ? (
                      <Shield className="w-4 h-4 text-primary" />
                    ) : (
                      <User className="w-4 h-4 text-accent" />
                    )}
                  </div>
                  <div className={`max-w-[80%] ${update.authorType === "resident" ? "items-end" : "items-start"} flex flex-col`}>
                    <div className={`px-3 py-2 rounded-xl text-sm ${
                      update.authorType === "staff"
                        ? "bg-card border border-card-border text-foreground"
                        : "bg-primary text-primary-foreground"
                    }`}>
                      {update.message}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {update.author} · {formatDateTime(update.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
