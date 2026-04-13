"use client";

import { useActionState, useState } from "react";
import { bookSlot } from "./book-action";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMMK } from "@/lib/format";

interface Slot {
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export function BookingForm({
  facilityId,
  facilityName,
  date,
  rate,
  slots,
}: {
  facilityId: string;
  facilityName: string;
  date: string;
  rate: string;
  slots: Slot[];
}) {
  const [state, formAction, isPending] = useActionState(bookSlot, {});
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [recurring, setRecurring] = useState(false);
  const [weeks, setWeeks] = useState("4");

  if (state.success) {
    return (
      <div className="rounded-2xl bg-card border border-card-border p-6 shadow-sm text-center space-y-4">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
        </div>
        <div>
          <p className="font-extrabold text-foreground tracking-tight">Booking confirmed!</p>
          {state.bookingNumber ? (
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              Booking #: {state.bookingNumber}
            </p>
          ) : null}
        </div>
        <Link
          href="/bookings"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          View your bookings
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  const totalWeeks = recurring ? Number(weeks) || 1 : 1;
  const totalAmount = Number(rate) * totalWeeks;

  return (
    <div className="space-y-4">
      <section aria-labelledby="slots-heading" className="rounded-2xl bg-card border border-card-border p-5 shadow-sm">
        <h3 id="slots-heading" className="text-sm font-bold tracking-tight mb-3">
          Available Slots
        </h3>

        {slots.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No slots available for this date.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {slots.map((slot) => {
              const isSelected = selectedSlot === slot.startTime;
              return (
                <button
                  key={slot.startTime}
                  type="button"
                  disabled={slot.isBooked}
                  onClick={() =>
                    setSelectedSlot(isSelected ? null : slot.startTime)
                  }
                  className={cn(
                    "rounded-xl border px-2 py-2.5 text-xs font-bold transition-[border-color,background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring tabular-nums",
                    slot.isBooked
                      ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50 border-transparent"
                      : isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-[1.02]"
                        : "bg-background text-foreground border-border hover:border-primary/40 hover:bg-primary/5",
                  )}
                >
                  {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {selectedSlot ? (
        <form action={formAction} className="space-y-4 rounded-2xl bg-card border border-card-border p-5 shadow-sm">
          <h3 className="text-sm font-bold tracking-tight">Confirm booking</h3>
          <input type="hidden" name="facilityId" value={facilityId} />
          <input type="hidden" name="facilityName" value={facilityName} />
          <input type="hidden" name="date" value={date} />
          <input type="hidden" name="startTime" value={selectedSlot} />
          <input
            type="hidden"
            name="endTime"
            value={String(parseInt(selectedSlot.split(":")[0], 10) + 1).padStart(2, "0") + ":00"}
          />
          <input type="hidden" name="rate" value={rate} />

          <label className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
            <input
              type="checkbox"
              id="recurring"
              name="recurring"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            <span className="flex-1">
              <span className="block text-sm font-bold text-foreground">Repeat weekly</span>
              <span className="block text-xs text-muted-foreground">
                Book this time slot for multiple weeks in a row.
              </span>
            </span>
          </label>

          {recurring ? (
            <div className="space-y-1.5">
              <Label htmlFor="weeks">Number of weeks</Label>
              <select
                id="weeks"
                name="weeks"
                value={weeks}
                onChange={(e) => setWeeks(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              >
                <option value="4">4 weeks</option>
                <option value="8">8 weeks</option>
                <option value="12">12 weeks</option>
              </select>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={2}
              maxLength={500}
              placeholder="Any special requirements..."
            />
          </div>

          {state.error ? (
            <div
              className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-red-600"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{state.error}</span>
            </div>
          ) : null}

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Total
              </p>
              <p className="text-lg font-extrabold text-foreground tracking-tight tabular-nums">
                {formatMMK(totalAmount)}
              </p>
              {recurring ? (
                <p className="text-[11px] text-muted-foreground">
                  {formatMMK(rate)} × {weeks} weeks
                </p>
              ) : null}
            </div>
            <Button type="submit" className="h-11 px-6 font-bold" disabled={isPending}>
              {isPending ? "Booking..." : recurring ? `Book ${weeks} weekly slots` : "Book slot"}
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
