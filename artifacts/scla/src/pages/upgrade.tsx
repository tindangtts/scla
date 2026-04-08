import { useState } from "react";
import { useLocation } from "wouter";
import { useRequestResidentUpgrade } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, CheckCircle, ArrowUpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DEVELOPMENTS = ["City Loft", "Estella", "ARA"];

export default function UpgradePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    unitNumber: "",
    residentId: "",
    developmentName: DEVELOPMENTS[0]!,
  });

  const upgradeMutation = useRequestResidentUpgrade({
    mutation: {
      onSuccess: () => {
        setSubmitted(true);
      },
      onError: () => {
        toast({ title: "Submission failed", description: "Please check your details and try again.", variant: "destructive" });
      },
    },
  });

  if (submitted) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center page-enter">
          <div className="w-24 h-24 bg-emerald-100 rounded-[2rem] flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20 rotate-3">
            <CheckCircle className="w-12 h-12 text-emerald-600 -rotate-3" />
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">Request Submitted</h2>
          <p className="text-muted-foreground text-sm font-medium mt-3 mb-8 leading-relaxed">
            Your resident upgrade request is under review. Our team will verify your details within 1-2 working days.
          </p>
          <Button className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/20" onClick={() => setLocation("/")} data-testid="button-back-home">
            Return to Dashboard
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-enter bg-slate-50 min-h-full">
        <div className="bg-gradient-teal px-5 pt-14 pb-8 rounded-b-[2rem] shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full" />
          <div className="relative z-10 flex items-center gap-3">
            <button onClick={() => setLocation("/profile")} className="p-2.5 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors" data-testid="button-back">
              <ChevronLeft className="w-5 h-5 text-primary-foreground" />
            </button>
            <h1 className="text-xl font-extrabold text-primary-foreground tracking-tight">Upgrade Account</h1>
          </div>
        </div>

        <div className="px-5 py-6 pb-12 space-y-6 -mt-4 relative z-20">
          <div className="bg-gradient-gold rounded-[1.5rem] p-6 shadow-lg shadow-accent/10 text-accent-foreground flex items-start gap-4">
            <div className="bg-white/30 backdrop-blur-sm p-3 rounded-2xl flex-shrink-0">
              <ArrowUpCircle className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <p className="font-bold text-sm leading-snug">
                Link your StarCity unit to access bill payment, wallet balance, and resident-only bookings.
              </p>
            </div>
          </div>

          <form onSubmit={e => { e.preventDefault(); upgradeMutation.mutate({ data: form }); }} className="bg-card rounded-[1.5rem] p-6 shadow-sm border border-card-border space-y-6">
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Development</Label>
              <div className="grid grid-cols-3 gap-2">
                {DEVELOPMENTS.map(dev => (
                  <button
                    key={dev}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, developmentName: dev }))}
                    className={`py-3 rounded-xl border-2 text-[11px] font-bold uppercase tracking-wider transition-all ${
                      form.developmentName === dev
                        ? "border-primary bg-primary/10 text-primary shadow-inner scale-[0.98]"
                        : "border-border text-muted-foreground hover:border-primary/40 bg-background shadow-sm"
                    }`}
                    data-testid={`dev-${dev.toLowerCase().replace(" ", "-")}`}
                  >
                    {dev}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/50">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Unit Number</Label>
              <Input
                placeholder="e.g. A-12-03"
                value={form.unitNumber}
                onChange={e => setForm(f => ({ ...f, unitNumber: e.target.value }))}
                required
                className="h-14 rounded-2xl bg-muted/50 border-transparent focus:bg-background focus:border-primary shadow-sm text-base font-medium"
                data-testid="input-unit-number"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-border/50">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex justify-between">
                <span>Resident ID</span>
              </Label>
              <Input
                placeholder="e.g. SC-2023-00142"
                value={form.residentId}
                onChange={e => setForm(f => ({ ...f, residentId: e.target.value }))}
                required
                className="h-14 rounded-2xl bg-muted/50 border-transparent focus:bg-background focus:border-primary shadow-sm text-base font-mono"
                data-testid="input-resident-id"
              />
              <p className="text-[11px] font-medium text-muted-foreground mt-2 leading-relaxed">
                Found on your tenancy agreement or by contacting the management office.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-14 rounded-2xl text-base font-extrabold shadow-lg shadow-primary/20 mt-4"
              disabled={upgradeMutation.isPending}
              data-testid="button-submit-upgrade"
            >
              {upgradeMutation.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
