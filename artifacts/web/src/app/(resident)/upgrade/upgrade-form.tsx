"use client";

import { useActionState } from "react";
import { submitUpgradeRequest } from "./actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function UpgradeForm() {
  const [state, formAction, isPending] = useActionState(submitUpgradeRequest, {});

  if (state.success) {
    return (
      <div className="text-center py-4">
        <p className="text-green-600 font-medium">
          Your upgrade request has been submitted successfully!
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Our team will review your request within 1-2 business days.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="unitNumber">Unit Number</Label>
        <Input id="unitNumber" name="unitNumber" type="text" placeholder="e.g. A-12-03" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="residentId">Resident ID</Label>
        <Input
          id="residentId"
          name="residentId"
          type="text"
          placeholder="e.g. SC-2023-00142"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="developmentName">Development</Label>
        <select
          id="developmentName"
          name="developmentName"
          required
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        >
          <option value="">Select development</option>
          <option value="City Loft">City Loft</option>
          <option value="Estella">Estella</option>
          <option value="ARA">ARA</option>
        </select>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Submitting..." : "Submit Upgrade Request"}
      </Button>
    </form>
  );
}
