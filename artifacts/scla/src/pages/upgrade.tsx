import { useState } from "react";
import { useLocation } from "wouter";
import { useRequestResidentUpgrade } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const DEVELOPMENTS = ["City Loft", "Estella", "ARA"];

export default function UpgradePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
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
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold">Request Submitted</h2>
          <p className="text-muted-foreground text-sm mt-2">
            Your resident upgrade request is under review. Our team will verify your details within 1-2 working days.
          </p>
          <Button className="mt-6 w-full" onClick={() => setLocation("/")} data-testid="button-back-home">
            Back to Home
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-enter">
        <div className="bg-primary px-4 pt-12 pb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation("/profile")} className="p-2 bg-primary-foreground/10 rounded-full" data-testid="button-back">
              <ChevronLeft className="w-4 h-4 text-primary-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-primary-foreground">Upgrade to Resident</h1>
          </div>
        </div>

        <div className="px-4 py-4 pb-8">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-foreground">
              Link your StarCity unit to access bill payment, wallet balance, statement of account, and unit-specific services.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Your Resident ID can be found on your tenancy agreement or by contacting the management office.
            </p>
          </div>

          <form onSubmit={e => { e.preventDefault(); upgradeMutation.mutate({ data: form }); }} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Development</Label>
              <div className="grid grid-cols-3 gap-2">
                {DEVELOPMENTS.map(dev => (
                  <button
                    key={dev}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, developmentName: dev }))}
                    className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      form.developmentName === dev
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    }`}
                    data-testid={`dev-${dev.toLowerCase().replace(" ", "-")}`}
                  >
                    {dev}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Unit Number</Label>
              <Input
                placeholder="e.g. A-12-03"
                value={form.unitNumber}
                onChange={e => setForm(f => ({ ...f, unitNumber: e.target.value }))}
                required
                data-testid="input-unit-number"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Resident ID</Label>
              <Input
                placeholder="e.g. SC-2023-00142"
                value={form.residentId}
                onChange={e => setForm(f => ({ ...f, residentId: e.target.value }))}
                required
                data-testid="input-resident-id"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold mt-2"
              disabled={upgradeMutation.isPending}
              data-testid="button-submit-upgrade"
            >
              {upgradeMutation.isPending ? "Submitting..." : "Submit Upgrade Request"}
            </Button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
