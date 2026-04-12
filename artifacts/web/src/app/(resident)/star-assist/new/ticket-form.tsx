"use client";

import { useActionState } from "react";
import { createTicket } from "./actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

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
      <div className="text-center py-6 space-y-4">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
        </div>
        <div>
          <p className="font-extrabold text-foreground tracking-tight">
            Your ticket has been submitted successfully!
          </p>
          {state.ticketId ? (
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              Ticket ID: {state.ticketId}
            </p>
          ) : null}
        </div>
        <Link
          href="/star-assist"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          View your tickets
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
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

      <div className="space-y-1.5">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          name="category"
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="serviceType">Service type</Label>
        <Input
          id="serviceType"
          name="serviceType"
          type="text"
          placeholder="Repair, Installation, Inspection…"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          required
          minLength={10}
          maxLength={2000}
          placeholder="Describe the issue in detail (minimum 10 characters)"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="attachment">Attach photo (optional, max 5MB)</Label>
        <input
          id="attachment"
          name="attachment"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm file:mr-3 file:border-0 file:bg-secondary file:text-secondary-foreground file:font-semibold file:rounded-md file:py-1 file:px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        />
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
        {isPending ? "Submitting..." : "Submit ticket"}
      </Button>
    </form>
  );
}
