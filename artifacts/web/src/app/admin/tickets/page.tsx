import { requireAdmin } from "@/lib/auth";
import { getAllTickets } from "@/lib/queries/admin-tickets";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

function statusBadge(status: string) {
  switch (status) {
    case "open":
      return <Badge variant="default">Open</Badge>;
    case "in_progress":
      return (
        <Badge variant="secondary" className="text-yellow-600">
          In Progress
        </Badge>
      );
    case "completed":
      return (
        <Badge variant="secondary" className="text-green-600">
          Completed
        </Badge>
      );
    case "closed":
      return <Badge variant="outline">Closed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function formatCategory(category: string) {
  return category
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">
          Tickets ({tickets.length})
        </h1>
      </div>

      {/* Filter bar */}
      <form method="GET" className="mb-4 flex gap-2 items-center">
        <label htmlFor="status" className="text-sm font-medium">
          Status:
        </label>
        <select
          id="status"
          name="status"
          defaultValue={status || ""}
          className="border rounded px-3 py-1.5 text-sm bg-background"
        >
          <option value="">All</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="closed">Closed</option>
        </select>
        <button
          type="submit"
          className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm"
        >
          Filter
        </button>
      </form>

      {tickets.length === 0 ? (
        <p className="text-muted-foreground">No tickets found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-2">Ticket #</th>
                <th className="p-2">Title</th>
                <th className="p-2">Category</th>
                <th className="p-2">Status</th>
                <th className="p-2">User</th>
                <th className="p-2">Unit</th>
                <th className="p-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="border-b hover:bg-muted/50">
                  <td className="p-2">
                    <Link
                      href={`/admin/tickets/${ticket.id}`}
                      className="text-primary hover:underline font-mono"
                    >
                      {ticket.ticketNumber}
                    </Link>
                  </td>
                  <td className="p-2">
                    <Link
                      href={`/admin/tickets/${ticket.id}`}
                      className="hover:underline"
                    >
                      {ticket.title}
                    </Link>
                  </td>
                  <td className="p-2">{formatCategory(ticket.category)}</td>
                  <td className="p-2">{statusBadge(ticket.status)}</td>
                  <td className="p-2">{ticket.userName}</td>
                  <td className="p-2">{ticket.unitNumber || "-"}</td>
                  <td className="p-2">
                    {ticket.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
