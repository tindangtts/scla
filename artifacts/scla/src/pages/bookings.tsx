import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useListFacilities, getListFacilitiesQueryKey, useListBookings, getListBookingsQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { formatMMK } from "@/lib/format";
import { ChevronRight, Calendar, Dumbbell, MapPin, Clock, Repeat2, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const FACILITY_ICONS: Record<string, string> = {
  swimming_pool: "Pool", tennis_court: "Tennis", basketball_court: "Basketball",
  gym: "Gym", badminton_court: "Badminton", function_room: "Function", squash_court: "Squash",
};

export default function BookingsPage() {
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<"facilities" | "mybookings">("facilities");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const API_BASE = import.meta.env.VITE_API_URL ?? "/api";
  const token = localStorage.getItem("token") ?? "";

  const cancelGroupMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/cancel-group`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to cancel');
      return res.json();
    },
    onSuccess: (data: { cancelled: number }) => {
      queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey({}) });
      toast({ title: `${data.cancelled} booking${data.cancelled !== 1 ? 's' : ''} cancelled` });
    },
    onError: () => {
      toast({ title: 'Failed to cancel bookings', variant: 'destructive' });
    },
  });

  const { data: facilities, isLoading: facLoading } = useListFacilities({
    query: { queryKey: getListFacilitiesQueryKey() }
  });

  const { data: bookings, isLoading: bookLoading } = useListBookings(
    {},
    { query: { queryKey: getListBookingsQueryKey({}) } }
  );

  return (
    <AppLayout>
      <div className="page-enter bg-slate-50 min-h-full">
        <div className="bg-gradient-teal px-5 pt-14 pb-8 rounded-b-[2.5rem] shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full" />
          
          <h1 className="text-2xl font-black text-primary-foreground tracking-tight mb-5 relative z-10">SCSC Bookings</h1>
          
          <div className="flex gap-2 bg-black/20 p-1.5 rounded-2xl backdrop-blur-md relative z-10">
            {(["facilities", "mybookings"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  tab === t 
                    ? "bg-white text-primary shadow-md scale-[1.02]" 
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
                data-testid={`tab-${t}`}
              >
                {t === "facilities" ? <MapPin className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                {t === "facilities" ? "Facilities" : "My Bookings"}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 py-6 pb-10 space-y-4">
          {tab === "facilities" ? (
            facLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-[1.5rem]" />)}
              </div>
            ) : (facilities ?? []).map(facility => (
              <div
                key={facility.id}
                className="bg-card border border-card-border rounded-[1.5rem] p-5 cursor-pointer shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                onClick={() => setLocation(`/bookings/${facility.id}`)}
                data-testid={`card-facility-${facility.id}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex-shrink-0 flex flex-col items-center justify-center border border-primary/20">
                    <Dumbbell className="w-6 h-6 text-primary mb-1" />
                    <span className="text-[9px] text-primary font-black uppercase tracking-wider text-center leading-tight">
                      {FACILITY_ICONS[facility.category] ?? "Sport"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-base text-foreground leading-tight">{facility.name}</p>
                    <p className="text-xs font-medium text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{facility.description}</p>
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50">
                      <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded-md">{formatMMK(facility.nonMemberRate)}/hr</span>
                      <span className="text-xs font-bold text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {facility.openingTime}–{facility.closingTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            bookLoading ? (
              <div className="space-y-4">
                {[1, 2].map(i => <Skeleton key={i} className="h-28 w-full rounded-[1.5rem]" />)}
              </div>
            ) : !bookings || bookings.length === 0 ? (
              <div className="text-center py-20 px-4">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                  <Calendar className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <p className="font-extrabold text-xl text-foreground">No bookings yet</p>
                <p className="text-muted-foreground font-medium text-sm mt-2">Browse facilities to make your first booking.</p>
              </div>
            ) : (
              bookings.map(booking => (
                <div
                  key={booking.id}
                  className="bg-card border border-card-border rounded-[1.5rem] p-5 shadow-sm hover:shadow-md transition-shadow"
                  data-testid={`card-booking-${booking.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center mb-3">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md inline-block ${
                          booking.status === "upcoming" ? "bg-blue-500/10 text-blue-700" :
                          booking.status === "completed" ? "bg-emerald-500/10 text-emerald-700" : "bg-muted text-muted-foreground"
                        }`}>
                          {booking.status}
                        </span>
                        {booking.recurringGroupId && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-violet-500/10 text-violet-700 ml-2">
                            <Repeat2 className="w-3 h-3" />
                            Recurring
                          </span>
                        )}
                      </div>
                      <p className="font-extrabold text-base text-foreground leading-tight">{booking.facilityName}</p>
                      <p className="text-sm font-bold text-muted-foreground mt-1.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> {booking.date} · {booking.startTime}–{booking.endTime}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-base text-foreground tracking-tight">{formatMMK(booking.totalAmount)}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">#{booking.bookingNumber}</p>
                    </div>
                  </div>
                  {booking.recurringGroupId && booking.status === 'upcoming' && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <button
                        onClick={() => cancelGroupMutation.mutate(booking.id)}
                        disabled={cancelGroupMutation.isPending}
                        className="flex items-center gap-2 text-xs font-bold text-destructive hover:text-destructive/80 transition-colors disabled:opacity-50"
                        data-testid={`button-cancel-group-${booking.id}`}
                      >
                        {cancelGroupMutation.isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Repeat2 className="w-3.5 h-3.5" />
                        )}
                        Cancel All Future
                      </button>
                    </div>
                  )}
                </div>
              ))
            )
          )}
        </div>
      </div>
    </AppLayout>
  );
}
