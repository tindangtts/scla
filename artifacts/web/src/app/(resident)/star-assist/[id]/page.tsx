import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { getTicketById, getTicketMessages } from "@/lib/queries/tickets";
import { notFound } from "next/navigation";
import { AppSubHeader } from "@/components/layout/app-header";
import TicketChat from "./ticket-chat";
import { formatDate, formatDateTime, humanizeStatus, statusBadgeClass } from "@/lib/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  electricals: "Electricals",
  plumbing: "Plumbing",
  housekeeping: "Housekeeping",
  general_enquiry: "General enquiry",
  air_conditioning: "Air conditioning",
  pest_control: "Pest control",
  civil_works: "Civil works",
  other: "Other",
};

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const { id } = await params;

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

  const ticket = await getTicketById(id, dbUser.id);
  if (!ticket) notFound();

  const messages = await getTicketMessages(ticket.id);

  return (
    <>
      <AppSubHeader title={ticket.ticketNumber} backHref="/star-assist" backLabel="All tickets" />

      <div className="px-5 -mt-6 pb-8 relative z-20 space-y-4">
        {/* Overview */}
        <div className="rounded-2xl bg-card border border-card-border p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h2 className="text-lg font-extrabold tracking-tight">{ticket.title}</h2>
            <span
              className={cn(
                "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0",
                statusBadgeClass(ticket.status),
              )}
            >
              {humanizeStatus(ticket.status)}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold">
              {CATEGORY_LABELS[ticket.category] ?? ticket.category}
            </span>
            <span className="text-muted-foreground font-medium">
              Opened {formatDate(ticket.createdAt)}
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Description
            </p>
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {ticket.description}
            </p>
          </div>
        </div>

        {/* Attachment */}
        {ticket.attachmentUrl ? (
          <div className="rounded-2xl bg-card border border-card-border p-3 shadow-sm overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ticket.attachmentUrl}
              alt={`Attachment for ${ticket.title}`}
              className="w-full rounded-xl max-h-96 object-cover"
            />
          </div>
        ) : null}

        {/* Updates (legacy JSON array) */}
        {ticket.updates && ticket.updates.length > 0 ? (
          <div className="rounded-2xl bg-card border border-card-border p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold tracking-tight">Status updates</h3>
            <ol className="space-y-3 border-l-2 border-primary/20 pl-4">
              {ticket.updates.map((update) => (
                <li key={update.id} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[1.35rem] top-1.5 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-card"
                  />
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-foreground">{update.author}</span>
                    <span className="text-muted-foreground">
                      {formatDateTime(update.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground mt-1 leading-relaxed">{update.message}</p>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        {/* Real-time chat */}
        <TicketChat ticketId={ticket.id} initialMessages={messages} />
      </div>
    </>
  );
}
