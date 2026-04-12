import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { getTickets } from "@/lib/queries/tickets";
import { AppHeader } from "@/components/layout/app-header";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, humanizeStatus, statusBadgeClass } from "@/lib/format";
import {
  Plus,
  Zap,
  Wrench,
  Sparkles,
  HelpCircle,
  Wind,
  Bug,
  Hammer,
  CircleDashed,
  Ticket as TicketIcon,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentType } from "react";

export const dynamic = "force-dynamic";

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Open", value: "open" },
  { label: "In progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Closed", value: "closed" },
] as const;

const CATEGORY_META: Record<
  string,
  { label: string; icon: ComponentType<{ className?: string }>; tint: string }
> = {
  electricals: { label: "Electricals", icon: Zap, tint: "text-amber-600 bg-amber-500/10" },
  plumbing: { label: "Plumbing", icon: Wrench, tint: "text-blue-600 bg-blue-500/10" },
  housekeeping: { label: "Housekeeping", icon: Sparkles, tint: "text-violet-600 bg-violet-500/10" },
  general_enquiry: { label: "General", icon: HelpCircle, tint: "text-primary bg-primary/10" },
  air_conditioning: { label: "Air conditioning", icon: Wind, tint: "text-cyan-600 bg-cyan-500/10" },
  pest_control: { label: "Pest control", icon: Bug, tint: "text-emerald-600 bg-emerald-500/10" },
  civil_works: { label: "Civil works", icon: Hammer, tint: "text-orange-600 bg-orange-500/10" },
  other: { label: "Other", icon: CircleDashed, tint: "text-muted-foreground bg-muted" },
};

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
      <div className="p-5">
        <p className="text-muted-foreground">User account not found.</p>
      </div>
    );
  }

  const tickets = await getTickets(dbUser.id, status);

  return (
    <>
      <AppHeader name="Star Assist" subtitle={`${tickets.length} ticket${tickets.length === 1 ? "" : "s"}`} />

      <div className="px-5 -mt-8 pb-8 relative z-20 space-y-5">
        {/* New ticket CTA */}
        <Link
          href="/star-assist/new"
          className="group block rounded-2xl bg-primary text-primary-foreground p-4 shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-sm">
                <Plus className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-extrabold tracking-tight">New request</p>
                <p className="text-xs font-medium opacity-80">
                  Report an issue or request a service
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 opacity-80 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
          </div>
        </Link>

        {/* Status filters */}
        <div role="tablist" aria-label="Filter tickets" className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {STATUS_FILTERS.map((filter) => {
            const isActive = (!status && filter.value === "") || status === filter.value;
            return (
              <Link
                key={filter.value}
                href={filter.value ? `/star-assist?status=${filter.value}` : "/star-assist"}
                role="tab"
                aria-selected={isActive}
                className={cn(
                  "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card border border-card-border text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>

        {/* Ticket list */}
        {tickets.length === 0 ? (
          <EmptyState
            icon={TicketIcon}
            title="No tickets yet"
            description="Tell us what needs fixing — we'll dispatch the right team and keep you posted."
            action={
              <Link
                href="/star-assist/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Create ticket
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            }
          />
        ) : (
          <ul className="space-y-2.5">
            {tickets.map((ticket) => {
              const meta = CATEGORY_META[ticket.category] ?? CATEGORY_META.other;
              const Icon = meta.icon;
              return (
                <li key={ticket.id}>
                  <Link
                    href={`/star-assist/${ticket.id}`}
                    className="flex items-start gap-3 rounded-2xl bg-card border border-card-border p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className={cn("p-2.5 rounded-xl shrink-0", meta.tint)}>
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold text-muted-foreground tabular-nums">
                          {ticket.ticketNumber}
                        </span>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            statusBadgeClass(ticket.status),
                          )}
                        >
                          {humanizeStatus(ticket.status)}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-foreground truncate">{ticket.title}</p>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                        <span>{meta.label}</span>
                        <span>{formatDate(ticket.createdAt)}</span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
