"use client";

import { useActionState } from "react";
import { updateProfile } from "./actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function EditForm({ name, phone }: { name: string; phone: string }) {
  const [state, formAction, isPending] = useActionState(updateProfile, {});

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          defaultValue={name}
          required
          minLength={2}
          maxLength={100}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" type="tel" defaultValue={phone} required />
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
          <span>Profile updated successfully!</span>
        </div>
      ) : null}

      <Button type="submit" className="w-full h-11 font-bold" disabled={isPending}>
        {isPending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
