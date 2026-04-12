import { AppSubHeader } from "@/components/layout/app-header";
import { TicketForm } from "./ticket-form";

export default function NewTicketPage() {
  return (
    <>
      <AppSubHeader
        title="New Star Assist"
        backHref="/star-assist"
        backLabel="All tickets"
      />

      <div className="px-5 -mt-6 pb-8 relative z-20 space-y-4">
        <div className="rounded-2xl bg-card border border-card-border p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-base font-bold tracking-tight">Submit a maintenance request</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Describe the issue — our estate team will follow up within 24 hours.
            </p>
          </div>
          <TicketForm />
        </div>
      </div>
    </>
  );
}
