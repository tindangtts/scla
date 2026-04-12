"use client";

import { useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { payInvoice } from "./pay-action";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, CreditCard } from "lucide-react";

export function PayButton({ invoiceId, amount }: { invoiceId: string; amount: string }) {
  const [state, formAction, isPending] = useActionState(payInvoice, {});
  const [paymentMethod, setPaymentMethod] = useState<"wavepay" | "kbzpay" | null>(null);
  const [agreed, setAgreed] = useState(false);

  // Success screen
  if (state.success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/20">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-xl font-extrabold text-foreground tracking-tight">
          Payment Initiated
        </h2>
        <p className="text-sm text-muted-foreground font-medium mt-3 mb-6 leading-relaxed max-w-xs">
          Your payment of <span className="font-bold text-foreground">{amount}</span> via{" "}
          <span className="font-bold text-foreground">
            {state.paymentMethod === "wavepay" ? "WavePay" : "KBZPay"}
          </span>{" "}
          has been processed successfully.
        </p>
        <Link
          href="/bills"
          className="w-full inline-flex items-center justify-center h-12 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
        >
          Back to Bills
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border-2 border-primary/20 p-5 shadow-md shadow-primary/5 space-y-5">
      {/* Amount display */}
      <div>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
          Amount to Pay
        </p>
        <p className="text-3xl font-extrabold text-foreground tracking-tighter tabular-nums">
          {amount}
        </p>
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
              className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
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

      {/* Terms agreement */}
      <label className="flex items-start gap-3 cursor-pointer bg-muted/30 p-3 rounded-xl">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 accent-primary w-4 h-4 rounded-sm border-primary"
        />
        <span className="text-[11px] font-medium text-muted-foreground leading-relaxed">
          I agree to the payment policy. Payments are non-refundable once processed. Overpayments
          will be credited to your wallet.
        </span>
      </label>

      {/* Error alert */}
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
        <input type="hidden" name="invoiceId" value={invoiceId} />
        <input type="hidden" name="paymentMethod" value={paymentMethod ?? ""} />
        <Button
          type="submit"
          size="lg"
          className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20"
          disabled={!paymentMethod || !agreed || isPending}
        >
          {isPending ? "Processing..." : `Pay ${amount} Securely`}
        </Button>
      </form>
    </div>
  );
}
