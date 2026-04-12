import { requireAdmin } from "@/lib/auth";
import { getTicketById, getStaffMembers } from "@/lib/queries/admin-tickets";
import { getTicketMessages } from "@/lib/queries/tickets";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/layout/admin-page-header";
import { Button } from "@/components/ui/button";
import { updateTicketStatus, assignTicket } from "./actions";
import TicketChat from "./ticket-chat";
import { formatDate, humanizeStatus, statusBadgeClass } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Mail, User, Paperclip } from "lucide-react";

export const dynamic = "force-dynamic";

function formatCategory(category: string) {
  return category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const ticket = await getTicketById(id);
  if (!ticket) notFound();

  const staffMembers = await getStaffMembers();
  const messages = await getTicketMessages(ticket.id);
  const assignedName = ticket.assignedTo
    ? staffMembers.find((s) => s.id === ticket.assignedTo)?.name
    : null;

  return (
    <div className="max-w-4xl">
      <AdminPageHeader
        title={ticket.ticketNumber}
        description={ticket.title}
        backHref="/admin/tickets"
        backLabel="All tickets"
        action={
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                statusBadgeClass(ticket.status),
              )}
            >
              {humanizeStatus(ticket.status)}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-wider">
              {formatCategory(ticket.category)}
            </span>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Description */}
          <div className="rounded-2xl bg-card border border-card-border p-5 shadow-sm">
            <h2 className="text-sm font-bold tracking-tight mb-2">Description</h2>
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {ticket.description}
            </p>
            <dl className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border text-sm">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Service type
                </dt>
                <dd className="text-sm font-semibold text-foreground">{ticket.serviceType}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Unit
                </dt>
                <dd className="text-sm font-semibold text-foreground tabular-nums">
                  {ticket.unitNumber || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Created
                </dt>
                <dd className="text-sm font-semibold text-foreground">
                  {formatDate(ticket.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Updated
                </dt>
                <dd className="text-sm font-semibold text-foreground">
                  {formatDate(ticket.updatedAt)}
                </dd>
              </div>
            </dl>
            {ticket.attachmentUrl ? (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Paperclip className="w-3 h-3" aria-hidden="true" />
                  Attachment
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ticket.attachmentUrl}
                  alt={`Attachment for ${ticket.title}`}
                  className="max-h-64 rounded-xl border border-border"
                />
              </div>
            ) : null}
          </div>

          {/* Chat */}
          <TicketChat ticketId={ticket.id} initialMessages={messages} />
        </div>

        {/* Side column */}
        <aside className="space-y-4">
          {/* Submitter */}
          <div className="rounded-2xl bg-card border border-card-border p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold tracking-tight">Submitter</h3>
            <div className="flex items-center gap-2.5 text-sm">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <User className="w-3.5 h-3.5" aria-hidden="true" />
              </div>
              <span className="font-semibold text-foreground">{ticket.userName}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <div className="p-1.5 rounded-lg bg-muted text-muted-foreground">
                <Mail className="w-3.5 h-3.5" aria-hidden="true" />
              </div>
              <span className="text-muted-foreground break-all">{ticket.userEmail}</span>
            </div>
          </div>

          {/* Status update */}
          <form
            action={updateTicketStatus}
            className="rounded-2xl bg-card border border-card-border p-5 shadow-sm space-y-3"
          >
            <h3 className="text-sm font-bold tracking-tight">Update status</h3>
            <input type="hidden" name="ticketId" value={ticket.id} />
            <select
              name="status"
              defaultValue={ticket.status}
              aria-label="New status"
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            >
              <option value="open">Open</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="closed">Closed</option>
            </select>
            <Button type="submit" size="sm" className="w-full font-bold">
              Update status
            </Button>
          </form>

          {/* Assignment */}
          <form
            action={assignTicket}
            className="rounded-2xl bg-card border border-card-border p-5 shadow-sm space-y-3"
          >
            <h3 className="text-sm font-bold tracking-tight">Assignment</h3>
            {assignedName ? (
              <p className="text-xs text-muted-foreground font-medium">
                Currently: <span className="font-bold text-foreground">{assignedName}</span>
              </p>
            ) : (
              <p className="text-xs text-muted-foreground font-medium">Currently unassigned</p>
            )}
            <input type="hidden" name="ticketId" value={ticket.id} />
            <select
              name="staffId"
              defaultValue={ticket.assignedTo || ""}
              aria-label="Assign to staff"
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            >
              <option value="" disabled>
                Select staff member
              </option>
              {staffMembers.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name}
                </option>
              ))}
            </select>
            <Button type="submit" size="sm" className="w-full font-bold">
              Assign
            </Button>
          </form>
        </aside>
      </div>
    </div>
  );
}
