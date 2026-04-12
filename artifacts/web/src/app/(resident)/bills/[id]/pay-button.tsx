"use client";

import { useActionState } from "react";
import { payInvoice } from "./pay-action";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, CreditCard } from "lucide-react";

export function PayButton({ invoiceId, amount }: { invoiceId: string; amount: string }) {
  const [state, formAction, isPending] = useActionState(payInvoice, {});

  return (
    <div className="space-y-3">
      {state.error ? (
        <div
          className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/5 px-3 py-2.5 text-sm text-red-600"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{state.error}</span>
        </div>
      ) : null}
      {state.success ? (
        <div
          className="flex items-start gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/5 px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-300"
          role="status"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>Payment successful!</span>
        </div>
      ) : null}
      <form action={formAction}>
        <input type="hidden" name="invoiceId" value={invoiceId} />
        <Button
          type="submit"
          size="lg"
          className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20"
          disabled={isPending}
        >
          <CreditCard className="w-4 h-4" aria-hidden="true" />
          {isPending ? "Processing..." : `Pay ${amount}`}
        </Button>
      </form>
      <p className="text-center text-[11px] text-muted-foreground font-medium">
        Paid instantly from your wallet balance
      </p>
    </div>
  );
}
