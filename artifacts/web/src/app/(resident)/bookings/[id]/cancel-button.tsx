"use client";

import { useActionState } from "react";
import { cancelBooking } from "./cancel-action";
import { Button } from "@/components/ui/button";
import { AlertCircle, X, Repeat } from "lucide-react";

export function CancelButton({
  bookingId,
  hasRecurringGroup,
}: {
  bookingId: string;
  hasRecurringGroup: boolean;
}) {
  const [state, formAction, isPending] = useActionState(cancelBooking, {});

  return (
    <div className="space-y-2.5">
      {state.error ? (
        <div
          className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/5 px-3 py-2.5 text-sm text-red-600"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{state.error}</span>
        </div>
      ) : null}

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
        <Button
          type="submit"
          variant="destructive"
          className="w-full h-11 rounded-xl font-bold"
          disabled={isPending}
        >
          <X className="w-4 h-4" aria-hidden="true" />
          {isPending ? "Cancelling..." : "Cancel booking"}
        </Button>
      </form>

      {hasRecurringGroup ? (
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
            className="w-full h-11 rounded-xl font-bold border-destructive/50 text-destructive hover:bg-destructive/10"
            disabled={isPending}
          >
            <Repeat className="w-4 h-4" aria-hidden="true" />
            {isPending ? "Cancelling..." : "Cancel all future recurring"}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
