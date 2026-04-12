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
      <div className="mb-6 flex items-center gap-3">
        <div
          aria-hidden="true"
          className="relative w-12 h-12 rounded-2xl bg-gradient-teal flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 transition-transform hover:rotate-6"
        >
          <span className="text-primary-foreground font-black text-xl tracking-tighter -rotate-3">SC</span>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-3 h-3" aria-hidden="true" />
          </div>
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
            placeholder="admin@starcity.com"
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
