"use client";

import { useActionState } from "react";
import { payInvoice } from "./pay-action";
import { Button } from "@/components/ui/button";

export function PayButton({ invoiceId, amount }: { invoiceId: string; amount: string }) {
  const [state, formAction, isPending] = useActionState(payInvoice, {});

  return (
    <div className="space-y-2">
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-600 font-medium">Payment successful!</p>}
      <form action={formAction}>
        <input type="hidden" name="invoiceId" value={invoiceId} />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Processing..." : `Pay ${amount}`}
        </Button>
      </form>
    </div>
  );
}
