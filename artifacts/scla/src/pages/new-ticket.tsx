import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateTicket, getListTicketsQueryKey, getGetTicketSummaryQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const CATEGORIES = [
  { value: "electricals", label: "Electricals" },
  { value: "plumbing", label: "Plumbing" },
  { value: "housekeeping", label: "Housekeeping" },
  { value: "air_conditioning", label: "Air Conditioning" },
  { value: "pest_control", label: "Pest Control" },
  { value: "civil_works", label: "Civil Works" },
  { value: "general_enquiry", label: "General Enquiry" },
  { value: "other", label: "Other" },
];

const SERVICE_TYPES: Record<string, string[]> = {
  electricals: ["Power outage", "Faulty socket", "Light fixture", "Wiring issue"],
  plumbing: ["Pipe leak", "Blocked drain", "Water pressure", "Toilet issue"],
  housekeeping: ["Deep cleaning", "Pest removal", "Waste collection", "General cleaning"],
  air_conditioning: ["AC not cooling", "AC noise", "AC leak", "AC maintenance"],
  pest_control: ["Cockroaches", "Mosquitoes", "Ants", "Rodents"],
  civil_works: ["Wall cracks", "Flooring", "Door/window", "Ceiling"],
  general_enquiry: ["Billing enquiry", "Facility enquiry", "General query", "Other"],
  other: ["Other"],
};

export default function NewTicketPage() {
  const [, setLocation] = useLocation();
  const { user, isResident } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: "",
    category: "",
    serviceType: "",
    unitNumber: isResident ? user?.unitNumber ?? "" : "",
    description: "",
  });

  const createMutation = useCreateTicket({
    mutation: {
      onSuccess: (ticket) => {
        queryClient.invalidateQueries({ queryKey: getListTicketsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTicketSummaryQueryKey() });
        toast({ title: "Ticket created", description: `${ticket.ticketNumber} — we'll be in touch shortly.` });
        setLocation(`/star-assist/${ticket.id}`);
      },
      onError: () => {
        toast({ title: "Failed to create ticket", variant: "destructive" });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category || !form.serviceType) {
      toast({ title: "Please select a category and service type", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      data: {
        title: form.title,
        category: form.category as "electricals" | "plumbing" | "housekeeping" | "general_enquiry" | "air_conditioning" | "pest_control" | "civil_works" | "other",
        serviceType: form.serviceType,
        unitNumber: form.unitNumber || null,
        description: form.description,
      }
    });
  };

  const serviceTypes = form.category ? SERVICE_TYPES[form.category] ?? [] : [];

  return (
    <AppLayout>
      <div className="page-enter">
        <div className="bg-primary px-4 pt-12 pb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation("/star-assist")} className="p-2 bg-primary-foreground/10 rounded-full" data-testid="button-back">
              <ChevronLeft className="w-4 h-4 text-primary-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-primary-foreground">New Ticket</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4 pb-8">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              placeholder="Brief description of your issue"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
              data-testid="input-title"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, category: cat.value, serviceType: "" }))}
                  className={`p-3 rounded-xl border text-sm font-medium text-left transition-all ${
                    form.category === cat.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                  data-testid={`category-${cat.value}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {form.category && (
            <div className="space-y-1.5">
              <Label>Service Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {serviceTypes.map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, serviceType: st }))}
                    className={`p-2.5 rounded-xl border text-sm font-medium text-left transition-all ${
                      form.serviceType === st
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    }`}
                    data-testid={`service-type-${st.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(isResident || form.category === "general_enquiry") && (
            <div className="space-y-1.5">
              <Label>Unit Number {!isResident && "(optional)"}</Label>
              <Input
                placeholder="e.g. A-12-03"
                value={form.unitNumber}
                onChange={e => setForm(f => ({ ...f, unitNumber: e.target.value }))}
                readOnly={isResident && !!user?.unitNumber}
                data-testid="input-unit"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Description</Label>
            <textarea
              className="w-full min-h-[120px] px-3 py-2 text-sm border border-input rounded-xl bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Please describe your issue in detail..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              required
              data-testid="input-description"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold"
            disabled={createMutation.isPending}
            data-testid="button-submit-ticket"
          >
            {createMutation.isPending ? "Submitting..." : "Submit Ticket"}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
