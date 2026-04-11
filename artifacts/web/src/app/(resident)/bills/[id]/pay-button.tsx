"use client";

import { Button } from "@/components/ui/button";

export function PayButton({
  invoiceId,
  amount,
}: {
  invoiceId: string;
  amount: string;
}) {
  return (
    <form>
      <input type="hidden" name="invoiceId" value={invoiceId} />
      <Button type="submit" className="w-full">
        Pay {amount}
      </Button>
    </form>
  );
}
