---
phase: quick
plan: 260412-vcj
type: execute
wave: 1
depends_on: []
files_modified:
  - artifacts/web/src/app/(resident)/bills/[id]/pay-action.ts
  - artifacts/web/src/app/(resident)/bills/[id]/pay-button.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "User sees payment method selection (WavePay / KBZPay) before paying"
    - "User must agree to terms before submit button enables"
    - "After successful payment, user sees a success screen with payment details and back-to-bills link"
    - "Server action accepts paymentMethod and returns sessionId"
  artifacts:
    - path: "artifacts/web/src/app/(resident)/bills/[id]/pay-action.ts"
      provides: "Server action returning paymentMethod + sessionId"
      contains: "crypto.randomUUID"
    - path: "artifacts/web/src/app/(resident)/bills/[id]/pay-button.tsx"
      provides: "Multi-step payment UI with method selection, terms, success screen"
      contains: "paymentMethod"
  key_links:
    - from: "pay-button.tsx"
      to: "pay-action.ts"
      via: "hidden input name=paymentMethod in form submitted to payInvoice server action"
      pattern: 'name="paymentMethod"'
---

<objective>
Add mock payment process to the bill payment flow: payment method selection (WavePay/KBZPay), terms agreement checkbox, and a success confirmation screen.

Purpose: Match the baseline payment UX at commit 818bc0a with method selection and confirmation flow.
Output: Updated server action and pay button component with full payment experience.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@artifacts/web/src/app/(resident)/bills/[id]/pay-action.ts
@artifacts/web/src/app/(resident)/bills/[id]/pay-button.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Extend server action to accept paymentMethod and return sessionId</name>
  <files>artifacts/web/src/app/(resident)/bills/[id]/pay-action.ts</files>
  <action>
Modify the `payInvoice` server action:

1. Update the return type from `{ error?: string; success?: boolean }` to `{ error?: string; success?: boolean; paymentMethod?: string; sessionId?: string }` (both the prevState param type and the Promise return type).

2. After the existing `invoiceId` extraction, add:
   ```ts
   const paymentMethod = formData.get("paymentMethod") as string;
   ```
   No validation needed — it is optional for backward compat (wallet-only pay still works).

3. Replace the final `return { success: true };` with:
   ```ts
   const sessionId = crypto.randomUUID();
   return { success: true, paymentMethod: paymentMethod || undefined, sessionId };
   ```

No other changes to the function body. Keep all existing imports. `crypto` is a Node global — no import needed.
  </action>
  <verify>
    <automated>cd /Users/tindang/workspaces/tts/yoma/scla && pnpm --filter web exec tsc --noEmit --pretty 2>&1 | head -30</automated>
  </verify>
  <done>Server action accepts paymentMethod from formData, generates a UUID sessionId, and returns both in the success response. TypeScript compiles clean.</done>
</task>

<task type="auto">
  <name>Task 2: Rebuild PayButton with method selection, terms, and success screen</name>
  <files>artifacts/web/src/app/(resident)/bills/[id]/pay-button.tsx</files>
  <action>
Replace the entire PayButton component with a multi-state payment experience. Keep `"use client"` directive and the `useActionState` pattern.

**Imports:**
```ts
"use client";

import { useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { payInvoice } from "./pay-action";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, CreditCard } from "lucide-react";
```

Note: Change `CheckCircle2` to `CheckCircle` (baseline uses CheckCircle).

**Component state:**
```ts
const [state, formAction, isPending] = useActionState(payInvoice, {});
const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
const [agreed, setAgreed] = useState(false);
```

**Render logic — two branches:**

**Branch 1: `state.success` is truthy** — Full-screen success view:
- Centered flex column with padding
- Green CheckCircle icon (w-16 h-16, text-emerald-500)
- "Payment Initiated" as h2 (text-xl font-bold)
- "Your payment is being processed" as muted paragraph
- Info card (rounded-xl border bg-muted/30 p-4) showing:
  - "Amount" label + `amount` prop value (font-bold)
  - "Method" label + `state.paymentMethod` (uppercase, font-bold) — only if state.paymentMethod exists
  - "Session" label + `state.sessionId` (text-xs font-mono truncated)
- Link to "/bills" styled as full-width Button variant="outline" with text "Back to Bills"

**Branch 2: default** — Payment form:
- Error alert (same as current — AlertCircle + state.error, red styling, role="alert") if state.error
- "Amount to Pay" section: muted label, then amount displayed large (text-2xl font-bold)
- "Select Payment Method" section label (text-sm font-medium mb-2)
- 2-column grid (grid-cols-2 gap-3) with two method cards:
  - Each is a button (type="button") with onClick setting paymentMethod
  - Card styling: rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-colors
  - Selected state: border-primary bg-primary/5 — Unselected: border-muted-foreground/20
  - Each card shows CreditCard icon + method name ("WavePay" / "KBZPay") as text-sm font-medium
- Terms checkbox row: flex items-start gap-2
  - input type="checkbox" with id="terms", checked={agreed}, onChange toggling agreed
  - label htmlFor="terms" with text: "I agree to the payment terms and conditions. Payments are processed securely through the selected provider."
  - Style: text-xs text-muted-foreground
- form with action={formAction}:
  - Hidden input name="invoiceId" value={invoiceId}
  - Hidden input name="paymentMethod" value={paymentMethod || ""}
  - Submit Button: full width, h-12, rounded-xl, font-bold, shadow-lg shadow-primary/20
    - disabled={isPending || !paymentMethod || !agreed}
    - Icon: CreditCard w-4 h-4
    - Text: isPending ? "Processing..." : `Pay ${amount}`
- Footer text: "Paid instantly from your wallet balance" (text-center text-[11px] text-muted-foreground font-medium)
  </action>
  <verify>
    <automated>cd /Users/tindang/workspaces/tts/yoma/scla && pnpm --filter web exec tsc --noEmit --pretty 2>&1 | head -30</automated>
  </verify>
  <done>PayButton renders payment method selection grid, terms checkbox, disabled-until-ready submit, and a full success confirmation screen after payment. TypeScript compiles clean.</done>
</task>

</tasks>

<verification>
1. `pnpm --filter web exec tsc --noEmit` passes with no errors
2. `pnpm --filter web build` completes successfully
</verification>

<success_criteria>
- Bill payment page shows WavePay and KBZPay selection cards
- Submit button is disabled until a method is selected AND terms checkbox is checked
- After successful payment, a confirmation screen shows amount, method, session ID, and a "Back to Bills" link
- Server action returns paymentMethod and sessionId in response
</success_criteria>

<output>
After completion, create `.planning/quick/260412-vcj-add-mock-payment-process-to-bill-payment/260412-vcj-SUMMARY.md`
</output>
