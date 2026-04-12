"use client";

import { useActionState } from "react";
import { updateProfile } from "./actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function EditForm({ name, phone }: { name: string; phone: string }) {
  const [state, formAction, isPending] = useActionState(updateProfile, {});

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
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

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" type="tel" defaultValue={phone} required />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-green-600 font-medium">Profile updated successfully!</p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
