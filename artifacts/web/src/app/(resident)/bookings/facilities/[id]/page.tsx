import { requireAuth } from "@/lib/auth";
import { getFacilityById, getAvailableSlots } from "@/lib/queries/facilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingForm } from "./booking-form";

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

function formatMMK(amount: string | number) {
  return Number(amount).toLocaleString() + " MMK";
}

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
  if (!facility) {
    notFound();
  }

  const today = getToday();
  const selectedDate = dateParam && dateParam >= today ? dateParam : today;
  const slots = await getAvailableSlots(id, selectedDate);

  // Calculate prev/next dates
  const selectedDateObj = new Date(selectedDate + "T00:00:00");
  const prevDateObj = new Date(selectedDateObj);
  prevDateObj.setDate(prevDateObj.getDate() - 1);
  const prevDate = prevDateObj.toISOString().split("T")[0];

  const nextDateObj = new Date(selectedDateObj);
  nextDateObj.setDate(nextDateObj.getDate() + 1);
  const nextDate = nextDateObj.toISOString().split("T")[0];

  const canGoPrev = prevDate >= today;

  return (
    <div className="p-4 space-y-4">
      <Link href="/bookings/facilities" className="text-sm text-primary hover:underline">
        &larr; Back to Facilities
      </Link>

      <Card>
        <CardContent className="pt-4 pb-4 space-y-3">
          <div className="flex items-start justify-between">
            <h2 className="text-xl font-bold">{facility.name}</h2>
            <Badge variant="secondary">
              {CATEGORY_LABELS[facility.category] ?? facility.category}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{facility.description}</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Member Rate:</span>{" "}
              <span className="font-medium">{formatMMK(facility.memberRate)}/hr</span>
            </div>
            <div>
              <span className="text-muted-foreground">Non-Member:</span>{" "}
              <span className="font-medium">{formatMMK(facility.nonMemberRate)}/hr</span>
            </div>
            <div>
              <span className="text-muted-foreground">Hours:</span>{" "}
              <span className="font-medium">
                {facility.openingTime.substring(0, 5)} - {facility.closingTime.substring(0, 5)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Capacity:</span>{" "}
              <span className="font-medium">{facility.maxCapacity}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date Navigation */}
      <div className="flex items-center justify-between">
        {canGoPrev ? (
          <Link
            href={`/bookings/facilities/${id}?date=${prevDate}`}
            className="text-sm text-primary hover:underline"
          >
            &larr; Prev Day
          </Link>
        ) : (
          <span className="text-sm text-muted-foreground">&larr; Prev Day</span>
        )}
        <span className="text-sm font-medium">{selectedDate}</span>
        <Link
          href={`/bookings/facilities/${id}?date=${nextDate}`}
          className="text-sm text-primary hover:underline"
        >
          Next Day &rarr;
        </Link>
      </div>

      {/* Booking Form with Slots */}
      <BookingForm
        facilityId={id}
        facilityName={facility.name}
        date={selectedDate}
        rate={facility.memberRate}
        slots={slots}
      />
    </div>
  );
}
