import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { getBookingById } from "@/lib/queries/bookings";
import { notFound } from "next/navigation";
import { AppSubHeader } from "@/components/layout/app-header";
import { CancelButton } from "./cancel-button";
import { formatMMK, formatDate, humanizeStatus, statusBadgeClass } from "@/lib/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  swimming_pool: "Swimming pool",
  tennis_court: "Tennis court",
  basketball_court: "Basketball court",
  gym: "Gym",
  badminton_court: "Badminton court",
  function_room: "Function room",
  squash_court: "Squash court",
};

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  const booking = await getBookingById(id, dbUser.id);
  if (!booking) notFound();

  return (
    <>
      <AppSubHeader
        title={booking.bookingNumber}
        backHref="/bookings"
        backLabel="All bookings"
      />

      <div className="px-5 -mt-6 pb-8 relative z-20 space-y-4">
        {/* Hero card */}
        <div className="rounded-2xl bg-card border border-card-border p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h2 className="text-lg font-extrabold tracking-tight">{booking.facilityName}</h2>
            <span
              className={cn(
                "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0",
                statusBadgeClass(booking.status),
              )}
            >
              {humanizeStatus(booking.status)}
            </span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {CATEGORY_LABELS[booking.facilityCategory] ?? booking.facilityCategory}
          </p>

          <dl className="grid grid-cols-2 gap-y-4 gap-x-3 mt-5 pt-5 border-t border-border text-sm">
            <DetailRow label="Date" value={formatDate(booking.date)} />
            <DetailRow
              label="Time"
              value={`${booking.startTime.substring(0, 5)} – ${booking.endTime.substring(0, 5)}`}
            />
            <DetailRow label="Amount" value={formatMMK(booking.totalAmount)} />
            <DetailRow label="Payment" value={humanizeStatus(booking.paymentStatus)} />
            {booking.recurringGroupId ? <DetailRow label="Type" value="Recurring" /> : null}
            <DetailRow label="Created" value={formatDate(booking.createdAt)} />
          </dl>

          {booking.notes ? (
            <div className="pt-4 mt-4 border-t border-border">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Notes
              </p>
              <p className="text-sm text-foreground leading-relaxed">{booking.notes}</p>
            </div>
          ) : null}
        </div>

        {booking.status === "upcoming" ? (
          <CancelButton bookingId={booking.id} hasRecurringGroup={!!booking.recurringGroupId} />
        ) : null}
      </div>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-semibold text-foreground tabular-nums">{value}</dd>
    </div>
  );
}
