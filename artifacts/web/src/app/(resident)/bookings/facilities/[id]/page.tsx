import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { getFacilityById, getAvailableSlots } from "@/lib/queries/facilities";
import { notFound } from "next/navigation";
import { AppSubHeader } from "@/components/layout/app-header";
import { BookingForm } from "./booking-form";
import { formatMMK, formatDate } from "@/lib/format";
import { ChevronLeft, ChevronRight, Clock, Users } from "lucide-react";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  swimming_pool: "Swimming Pool",
  tennis_court: "Tennis Court",
  basketball_court: "Basketball Court",
  gym: "Gym",
  badminton_court: "Badminton Court",
  function_room: "Function Room",
  squash_court: "Squash Court",
};

function getToday() {
  return new Date().toISOString().split("T")[0];
}

export default async function FacilityDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  await requireAuth();
  const { id } = await params;
  const { date: dateParam } = await searchParams;

  const facility = await getFacilityById(id);
  if (!facility) notFound();

  const today = getToday();
  const selectedDate = dateParam && dateParam >= today ? dateParam : today;
  const slots = await getAvailableSlots(id, selectedDate);

  const selectedDateObj = new Date(selectedDate + "T00:00:00");
  const prevDateObj = new Date(selectedDateObj);
  prevDateObj.setDate(prevDateObj.getDate() - 1);
  const prevDate = prevDateObj.toISOString().split("T")[0];
  const nextDateObj = new Date(selectedDateObj);
  nextDateObj.setDate(nextDateObj.getDate() + 1);
  const nextDate = nextDateObj.toISOString().split("T")[0];

  const canGoPrev = prevDate >= today;

  return (
    <>
      <AppSubHeader
        title={facility.name}
        backHref="/bookings/facilities"
        backLabel="Facilities"
      />

      <div className="px-5 -mt-6 pb-8 relative z-20 space-y-4">
        {/* Facility card */}
        <div className="rounded-2xl bg-card border border-card-border p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-wider">
                {CATEGORY_LABELS[facility.category] ?? facility.category}
              </span>
              <h2 className="text-lg font-extrabold tracking-tight mt-1.5">{facility.name}</h2>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{facility.description}</p>

          <dl className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border text-sm">
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Member rate
              </dt>
              <dd className="mt-0.5 font-extrabold text-foreground tabular-nums">
                {formatMMK(facility.memberRate)}
                <span className="text-xs font-medium text-muted-foreground"> / hr</span>
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Non-member
              </dt>
              <dd className="mt-0.5 font-extrabold text-foreground tabular-nums">
                {formatMMK(facility.nonMemberRate)}
                <span className="text-xs font-medium text-muted-foreground"> / hr</span>
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Hours
                </dt>
                <dd className="text-sm font-semibold text-foreground tabular-nums">
                  {facility.openingTime.substring(0, 5)} – {facility.closingTime.substring(0, 5)}
                </dd>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Capacity
                </dt>
                <dd className="text-sm font-semibold text-foreground">{facility.maxCapacity}</dd>
              </div>
            </div>
          </dl>
        </div>

        {/* Date navigation */}
        <div className="flex items-center justify-between rounded-2xl bg-card border border-card-border p-2 shadow-sm">
          {canGoPrev ? (
            <Link
              href={`/bookings/facilities/${id}?date=${prevDate}`}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-foreground hover:bg-muted rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
              Prev
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-muted-foreground opacity-50">
              <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
              Prev
            </span>
          )}
          <span className="text-sm font-extrabold tracking-tight">{formatDate(selectedDate, { weekday: "short", month: "short", day: "numeric" })}</span>
          <Link
            href={`/bookings/facilities/${id}?date=${nextDate}`}
            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-foreground hover:bg-muted rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Slots + form */}
        <BookingForm
          facilityId={id}
          facilityName={facility.name}
          date={selectedDate}
          rate={facility.memberRate}
          slots={slots}
        />
      </div>
    </>
  );
}
