import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { getUserBookings } from "@/lib/queries/bookings";
import { AppHeader } from "@/components/layout/app-header";
import { EmptyState } from "@/components/ui/empty-state";
import { formatMMK, formatDate, humanizeStatus, statusBadgeClass } from "@/lib/format";
import { Calendar, Plus, ChevronRight, Repeat, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_FILTERS: Array<{ label: string; value?: string; href: string }> = [
  { label: "All", href: "/bookings" },
  { label: "Upcoming", value: "upcoming", href: "/bookings?status=upcoming" },
  { label: "Completed", value: "completed", href: "/bookings?status=completed" },
  { label: "Cancelled", value: "cancelled", href: "/bookings?status=cancelled" },
];

export default async function BookingsPage({
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

  const bookings = await getUserBookings(dbUser.id, status);

  return (
    <>
      <AppHeader name="My Bookings" subtitle={`${bookings.length} booking${bookings.length === 1 ? "" : "s"}`} />

      <div className="px-5 -mt-8 pb-8 relative z-20 space-y-5">
        {/* Book facility CTA */}
        <Link
          href="/bookings/facilities"
          className="group block rounded-2xl bg-primary text-primary-foreground p-4 shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-sm">
                <Plus className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-extrabold tracking-tight">Book a facility</p>
                <p className="text-xs font-medium opacity-80">Pool, gym, courts & more</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 opacity-80 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
          </div>
        </Link>

        {/* Status filters */}
        <div role="tablist" aria-label="Filter bookings" className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {STATUS_FILTERS.map((filter) => {
            const isActive = (status ?? undefined) === filter.value;
            return (
              <Link
                key={filter.label}
                href={filter.href}
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

        {/* Bookings list */}
        {bookings.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No bookings found"
            description="Reserve pools, courts, or the function room — we'll save your spot."
            action={
              <Link
                href="/bookings/facilities"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Browse facilities
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            }
          />
        ) : (
          <ul className="space-y-2.5">
            {bookings.map((booking) => (
              <li key={booking.id}>
                <Link
                  href={`/bookings/${booking.id}`}
                  className="block rounded-2xl bg-card border border-card-border p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[11px] font-bold text-muted-foreground tabular-nums">
                          {booking.bookingNumber}
                        </span>
                        {booking.recurringGroupId ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/15 text-accent-foreground text-[10px] font-bold uppercase tracking-wider">
                            <Repeat className="w-2.5 h-2.5" aria-hidden="true" />
                            Recurring
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm font-bold text-foreground truncate">
                        {booking.facilityName}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium mt-1">
                        <Clock className="w-3 h-3" aria-hidden="true" />
                        <span className="tabular-nums">
                          {formatDate(booking.date)} · {booking.startTime.substring(0, 5)}–
                          {booking.endTime.substring(0, 5)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          statusBadgeClass(booking.status),
                        )}
                      >
                        {humanizeStatus(booking.status)}
                      </span>
                      <p className="text-sm font-extrabold tabular-nums">
                        {formatMMK(booking.totalAmount)}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
