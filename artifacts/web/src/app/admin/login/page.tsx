"use client";

import { useActionState } from "react";
import { adminLogin } from "./actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/layout/auth-shell";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(adminLogin, {});
  const t = useTranslations("auth");

  return (
    <AuthShell
      staff
      eyebrow="Admin · Staff only"
      title={t("adminPortal")}
      subtitle="Manage residents, tickets, facilities, and estate operations from a single unified console."
    >
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <ShieldCheck className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold tracking-tight leading-tight">
            {t("staffSignIn")}
          </h2>
          <p className="text-xs font-medium text-muted-foreground">
            Authorized staff accounts only.
          </p>
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="staff@starcity.mm"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">{t("password")}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            required
          />
        </div>

        {state.error ? (
          <div
            className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-red-600"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{state.error}</span>
          </div>
        ) : null}

        <Button type="submit" size="lg" className="w-full h-11 text-sm font-bold" disabled={isPending}>
          {isPending ? t("signingIn") : t("login")}
        </Button>
      </form>

      <p className="mt-6 text-center text-[11px] text-muted-foreground">
        All admin actions are logged for audit purposes.
      </p>
    </AuthShell>
  );
}
