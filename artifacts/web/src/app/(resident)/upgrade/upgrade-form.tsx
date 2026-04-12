"use client";

import { useActionState } from "react";
import { submitUpgradeRequest } from "./actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function UpgradeForm() {
  const [state, formAction, isPending] = useActionState(submitUpgradeRequest, {});

  if (state.success) {
    return (
      <div className="text-center py-4 space-y-3">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
        </div>
        <p className="text-foreground font-extrabold tracking-tight">
          Your upgrade request has been submitted successfully!
        </p>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Our team will review your request within 1–2 business days.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="unitNumber">Unit number</Label>
        <Input
          id="unitNumber"
          name="unitNumber"
          type="text"
          placeholder="e.g. A-12-03"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="residentId">Resident ID</Label>
        <Input
          id="residentId"
          name="residentId"
          type="text"
          placeholder="e.g. SC-2023-00142"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="developmentName">Development</Label>
        <select
          id="developmentName"
          name="developmentName"
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        >
          <option value="">Select development</option>
          <option value="City Loft">City Loft</option>
          <option value="Estella">Estella</option>
          <option value="ARA">ARA</option>
        </select>
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

      <Button type="submit" className="w-full h-11 font-bold" disabled={isPending}>
        {isPending ? "Submitting..." : "Submit upgrade request"}
      </Button>
    </form>
  );
}
