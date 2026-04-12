"use client";

import { useActionState } from "react";
import { cancelBooking } from "./cancel-action";
import { Button } from "@/components/ui/button";

export function CancelButton({
  bookingId,
  hasRecurringGroup,
}: {
  bookingId: string;
  hasRecurringGroup: boolean;
}) {
  const [state, formAction, isPending] = useActionState(cancelBooking, {});

  return (
    <div className="space-y-3">
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      {/* Single Cancel */}
      <form
        action={formAction}
        onSubmit={(e) => {
          if (!window.confirm("Are you sure you want to cancel this booking?")) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="bookingId" value={bookingId} />
        <input type="hidden" name="mode" value="single" />
        <Button type="submit" variant="destructive" className="w-full" disabled={isPending}>
          {isPending ? "Cancelling..." : "Cancel Booking"}
        </Button>
      </form>

      {/* Bulk Cancel for Recurring */}
      {hasRecurringGroup && (
        <form
          action={formAction}
          onSubmit={(e) => {
            if (
              !window.confirm(
                "Are you sure you want to cancel ALL future bookings in this recurring group?",
              )
            ) {
              e.preventDefault();
            }
          }}
        >
          <input type="hidden" name="bookingId" value={bookingId} />
          <input type="hidden" name="mode" value="bulk" />
          <Button
            type="submit"
            variant="outline"
            className="w-full border-destructive text-destructive hover:bg-destructive/10"
            disabled={isPending}
          >
            {isPending ? "Cancelling..." : "Cancel All Future Recurring"}
          </Button>
        </form>
      )}
    </div>
  );
}
