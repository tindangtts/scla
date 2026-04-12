import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAllTickets } from "@/lib/queries/admin-tickets";
import { AdminPageHeader } from "@/components/layout/admin-page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, humanizeStatus, statusBadgeClass } from "@/lib/format";
import { Ticket as TicketIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function formatCategory(category: string) {
  return category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const status = params.status;
  const tickets = await getAllTickets(status);

  return (
    <div>
      <AdminPageHeader
        title="Tickets"
        description={`${tickets.length} ticket${tickets.length === 1 ? "" : "s"}${status ? ` · ${humanizeStatus(status)}` : ""}`}
      />

      <form
        method="GET"
        className="rounded-2xl bg-card border border-card-border p-3 shadow-sm mb-6 flex flex-wrap items-end gap-2.5"
      >
        <div className="space-y-1 flex-1 min-w-[160px]">
          <label
            htmlFor="status"
            className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status || ""}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          >
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <Button type="submit" className="font-bold">
          Apply
        </Button>
      </form>

      {tickets.length === 0 ? (
        <EmptyState
          icon={TicketIcon}
          title="No tickets found"
          description="Clear filters or wait for the next submission."
        />
      ) : (
        <div className="rounded-2xl bg-card border border-card-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/60 border-b border-border">
                  <th className="py-3 px-4 font-bold">Ticket #</th>
                  <th className="py-3 px-4 font-bold">Title</th>
                  <th className="py-3 px-4 font-bold">Category</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold">User</th>
                  <th className="py-3 px-4 font-bold">Unit</th>
                  <th className="py-3 px-4 font-bold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/tickets/${ticket.id}`}
                        className="font-mono font-bold text-primary hover:underline tabular-nums"
                      >
                        {ticket.ticketNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/tickets/${ticket.id}`}
                        className="font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {ticket.title}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {formatCategory(ticket.category)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          statusBadgeClass(ticket.status),
                        )}
                      >
                        {humanizeStatus(ticket.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-foreground">{ticket.userName}</td>
                    <td className="py-3 px-4 tabular-nums">{ticket.unitNumber || "—"}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {formatDate(ticket.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
