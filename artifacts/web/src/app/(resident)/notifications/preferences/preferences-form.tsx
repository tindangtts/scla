"use client";

import { useActionState } from "react";
import { updatePreferences } from "./actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Mail, Bell } from "lucide-react";

export function PreferencesForm({ emailNotifications }: { emailNotifications: boolean }) {
  const [state, formAction, isPending] = useActionState(updatePreferences, {});

  return (
    <form action={formAction} className="space-y-5">
      <label className="flex items-start justify-between gap-3 px-3 py-3 rounded-xl border border-border bg-muted/40 cursor-pointer hover:bg-muted transition-colors">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
            <Mail className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <Label htmlFor="emailNotifications" className="text-sm font-bold cursor-pointer">
              Email notifications
            </Label>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
              Alerts for bills, bookings, and announcements.
            </p>
          </div>
        </div>
        <input
          type="checkbox"
          id="emailNotifications"
          name="emailNotifications"
          defaultChecked={emailNotifications}
          className="h-5 w-5 rounded border-input accent-primary shrink-0 mt-1"
        />
      </label>

      <div className="flex items-start gap-3 px-3 py-3 rounded-xl border border-dashed border-border bg-card/40 opacity-70">
        <div className="p-2 rounded-xl bg-secondary text-secondary-foreground shrink-0">
          <Bell className="w-4 h-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold">Push notifications</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 font-medium italic">
            Coming in a future update.
          </p>
        </div>
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
      {state.success ? (
        <div
          className="flex items-start gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/5 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300"
          role="status"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>Preferences updated successfully!</span>
        </div>
      ) : null}

      <Button type="submit" className="w-full h-11 font-bold" disabled={isPending}>
        {isPending ? "Saving..." : "Save preferences"}
      </Button>
    </form>
  );
}
