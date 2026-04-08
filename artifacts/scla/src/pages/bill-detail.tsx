import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useGetInvoice, getGetInvoiceQueryKey, useInitiatePayment } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { formatMMK, formatDate, getStatusBadgeClass, getStatusLabel } from "@/lib/format";
import { ChevronLeft, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function BillDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<"wavepay" | "kbzpay" | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);

  const { data: invoice, isLoading } = useGetInvoice(id, {
    query: { queryKey: getGetInvoiceQueryKey(id) }
  });

  const payMutation = useInitiatePayment({
    mutation: {
      onSuccess: (data) => {
        setPaymentInitiated(true);
        toast({ title: "Payment initiated", description: `Redirecting to ${data.paymentMethod === "wavepay" ? "WavePay" : "KBZPay"}...` });
      },
      onError: () => {
        toast({ title: "Payment failed", description: "Please try again.", variant: "destructive" });
      },
    },
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  if (!invoice) {
    return <AppLayout><div className="p-4 text-center text-muted-foreground">Invoice not found</div></AppLayout>;
  }

  const outstanding = invoice.totalAmount - invoice.paidAmount;

  if (paymentInitiated) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Payment Initiated</h2>
          <p className="text-muted-foreground text-sm mt-2 mb-6">
            Your payment via {paymentMethod === "wavepay" ? "WavePay" : "KBZPay"} has been initiated for {formatMMK(outstanding)}.
            Please complete the payment in the gateway app.
          </p>
          <Button onClick={() => setLocation("/bills")} className="w-full" data-testid="button-back-to-bills">
            Back to Bills
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-enter">
        <div className="bg-primary px-4 pt-12 pb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation("/bills")} className="p-2 bg-primary-foreground/10 rounded-full" data-testid="button-back">
              <ChevronLeft className="w-4 h-4 text-primary-foreground" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-primary-foreground">Invoice Detail</h1>
              <p className="text-primary-foreground/60 text-xs">{invoice.invoiceNumber}</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-4 space-y-4 pb-8">
          {/* Status & summary */}
          <div className="bg-card border border-card-border rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-foreground">{invoice.description}</p>
                <p className="text-xs text-muted-foreground mt-1">Unit {invoice.unitNumber}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusBadgeClass(invoice.status)}`} data-testid="text-invoice-status">
                {getStatusLabel(invoice.status)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Issue Date</p>
                <p className="font-medium">{formatDate(invoice.issueDate)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Due Date</p>
                <p className="font-medium">{formatDate(invoice.dueDate)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Amount</p>
                <p className="font-bold text-foreground" data-testid="text-total-amount">{formatMMK(invoice.totalAmount)}</p>
              </div>
              {invoice.paidAmount > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground">Amount Paid</p>
                  <p className="font-medium text-emerald-600">{formatMMK(invoice.paidAmount)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Line items */}
          <div className="bg-card border border-card-border rounded-xl p-4">
            <h3 className="font-semibold text-sm mb-3">Line Items</h3>
            <div className="space-y-2">
              {invoice.lineItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="min-w-0 mr-3">
                    <p className="text-foreground">{item.description}</p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-muted-foreground">{item.quantity} × {formatMMK(item.unitPrice)}</p>
                    )}
                  </div>
                  <p className="font-medium flex-shrink-0">{formatMMK(item.amount)}</p>
                </div>
              ))}
              <div className="border-t border-border pt-2 flex items-center justify-between font-bold">
                <span>Total</span>
                <span>{formatMMK(invoice.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Payment section */}
          {invoice.status !== "paid" && (
            <div className="bg-card border border-card-border rounded-xl p-4 space-y-4">
              <div>
                <h3 className="font-semibold text-sm mb-1">Amount to Pay</h3>
                <p className="text-2xl font-bold text-foreground" data-testid="text-outstanding">{formatMMK(outstanding)}</p>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Select payment method</p>
                <div className="grid grid-cols-2 gap-3">
                  {(["wavepay", "kbzpay"] as const).map(method => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === method
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      }`}
                      data-testid={`button-pay-${method}`}
                    >
                      <p className="font-semibold text-sm capitalize">
                        {method === "wavepay" ? "WavePay" : "KBZPay"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">Mobile payment</p>
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="mt-0.5 accent-primary"
                  data-testid="checkbox-agree"
                />
                <span className="text-xs text-muted-foreground">
                  I agree to the payment policy. Payments are non-refundable once processed. Overpayments will be credited to your wallet.
                </span>
              </label>

              <Button
                className="w-full h-12 text-base font-semibold"
                disabled={!paymentMethod || !agreed || payMutation.isPending}
                onClick={() => {
                  if (!paymentMethod) return;
                  payMutation.mutate({ id, data: { paymentMethod, invoiceIds: [id] } });
                }}
                data-testid="button-confirm-payment"
              >
                {payMutation.isPending ? "Processing..." : `Pay ${formatMMK(outstanding)}`}
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
