import { requireAdmin } from "@/lib/auth";
import { getTicketById, getStaffMembers } from "@/lib/queries/admin-tickets";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { updateTicketStatus, assignTicket } from "./actions";

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

export default async function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const ticket = await getTicketById(id);

  if (!ticket) {
    notFound();
  }

  const staffMembers = await getStaffMembers();

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/admin/tickets"
        className="text-sm text-muted-foreground hover:underline"
      >
        &larr; Back to Tickets
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">{ticket.ticketNumber}</h1>
        {statusBadge(ticket.status)}
        <Badge variant="outline">{formatCategory(ticket.category)}</Badge>
      </div>
      <h2 className="text-lg font-semibold">{ticket.title}</h2>

      {/* Detail card */}
      <Card>
        <CardHeader>
          <CardTitle>Ticket Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <span className="text-muted-foreground">Description:</span>
            <p className="mt-1 whitespace-pre-wrap">{ticket.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-muted-foreground">Service Type:</span>{" "}
              {ticket.serviceType}
            </div>
            <div>
              <span className="text-muted-foreground">Unit:</span>{" "}
              {ticket.unitNumber || "-"}
            </div>
            <div>
              <span className="text-muted-foreground">Created:</span>{" "}
              {ticket.createdAt.toLocaleDateString()}
            </div>
            <div>
              <span className="text-muted-foreground">Updated:</span>{" "}
              {ticket.updatedAt.toLocaleDateString()}
            </div>
          </div>
          {ticket.attachmentUrl && (
            <div>
              <span className="text-muted-foreground">Attachment:</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ticket.attachmentUrl}
                alt="Ticket attachment"
                className="mt-2 max-w-full max-h-64 rounded border"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submitter card */}
      <Card>
        <CardHeader>
          <CardTitle>Submitter</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <div>
            <span className="text-muted-foreground">Name:</span>{" "}
            {ticket.userName}
          </div>
          <div>
            <span className="text-muted-foreground">Email:</span>{" "}
            {ticket.userEmail}
          </div>
        </CardContent>
      </Card>

      {/* Status update form */}
      <Card>
        <CardHeader>
          <CardTitle>Update Status</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateTicketStatus} className="flex gap-2 items-end">
            <input type="hidden" name="ticketId" value={ticket.id} />
            <div className="flex-1">
              <label
                htmlFor="status"
                className="text-sm font-medium block mb-1"
              >
                New Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={ticket.status}
                className="w-full border rounded px-3 py-2 text-sm bg-background"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <Button type="submit" size="sm">
              Update
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Assignment form */}
      <Card>
        <CardHeader>
          <CardTitle>Assign to Staff</CardTitle>
        </CardHeader>
        <CardContent>
          {ticket.assignedTo && (
            <p className="text-sm text-muted-foreground mb-2">
              Currently assigned to:{" "}
              <strong>
                {staffMembers.find((s) => s.id === ticket.assignedTo)?.name ||
                  "Unknown"}
              </strong>
            </p>
          )}
          <form action={assignTicket} className="flex gap-2 items-end">
            <input type="hidden" name="ticketId" value={ticket.id} />
            <div className="flex-1">
              <label
                htmlFor="staffId"
                className="text-sm font-medium block mb-1"
              >
                Staff Member
              </label>
              <select
                id="staffId"
                name="staffId"
                defaultValue={ticket.assignedTo || ""}
                className="w-full border rounded px-3 py-2 text-sm bg-background"
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
            </div>
            <Button type="submit" size="sm">
              Assign
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
