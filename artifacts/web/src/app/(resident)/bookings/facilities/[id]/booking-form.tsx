"use client";

import { useActionState, useState } from "react";
import { bookSlot } from "./book-action";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";

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
      <div className="text-center py-4 space-y-3">
        <p className="text-green-600 font-medium">Booking confirmed!</p>
        {state.bookingNumber && (
          <p className="text-sm text-muted-foreground">Booking #: {state.bookingNumber}</p>
        )}
        <Link href="/bookings" className="text-primary hover:underline text-sm">
          View your bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold">Available Slots</h3>

      {slots.length === 0 ? (
        <p className="text-sm text-muted-foreground">No slots available for this date.</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {slots.map((slot) => (
            <button
              key={slot.startTime}
              type="button"
              disabled={slot.isBooked}
              onClick={() =>
                setSelectedSlot(selectedSlot === slot.startTime ? null : slot.startTime)
              }
              className={`rounded-md border px-2 py-2 text-sm transition-colors ${
                slot.isBooked
                  ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                  : selectedSlot === slot.startTime
                    ? "bg-primary text-primary-foreground border-primary"
                    : "hover:bg-muted/50 cursor-pointer"
              }`}
            >
              {slot.startTime} - {slot.endTime}
            </button>
          ))}
        </div>
      )}

      {selectedSlot && (
        <form action={formAction} className="space-y-4">
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

          {/* Recurring Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="recurring"
              name="recurring"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="recurring" className="text-sm cursor-pointer">
              Repeat weekly
            </Label>
          </div>

          {recurring && (
            <div className="space-y-2">
              <Label htmlFor="weeks">Number of weeks</Label>
              <select
                id="weeks"
                name="weeks"
                value={weeks}
                onChange={(e) => setWeeks(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
              >
                <option value="4">4 weeks</option>
                <option value="8">8 weeks</option>
                <option value="12">12 weeks</option>
              </select>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              maxLength={500}
              placeholder="Any special requirements..."
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
            />
          </div>

          {state.error && <p className="text-sm text-red-600">{state.error}</p>}

          <div className="text-sm text-muted-foreground">
            Total:{" "}
            <span className="font-medium text-foreground">
              {Number(rate).toLocaleString()} MMK
              {recurring ? ` x ${weeks} weeks` : ""}
            </span>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Booking..." : recurring ? `Book ${weeks} Weekly Slots` : "Book Slot"}
          </Button>
        </form>
      )}
    </div>
  );
}
