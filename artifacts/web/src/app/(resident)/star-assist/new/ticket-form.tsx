"use client";

import { useActionState } from "react";
import { createTicket } from "./actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const CATEGORIES = [
  { value: "electricals", label: "Electricals" },
  { value: "plumbing", label: "Plumbing" },
  { value: "housekeeping", label: "Housekeeping" },
  { value: "general_enquiry", label: "General Enquiry" },
  { value: "air_conditioning", label: "Air Conditioning" },
  { value: "pest_control", label: "Pest Control" },
  { value: "civil_works", label: "Civil Works" },
  { value: "other", label: "Other" },
] as const;

export function TicketForm() {
  const [state, formAction, isPending] = useActionState(createTicket, {});

  if (state.success) {
    return (
      <div className="text-center py-4 space-y-3">
        <p className="text-green-600 font-medium">Your ticket has been submitted successfully!</p>
        {state.ticketId && (
          <p className="text-sm text-muted-foreground">Ticket ID: {state.ticketId}</p>
        )}
        <Link href="/star-assist" className="text-primary hover:underline text-sm">
          View your tickets
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          type="text"
          placeholder="Brief summary of the issue"
          required
          minLength={3}
          maxLength={200}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          name="category"
          required
          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="serviceType">Service Type</Label>
        <Input
          id="serviceType"
          name="serviceType"
          type="text"
          placeholder="e.g. Repair, Installation, Inspection"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          rows={4}
          required
          minLength={10}
          maxLength={2000}
          placeholder="Describe the issue in detail (min 10 characters)"
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="attachment">Attach Photo (optional, max 5MB)</Label>
        <input
          id="attachment"
          name="attachment"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Submitting..." : "Submit Ticket"}
      </Button>
    </form>
  );
}
