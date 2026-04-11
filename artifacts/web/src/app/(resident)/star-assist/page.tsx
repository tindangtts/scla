import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { getTickets } from "@/lib/queries/tickets";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Closed", value: "closed" },
] as const;

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

export default async function StarAssistPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireAuth();
  const { status } = await searchParams;

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

  const tickets = await getTickets(dbUser.id, status);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Star Assist</h1>
        <Link
          href="/star-assist/new"
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
        >
          New Ticket
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((filter) => {
          const isActive =
            (!status && filter.value === "") || status === filter.value;
          return (
            <Link
              key={filter.value}
              href={
                filter.value
                  ? `/star-assist?status=${filter.value}`
                  : "/star-assist"
              }
            >
              <Badge variant={isActive ? "default" : "outline"}>
                {filter.label}
              </Badge>
            </Link>
          );
        })}
      </div>

      {/* Ticket list */}
      {tickets.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-2">
              No tickets found. Create your first ticket!
            </p>
            <Link
              href="/star-assist/new"
              className="text-primary hover:underline text-sm"
            >
              Create a new ticket
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Link key={ticket.id} href={`/star-assist/${ticket.id}`}>
              <Card className="hover:bg-accent/50 transition-colors mb-3">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">
                      {ticket.ticketNumber}
                    </span>
                    <Badge variant={STATUS_VARIANT[ticket.status] ?? "default"}>
                      {formatStatus(ticket.status)}
                    </Badge>
                  </div>
                  <CardTitle className="text-base">{ticket.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {CATEGORY_LABELS[ticket.category] ?? ticket.category}
                    </Badge>
                    <span>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
