"use client";

import { useActionState } from "react";
import { updatePreferences } from "./actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function PreferencesForm({ emailNotifications }: { emailNotifications: boolean }) {
  const [state, formAction, isPending] = useActionState(updatePreferences, {});

  return (
    <form action={formAction} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="emailNotifications" className="text-sm font-medium">
            Email Notifications
          </Label>
          <p className="text-xs text-muted-foreground">
            Receive email alerts for bills, bookings, and announcements
          </p>
        </div>
        <input
          type="checkbox"
          id="emailNotifications"
          name="emailNotifications"
          defaultChecked={emailNotifications}
          className="h-5 w-5 rounded border-input"
        />
      </div>

      <p className="text-xs text-muted-foreground italic">
        Push notifications will be available in a future update.
      </p>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-green-600 font-medium">Preferences updated successfully!</p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving..." : "Save Preferences"}
      </Button>
    </form>
  );
}
