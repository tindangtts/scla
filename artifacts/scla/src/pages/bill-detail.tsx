import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useGetInvoice, getGetInvoiceQueryKey, useInitiatePayment } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { formatMMK, formatDate, getStatusBadgeClass, getStatusLabel } from "@/lib/format";
import { ChevronLeft, CheckCircle, CreditCard, Receipt } from "lucide-react";
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
        <div className="p-5 space-y-5 pt-14">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-48 w-full rounded-[1.5rem]" />
          <Skeleton className="h-32 w-full rounded-[1.5rem]" />
        </div>
      </AppLayout>
    );
  }

  if (!invoice) {
    return <AppLayout><div className="p-5 pt-20 text-center text-muted-foreground font-bold">Invoice not found</div></AppLayout>;
  }

  const outstanding = invoice.totalAmount - invoice.paidAmount;

  if (paymentInitiated) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center page-enter">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
            <CheckCircle className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">Payment Initiated</h2>
          <p className="text-muted-foreground text-sm font-medium mt-3 mb-8 leading-relaxed">
            Your payment via <span className="font-bold text-foreground">{paymentMethod === "wavepay" ? "WavePay" : "KBZPay"}</span> has been initiated for <span className="font-bold text-foreground">{formatMMK(outstanding)}</span>.
            Please complete the payment securely in the gateway app.
          </p>
          <Button onClick={() => setLocation("/bills")} className="w-full h-14 rounded-2xl text-base font-bold" data-testid="button-back-to-bills">
            Back to Bills
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-enter">
        <div className="bg-gradient-teal px-5 pt-14 pb-8 rounded-b-[2rem] shadow-md relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 blur-2xl rounded-full" />
          
          <div className="relative z-10 flex items-center gap-3">
            <button onClick={() => setLocation("/bills")} className="p-2.5 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors" data-testid="button-back">
              <ChevronLeft className="w-5 h-5 text-primary-foreground" />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-primary-foreground tracking-tight">Invoice Detail</h1>
              <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-wider mt-0.5">{invoice.invoiceNumber}</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-6 space-y-6 pb-10 -mt-4 relative z-20">
          {/* Status & summary card */}
          <div className="bg-card border border-card-border rounded-[1.5rem] p-6 shadow-lg shadow-primary/5">
            <div className="flex items-start justify-between mb-5">
              <div className="pr-4">
                <p className="font-extrabold text-lg text-foreground leading-tight">{invoice.description}</p>
                <p className="text-sm font-medium text-muted-foreground mt-1">Unit {invoice.unitNumber}</p>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 uppercase tracking-wide rounded-md ${getStatusBadgeClass(invoice.status)}`} data-testid="text-invoice-status">
                {getStatusLabel(invoice.status)}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-5 text-sm pt-5 border-t border-border/50">
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Issue Date</p>
                <p className="font-semibold text-foreground">{formatDate(invoice.issueDate)}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Due Date</p>
                <p className="font-semibold text-foreground">{formatDate(invoice.dueDate)}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Amount</p>
                <p className="font-black text-lg text-foreground tracking-tight" data-testid="text-total-amount">{formatMMK(invoice.totalAmount)}</p>
              </div>
              {invoice.paidAmount > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-emerald-600/80 uppercase tracking-wider mb-1">Amount Paid</p>
                  <p className="font-black text-lg text-emerald-600 tracking-tight">{formatMMK(invoice.paidAmount)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Line items */}
          <div className="bg-card border border-card-border rounded-[1.5rem] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="w-5 h-5 text-primary" />
              <h3 className="font-extrabold text-base">Line Items</h3>
            </div>
            <div className="space-y-3">
              {invoice.lineItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm py-1.5">
                  <div className="min-w-0 mr-4">
                    <p className="font-semibold text-foreground">{item.description}</p>
                    {item.quantity > 1 && (
                      <p className="text-xs font-medium text-muted-foreground mt-0.5">{item.quantity} × {formatMMK(item.unitPrice)}</p>
                    )}
                  </div>
                  <p className="font-bold flex-shrink-0 text-right">{formatMMK(item.amount)}</p>
                </div>
              ))}
              <div className="border-t border-border pt-4 mt-2 flex items-center justify-between">
                <span className="font-extrabold text-muted-foreground uppercase text-xs tracking-wider">Subtotal</span>
                <span className="font-black text-lg text-foreground tracking-tight">{formatMMK(invoice.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Payment section */}
          {invoice.status !== "paid" && (
            <div className="bg-card border-2 border-primary/20 rounded-[1.5rem] p-6 space-y-6 shadow-md shadow-primary/5">
              <div>
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-1.5">Amount to Pay</h3>
                <p className="text-4xl font-black text-foreground tracking-tighter" data-testid="text-outstanding">{formatMMK(outstanding)}</p>
              </div>

              <div>
                <p className="text-sm font-bold mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" /> Select Payment Method
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {(["wavepay", "kbzpay"] as const).map(method => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`p-4 rounded-[1rem] border-2 transition-all duration-200 ${
                        paymentMethod === method
                          ? "border-primary bg-primary/5 shadow-inner scale-[0.98]"
                          : "border-border hover:border-primary/40 hover:bg-muted/50"
                      }`}
                      data-testid={`button-pay-${method}`}
                    >
                      <p className="font-extrabold text-sm capitalize">
                        {method === "wavepay" ? "WavePay" : "KBZPay"}
                      </p>
                      <p className="text-[11px] font-medium text-muted-foreground mt-1">Mobile payment</p>
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer bg-muted/30 p-3 rounded-xl">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="mt-0.5 accent-primary w-4 h-4 rounded-sm border-primary"
                  data-testid="checkbox-agree"
                />
                <span className="text-[11px] font-medium text-muted-foreground leading-relaxed">
                  I agree to the payment policy. Payments are non-refundable once processed. Overpayments will be credited to your wallet.
                </span>
              </label>

              <Button
                className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/20"
                disabled={!paymentMethod || !agreed || payMutation.isPending}
                onClick={() => {
                  if (!paymentMethod) return;
                  payMutation.mutate({ id, data: { paymentMethod, invoiceIds: [id] } });
                }}
                data-testid="button-confirm-payment"
              >
                {payMutation.isPending ? "Processing..." : `Pay ${formatMMK(outstanding)} Securely`}
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
