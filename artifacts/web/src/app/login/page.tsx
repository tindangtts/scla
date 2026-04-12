"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "./actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/layout/auth-shell";
import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, {});
  const t = useTranslations("auth");

  return (
    <AuthShell
      eyebrow="Resident portal"
      title="Your building. Your life. All in one place."
      subtitle="Pay bills, book SCSC facilities, request maintenance, and stay in the loop on community updates."
    >
      <div className="mb-6 flex items-center gap-3">
        <div
          aria-hidden="true"
          className="w-12 h-12 rounded-2xl bg-gradient-teal flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 transition-transform hover:rotate-6"
        >
          <span className="text-primary-foreground font-black text-xl tracking-tighter -rotate-3">SC</span>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Star City Living</p>
          <p className="text-xs font-semibold text-foreground">Resident portal</p>
        </div>
      </div>

      <div className="space-y-1 mb-6">
        <h2 className="text-2xl font-extrabold tracking-tight">{t("login")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("noAccount")}{" "}
          <Link
            href="/register"
            className="text-primary font-semibold hover:underline underline-offset-4"
          >
            {t("registerLink")}
          </Link>
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t("password")}</Label>
            <Link
              href="#"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground"
              aria-disabled
              tabIndex={-1}
            >
              {t("forgotPassword")}
            </Link>
          </div>
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

      <div className="mt-6 rounded-xl border border-border bg-muted/60 px-3.5 py-3 text-xs text-muted-foreground">
        <p className="font-bold text-foreground mb-1.5 text-[11px] tracking-wider uppercase">
          Demo accounts
        </p>
        <ul className="space-y-1 font-mono">
          <li>
            <span className="text-foreground">resident@starcity.mm</span> · password123
          </li>
          <li>
            <span className="text-foreground">guest@starcity.mm</span> · password123
          </li>
        </ul>
      </div>
    </AuthShell>
  );
}
