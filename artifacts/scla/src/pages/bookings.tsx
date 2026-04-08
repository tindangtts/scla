import { useState } from "react";
import { useLocation } from "wouter";
import { useListFacilities, getListFacilitiesQueryKey, useListBookings, getListBookingsQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { formatMMK } from "@/lib/format";
import { ChevronRight, Calendar, Dumbbell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const FACILITY_ICONS: Record<string, string> = {
  swimming_pool: "Pool", tennis_court: "Tennis", basketball_court: "Basketball",
  gym: "Gym", badminton_court: "Badminton", function_room: "Function", squash_court: "Squash",
};

export default function BookingsPage() {
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<"facilities" | "mybookings">("facilities");

  const { data: facilities, isLoading: facLoading } = useListFacilities({
    query: { queryKey: getListFacilitiesQueryKey() }
  });

  const { data: bookings, isLoading: bookLoading } = useListBookings(
    {},
    { query: { queryKey: getListBookingsQueryKey({}) } }
  );

  return (
    <AppLayout>
      <div className="page-enter">
        <div className="bg-primary px-4 pt-12 pb-4">
          <h1 className="text-lg font-semibold text-primary-foreground mb-4">SCSC Bookings</h1>
          <div className="flex gap-1 bg-primary-foreground/10 p-1 rounded-xl">
            {(["facilities", "mybookings"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === t ? "bg-primary-foreground text-primary shadow-sm" : "text-primary-foreground/70"
                }`}
                data-testid={`tab-${t}`}
              >
                {t === "facilities" ? "Facilities" : "My Bookings"}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 py-4 pb-6 space-y-3">
          {tab === "facilities" ? (
            facLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
              </div>
            ) : (facilities ?? []).map(facility => (
              <div
                key={facility.id}
                className="bg-card border border-card-border rounded-xl p-4 cursor-pointer hover:bg-muted transition-colors"
                onClick={() => setLocation(`/bookings/${facility.id}`)}
                data-testid={`card-facility-${facility.id}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex-shrink-0 flex flex-col items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-primary mb-0.5" />
                    <span className="text-[9px] text-primary font-medium text-center leading-tight">
                      {FACILITY_ICONS[facility.category] ?? "Sport"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">{facility.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{facility.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="text-primary font-medium">From {formatMMK(facility.nonMemberRate)}/hr</span>
                      <span className="text-muted-foreground">{facility.openingTime}–{facility.closingTime}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              </div>
            ))
          ) : (
            bookLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
              </div>
            ) : !bookings || bookings.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium text-foreground">No bookings yet</p>
                <p className="text-muted-foreground text-sm mt-1">Browse facilities to make your first booking.</p>
              </div>
            ) : (
              bookings.map(booking => (
                <div
                  key={booking.id}
                  className="bg-card border border-card-border rounded-xl p-4"
                  data-testid={`card-booking-${booking.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full mb-2 inline-block ${
                        booking.status === "upcoming" ? "badge-upcoming" :
                        booking.status === "completed" ? "badge-completed" : "badge-cancelled"
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                      <p className="font-semibold text-sm text-foreground">{booking.facilityName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {booking.date} · {booking.startTime}–{booking.endTime}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{formatMMK(booking.totalAmount)}</p>
                      <p className="text-xs text-muted-foreground">{booking.bookingNumber}</p>
                    </div>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </AppLayout>
  );
}
