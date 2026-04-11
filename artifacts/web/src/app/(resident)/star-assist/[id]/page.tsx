import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { getTicketById, getTicketMessages } from "@/lib/queries/tickets";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import TicketChat from "./ticket-chat";

export const dynamic = "force-dynamic";

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  open: "default",
  in_progress: "secondary",
  completed: "outline",
  closed: "destructive",
};

const CATEGORY_LABELS: Record<string, string> = {
  electricals: "Electricals",
  plumbing: "Plumbing",
  housekeeping: "Housekeeping",
  general_enquiry: "General Enquiry",
  air_conditioning: "Air Conditioning",
  pest_control: "Pest Control",
  civil_works: "Civil Works",
  other: "Other",
};

function formatStatus(status: string): string {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
      <div className="p-4">
        <p className="text-muted-foreground">
          User account not found. Please contact support.
        </p>
      </div>
    );
  }

  const ticket = await getTicketById(id, dbUser.id);
  if (!ticket) {
    notFound();
  }

  const messages = await getTicketMessages(ticket.id);

  const ticketNumber = ticket.ticketNumber;

  return (
    <div className="p-4 space-y-4">
      <Link
        href="/star-assist"
        className="text-sm text-primary hover:underline"
      >
        &larr; Back to tickets
      </Link>

      {/* Ticket header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{ticketNumber}</h1>
          <Badge variant={STATUS_VARIANT[ticket.status] ?? "default"}>
            {formatStatus(ticket.status)}
          </Badge>
        </div>
        <h2 className="text-lg">{ticket.title}</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">
            {CATEGORY_LABELS[ticket.category] ?? ticket.category}
          </Badge>
          <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
        </CardContent>
      </Card>

      {/* Attachment */}
      {ticket.attachmentUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attachment</CardTitle>
          </CardHeader>
          <CardContent>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ticket.attachmentUrl}
              alt="Ticket attachment"
              className="max-w-full rounded-md"
            />
          </CardContent>
        </Card>
      )}

      {/* Updates (legacy JSON array) */}
      {ticket.updates && ticket.updates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Updates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ticket.updates.map((update) => (
              <div key={update.id} className="border-b pb-3 last:border-0">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{update.author}</span>
                  <span className="text-muted-foreground text-xs">
                    {new Date(update.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm mt-1">{update.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Real-time chat */}
      <TicketChat ticketId={ticket.id} initialMessages={messages} />
    </div>
  );
}
