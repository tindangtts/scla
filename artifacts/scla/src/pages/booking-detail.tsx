import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useListFacilities, getListFacilitiesQueryKey, useGetFacilitySlots, getGetFacilitySlotsQueryKey, useCreateBooking, getListBookingsQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { formatMMK } from "@/lib/format";
import { ChevronLeft, CheckCircle, Clock, Users, MapPin, Repeat2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

export default function BookingDetailPage() {
  const { id: facilityId } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const today = new Date().toISOString().split("T")[0]!;
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [repeatWeekly, setRepeatWeekly] = useState(false);

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
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center page-enter">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
            <CheckCircle className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">Booking Confirmed!</h2>
          <p className="text-muted-foreground text-sm font-medium mt-3 mb-8 leading-relaxed">
            Your <span className="font-bold text-foreground">{facility?.name}</span> booking for{' '}
            <span className="font-bold text-foreground">{selectedDate}</span> at{' '}
            <span className="font-bold text-foreground">{selectedSlotData?.startTime}</span> has been confirmed.
            {repeatWeekly && (
              <span className="block mt-2 text-primary font-bold">4 weekly bookings created.</span>
            )}
          </p>
          <Button onClick={() => setLocation("/bookings")} className="w-full h-14 rounded-2xl text-base font-bold shadow-lg" data-testid="button-view-bookings">
            View My Bookings
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-enter bg-slate-50 min-h-full">
        <div className="bg-gradient-teal px-5 pt-14 pb-8 rounded-b-[2rem] shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full" />
          <div className="relative z-10 flex items-center gap-3">
            <button onClick={() => setLocation("/bookings")} className="p-2.5 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors" data-testid="button-back">
              <ChevronLeft className="w-5 h-5 text-primary-foreground" />
            </button>
            <h1 className="text-xl font-extrabold text-primary-foreground tracking-tight line-clamp-1">
              {facility?.name ?? "Book Facility"}
            </h1>
          </div>
        </div>

        <div className="px-5 py-6 pb-12 space-y-6 -mt-4 relative z-20">
          {facility && (
            <div className="bg-card border border-card-border rounded-[1.5rem] p-6 shadow-sm">
              <h2 className="font-extrabold text-lg text-foreground flex items-center gap-2 mb-2"><MapPin className="w-5 h-5 text-primary"/> {facility.name}</h2>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed">{facility.description}</p>
              
              <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-border/50">
                <div className="bg-muted/50 p-3 rounded-xl text-center">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Rate</p>
                  <p className="font-bold text-sm text-primary">{formatMMK(facility.nonMemberRate)}<span className="text-[10px] text-muted-foreground">/hr</span></p>
                </div>
                <div className="bg-muted/50 p-3 rounded-xl text-center">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Hours</p>
                  <p className="font-bold text-xs text-foreground flex items-center justify-center gap-1 mt-1"><Clock className="w-3 h-3"/> {facility.openingTime}-{facility.closingTime.split(":")[0]}</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-xl text-center">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Max</p>
                  <p className="font-bold text-xs text-foreground flex items-center justify-center gap-1 mt-1"><Users className="w-3 h-3"/> {facility.maxCapacity} pax</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-4 px-1">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">1</span>
              <h3 className="font-extrabold text-base tracking-tight">{t("bookings.selectDate")}</h3>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-1">
              {dates.map(date => {
                const d = new Date(date);
                const isToday = date === today;
                return (
                  <button
                    key={date}
                    onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                    className={`flex-shrink-0 flex flex-col items-center min-w-[72px] py-3 rounded-2xl border-2 transition-all shadow-sm ${
                      selectedDate === date
                        ? "border-primary bg-primary text-primary-foreground scale-105"
                        : "border-transparent bg-card text-foreground hover:border-primary/30"
                    }`}
                    data-testid={`date-${date}`}
                  >
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedDate === date ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {isToday ? t("bookings.today") : d.toLocaleDateString("en-GB", { weekday: "short" })}
                    </span>
                    <span className="text-2xl font-black mt-0.5">{d.getDate()}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedDate === date ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{d.toLocaleDateString("en-GB", { month: "short" })}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4 px-1">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">2</span>
              <h3 className="font-extrabold text-base tracking-tight">{t("bookings.selectTime")}</h3>
            </div>
            {slotsLoading ? (
              <div className="grid grid-cols-3 gap-3">
                {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-16 rounded-2xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {(slots ?? []).map(slot => (
                  <button
                    key={slot.id}
                    onClick={() => slot.isAvailable && setSelectedSlot(slot.id)}
                    disabled={!slot.isAvailable}
                    className={`p-3 rounded-2xl border-2 transition-all ${
                      !slot.isAvailable
                        ? "border-transparent bg-muted/50 text-muted-foreground opacity-50 cursor-not-allowed"
                        : selectedSlot === slot.id
                          ? "border-primary bg-primary/10 text-primary shadow-inner scale-[0.98]"
                          : "border-transparent bg-card text-foreground hover:border-primary/30 shadow-sm"
                    }`}
                    data-testid={`slot-${slot.id}`}
                  >
                    <p className="text-sm font-black tracking-tight">{slot.startTime}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">{slot.endTime}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedSlot && selectedSlotData && (
            <div className="bg-card border-2 border-primary/20 rounded-[1.5rem] p-6 shadow-lg shadow-primary/5 animate-in slide-in-from-bottom-4">
              <p className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground mb-4">{t("bookings.summary")}</p>
              <div className="space-y-3 text-sm font-medium">
                <div className="flex justify-between items-center"><span className="text-muted-foreground">{t("bookings.date")}</span><span className="font-bold bg-muted px-2 py-1 rounded-md">{selectedDate}</span></div>
                <div className="flex justify-between items-center"><span className="text-muted-foreground">{t("bookings.time")}</span><span className="font-bold bg-muted px-2 py-1 rounded-md">{selectedSlotData.startTime} – {selectedSlotData.endTime}</span></div>
                <div className="flex justify-between items-center pt-3 border-t border-border/50">
                  <span className="font-extrabold text-foreground">{t("bookings.total")}</span>
                  <span className="font-black text-xl text-primary">{formatMMK(selectedSlotData.price)}</span>
                </div>
              </div>
              {/* Repeat Weekly Toggle */}
              <button
                type="button"
                onClick={() => setRepeatWeekly(v => !v)}
                className={`w-full flex items-center justify-between py-4 px-1 rounded-2xl transition-all ${
                  repeatWeekly ? 'text-primary' : 'text-muted-foreground'
                }`}
                data-testid="toggle-repeat-weekly"
              >
                <div className="flex items-center gap-3">
                  <Repeat2 className="w-5 h-5" />
                  <div className="text-left">
                    <p className="text-sm font-bold text-foreground">{t("bookings.repeatWeekly")}</p>
                    <p className="text-xs font-medium text-muted-foreground mt-0.5">
                      Creates 4 bookings on the same time slot
                    </p>
                  </div>
                </div>
                {/* Toggle pill */}
                <div className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                  repeatWeekly ? 'bg-primary' : 'bg-muted'
                }`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                    repeatWeekly ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </div>
              </button>
              <Button
                className="w-full mt-6 h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/20"
                onClick={() => createMutation.mutate({ data: { facilityId, date: selectedDate, slotId: selectedSlot, recurring: repeatWeekly } })}
                disabled={createMutation.isPending}
                data-testid="button-confirm-booking"
              >
                {createMutation.isPending ? t("bookings.confirming") : t("bookings.confirm")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
