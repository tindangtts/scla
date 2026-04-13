"use client";

import { useState } from "react";
import { useActionState } from "react";
import { submitUpgradeRequest } from "./actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, CreditCard, ChevronLeft } from "lucide-react";
import { formatMMK } from "@/lib/format";

const REGISTRATION_FEE = 50000;

export function UpgradeForm() {
  const [state, formAction, isPending] = useActionState(submitUpgradeRequest, {});
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    unitNumber: "",
    residentId: "",
    developmentName: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"wavepay" | "kbzpay" | null>(null);
  const [agreed, setAgreed] = useState(false);

  // Step 3: Success
  if (state.success) {
    return (
      <div className="text-center py-4 space-y-3">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
        </div>
        <p className="text-foreground font-extrabold tracking-tight">
          Payment confirmed & upgrade request submitted!
        </p>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Registration fee of {formatMMK(REGISTRATION_FEE)} paid via{" "}
          <span className="font-bold">{state.paymentMethod === "wavepay" ? "WavePay" : "KBZPay"}</span>.
          Our team will review your request within 1-2 business days.
        </p>
      </div>
    );
  }

  // Step 1: Form fields
  if (step === 1) {
    return (
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="unitNumber">Unit number</Label>
          <Input
            id="unitNumber"
            type="text"
            placeholder="e.g. A-12-03"
            required
            value={formData.unitNumber}
            onChange={(e) => setFormData((f) => ({ ...f, unitNumber: e.target.value }))}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="residentId">Resident ID</Label>
          <Input
            id="residentId"
            type="text"
            placeholder="e.g. SC-2023-00142"
            required
            value={formData.residentId}
            onChange={(e) => setFormData((f) => ({ ...f, residentId: e.target.value }))}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="developmentName">Development</Label>
          <select
            id="developmentName"
            required
            value={formData.developmentName}
            onChange={(e) => setFormData((f) => ({ ...f, developmentName: e.target.value }))}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          >
            <option value="">Select development</option>
            <option value="City Loft">City Loft</option>
            <option value="Estella">Estella</option>
            <option value="ARA">ARA</option>
          </select>
        </div>

        <Button
          type="button"
          className="w-full h-11 font-bold"
          disabled={!formData.unitNumber || !formData.residentId || !formData.developmentName}
          onClick={() => setStep(2)}
        >
          Continue to Payment
        </Button>
      </div>
    );
  }

  // Step 2: Payment
  return (
    <div className="space-y-5">
      {/* Back button */}
      <button
        type="button"
        onClick={() => { setStep(1); setPaymentMethod(null); setAgreed(false); }}
        className="flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        Back to details
      </button>

      {/* Fee display */}
      <div>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
          Registration Fee
        </p>
        <p className="text-3xl font-extrabold text-foreground tracking-tighter tabular-nums">
          {formatMMK(REGISTRATION_FEE)}
        </p>
      </div>

      {/* Summary */}
      <div className="rounded-xl bg-muted/40 p-3 text-xs space-y-1">
        <p><span className="font-bold">Unit:</span> {formData.unitNumber}</p>
        <p><span className="font-bold">Resident ID:</span> {formData.residentId}</p>
        <p><span className="font-bold">Development:</span> {formData.developmentName}</p>
      </div>

      {/* Payment method selection */}
      <div>
        <p className="text-sm font-bold mb-3 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" aria-hidden="true" /> Select Payment Method
        </p>
        <div className="grid grid-cols-2 gap-3">
          {(["wavepay", "kbzpay"] as const).map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setPaymentMethod(method)}
              className={`p-4 rounded-2xl border-2 transition-[border-color,background-color] duration-200 ${
                paymentMethod === method
                  ? "border-primary bg-primary/5 shadow-inner scale-[0.98]"
                  : "border-border hover:border-primary/40 hover:bg-muted/50"
              }`}
            >
              <p className="font-extrabold text-sm">
                {method === "wavepay" ? "WavePay" : "KBZPay"}
              </p>
              <p className="text-[11px] font-medium text-muted-foreground mt-1">Mobile payment</p>
            </button>
          ))}
        </div>
      </div>

      {/* Terms */}
      <label className="flex items-start gap-3 cursor-pointer bg-muted/30 p-3 rounded-xl">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 accent-primary w-4 h-4 rounded-sm border-primary"
        />
        <span className="text-[11px] font-medium text-muted-foreground leading-relaxed">
          I agree to the registration fee policy. This fee is non-refundable once processed.
        </span>
      </label>

      {/* Error */}
      {state.error ? (
        <div
          className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/5 px-3 py-2.5 text-sm text-red-600"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{state.error}</span>
        </div>
      ) : null}

      {/* Submit form */}
      <form action={formAction}>
        <input type="hidden" name="unitNumber" value={formData.unitNumber} />
        <input type="hidden" name="residentId" value={formData.residentId} />
        <input type="hidden" name="developmentName" value={formData.developmentName} />
        <input type="hidden" name="paymentMethod" value={paymentMethod ?? ""} />
        <Button
          type="submit"
          className="w-full h-11 font-bold shadow-lg shadow-primary/20"
          disabled={!paymentMethod || !agreed || isPending}
        >
          {isPending ? "Processing..." : `Pay ${formatMMK(REGISTRATION_FEE)} & Submit Request`}
        </Button>
      </form>
    </div>
  );
}
