import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useListFacilities, getListFacilitiesQueryKey, useGetFacilitySlots, getGetFacilitySlotsQueryKey, useCreateBooking, getListBookingsQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { formatMMK } from "@/lib/format";
import { ChevronLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function BookingDetailPage() {
  const { id: facilityId } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const today = new Date().toISOString().split("T")[0]!;
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const { data: facilities } = useListFacilities({
    query: { queryKey: getListFacilitiesQueryKey() }
  });

  const facility = facilities?.find(f => f.id === facilityId);

  const { data: slots, isLoading: slotsLoading } = useGetFacilitySlots(
    facilityId,
    { date: selectedDate },
    { query: { queryKey: getGetFacilitySlotsQueryKey(facilityId, { date: selectedDate }), enabled: !!facilityId } }
  );

  const createMutation = useCreateBooking({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
        setConfirmed(true);
      },
      onError: () => {
        toast({ title: "Booking failed", description: "Please try again.", variant: "destructive" });
      },
    },
  });

  const selectedSlotData = slots?.find(s => s.id === selectedSlot);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0]!;
  });

  if (confirmed) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Booking Confirmed!</h2>
          <p className="text-muted-foreground text-sm mt-2 mb-6">
            Your {facility?.name} booking for {selectedDate} at {selectedSlotData?.startTime} has been confirmed.
          </p>
          <Button onClick={() => setLocation("/bookings")} className="w-full" data-testid="button-view-bookings">
            View My Bookings
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-enter">
        <div className="bg-primary px-4 pt-12 pb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation("/bookings")} className="p-2 bg-primary-foreground/10 rounded-full" data-testid="button-back">
              <ChevronLeft className="w-4 h-4 text-primary-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-primary-foreground line-clamp-1">
              {facility?.name ?? "Book Facility"}
            </h1>
          </div>
        </div>

        <div className="px-4 py-4 pb-8 space-y-5">
          {facility && (
            <div className="bg-card border border-card-border rounded-xl p-4">
              <p className="font-semibold text-foreground">{facility.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{facility.description}</p>
              <div className="flex gap-4 mt-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Rate</p>
                  <p className="font-medium">{formatMMK(facility.nonMemberRate)}/hr</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Hours</p>
                  <p className="font-medium">{facility.openingTime}–{facility.closingTime}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Capacity</p>
                  <p className="font-medium">{facility.maxCapacity} pax</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-sm mb-3">Select Date</h3>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {dates.map(date => {
                const d = new Date(date);
                const isToday = date === today;
                return (
                  <button
                    key={date}
                    onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                    className={`flex-shrink-0 flex flex-col items-center px-3 py-2.5 rounded-xl border transition-all ${
                      selectedDate === date
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                    data-testid={`date-${date}`}
                  >
                    <span className="text-[10px] font-medium uppercase">
                      {isToday ? "Today" : d.toLocaleDateString("en-GB", { weekday: "short" })}
                    </span>
                    <span className="text-lg font-bold">{d.getDate()}</span>
                    <span className="text-[10px]">{d.toLocaleDateString("en-GB", { month: "short" })}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">Select Time Slot</h3>
            {slotsLoading ? (
              <div className="grid grid-cols-3 gap-2">
                {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {(slots ?? []).map(slot => (
                  <button
                    key={slot.id}
                    onClick={() => slot.isAvailable && setSelectedSlot(slot.id)}
                    disabled={!slot.isAvailable}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      !slot.isAvailable
                        ? "border-border bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                        : selectedSlot === slot.id
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card hover:border-primary/40"
                    }`}
                    data-testid={`slot-${slot.id}`}
                  >
                    <p className="text-xs font-semibold">{slot.startTime}</p>
                    <p className="text-xs opacity-70">{slot.endTime}</p>
                    {slot.isAvailable && (
                      <p className="text-[10px] mt-0.5 font-medium">{formatMMK(slot.price)}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedSlot && selectedSlotData && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <p className="text-sm font-medium">Booking Summary</p>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{selectedDate}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span>{selectedSlotData.startTime}–{selectedSlotData.endTime}</span></div>
                <div className="flex justify-between font-semibold"><span>Total</span><span>{formatMMK(selectedSlotData.price)}</span></div>
              </div>
              <Button
                className="w-full mt-4 h-11"
                onClick={() => createMutation.mutate({ data: { facilityId, date: selectedDate, slotId: selectedSlot } })}
                disabled={createMutation.isPending}
                data-testid="button-confirm-booking"
              >
                {createMutation.isPending ? "Confirming..." : "Confirm Booking"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
