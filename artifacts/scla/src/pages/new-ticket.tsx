import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useCreateTicket, getListTicketsQueryKey, getGetTicketSummaryQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, ChevronLeft, HelpCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const CATEGORIES = [
  { value: "electricals", label: "Electricals" },
  { value: "plumbing", label: "Plumbing" },
  { value: "housekeeping", label: "Housekeeping" },
  { value: "air_conditioning", label: "A/C" },
  { value: "pest_control", label: "Pest Control" },
  { value: "civil_works", label: "Civil Works" },
  { value: "general_enquiry", label: "Enquiry" },
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
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: "",
    category: "",
    serviceType: "",
    unitNumber: isResident ? user?.unitNumber ?? "" : "",
    description: "",
    attachmentUrl: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 5MB limit: 5 * 1024 * 1024 bytes
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Maximum file size is 5MB.", variant: "destructive" });
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm(f => ({ ...f, attachmentUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

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
        attachmentUrl: form.attachmentUrl || null,
      }
    });
  };

  const serviceTypes = form.category ? SERVICE_TYPES[form.category] ?? [] : [];

  return (
    <AppLayout>
      <div className="page-enter bg-slate-50 min-h-full">
        <div className="bg-gradient-teal px-5 pt-14 pb-8 rounded-b-[2rem] shadow-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 blur-3xl rounded-full pointer-events-none" />
          <div className="relative z-10 flex items-center gap-3">
            <button onClick={() => setLocation("/star-assist")} className="p-2.5 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors" data-testid="button-back">
              <ChevronLeft className="w-5 h-5 text-primary-foreground" />
            </button>
            <h1 className="text-xl font-extrabold text-primary-foreground tracking-tight">{t("ticket.new.title")}</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-6 space-y-6 pb-12 -mt-4 relative z-20">
          <div className="bg-card rounded-[1.5rem] p-6 shadow-sm border border-card-border space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("ticket.new.shortTitle")}</Label>
              <Input
                placeholder="E.g. Leaking pipe in master bathroom"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
                className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-primary shadow-sm"
                data-testid="input-title"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("ticket.new.category")}</Label>
              <div className="grid grid-cols-2 gap-2.5">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, category: cat.value, serviceType: "" }))}
                    className={`px-3 py-3 rounded-xl border-2 text-sm font-bold text-center transition-all ${
                      form.category === cat.value
                        ? "border-primary bg-primary/10 text-primary shadow-inner scale-[0.98]"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground shadow-sm"
                    }`}
                    data-testid={`category-${cat.value}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {form.category && (
              <div className="space-y-3 pt-2 border-t border-border/50 animate-in fade-in slide-in-from-top-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("ticket.new.serviceType")}</Label>
                <div className="grid grid-cols-2 gap-2.5">
                  {serviceTypes.map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, serviceType: st }))}
                      className={`px-3 py-2.5 rounded-xl border text-[13px] font-bold text-center transition-all ${
                        form.serviceType === st
                          ? "border-primary bg-primary text-primary-foreground shadow-md"
                          : "border-border bg-background text-muted-foreground hover:border-primary/40"
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
              <div className="space-y-2 pt-2 border-t border-border/50">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("ticket.new.unit")} {!isResident && "(optional)"}</Label>
                <Input
                  placeholder="e.g. A-12-03"
                  value={form.unitNumber}
                  onChange={e => setForm(f => ({ ...f, unitNumber: e.target.value }))}
                  readOnly={isResident && !!user?.unitNumber}
                  className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-primary shadow-sm"
                  data-testid="input-unit"
                />
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-border/50">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("ticket.new.description")}</Label>
              <textarea
                className="w-full min-h-[140px] p-4 text-sm font-medium border-transparent rounded-2xl bg-muted/50 resize-none focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
                placeholder="Please describe your issue in detail..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                required
                data-testid="input-description"
              />
            </div>

            {/* Photo attachment */}
            <div className="space-y-3 pt-2 border-t border-border/50">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("ticket.new.attachment")} <span className="font-normal normal-case">({t("ticket.new.attachmentHint")})</span>
              </Label>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
                data-testid="input-attachment"
              />

              {form.attachmentUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-border bg-muted">
                  <img
                    src={form.attachmentUrl}
                    alt="Attachment preview"
                    className="w-full max-h-48 object-cover"
                    data-testid="preview-attachment"
                  />
                  <button
                    type="button"
                    onClick={() => { setForm(f => ({ ...f, attachmentUrl: "" })); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
                    data-testid="button-remove-attachment"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground hover:border-primary/40 hover:text-primary transition-all"
                  data-testid="button-attach-photo"
                >
                  <Camera className="w-5 h-5" />
                  <span className="text-sm font-bold">{t("ticket.new.attachment")}</span>
                </button>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-14 rounded-2xl text-base font-extrabold shadow-lg shadow-primary/20"
            disabled={createMutation.isPending}
            data-testid="button-submit-ticket"
          >
            {createMutation.isPending ? t("ticket.new.submitting") : t("ticket.new.submit")}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
