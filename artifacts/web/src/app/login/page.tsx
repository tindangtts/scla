"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "./actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/layout/auth-shell";
import { AlertCircle, ArrowRight, Home, Sparkles, KeyRound } from "lucide-react";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, {});
  const t = useTranslations("auth");

  return (
    <AuthShell
      eyebrow="Resident portal"
      title="Welcome home, neighbour."
      subtitle="Pay bills, book facilities, request maintenance, and stay connected with your community — all from one place."
    >
      {/* Warm greeting header */}
      <div className="mb-6 flex items-center gap-3">
        <div
          aria-hidden="true"
          className="w-12 h-12 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center"
        >
          <Home className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-lg font-extrabold tracking-tight text-foreground">
            {t("login")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("noAccount")}{" "}
            <Link
              href="/register"
              className="text-primary font-semibold hover:underline underline-offset-4"
            >
              {t("registerLink")}
            </Link>
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
            placeholder="your.name@email.com"
            className="h-11 px-4 text-sm"
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
            placeholder="Enter your password"
            className="h-11 px-4 text-sm"
            required
          />
        </div>

        {state.error ? (
          <div
            className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2.5 text-sm text-red-600"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{state.error}</span>
          </div>
        ) : null}

        <Button
          type="submit"
          size="lg"
          className="w-full h-12 text-sm font-bold gap-2 group"
          disabled={isPending}
        >
          {isPending ? (
            t("signingIn")
          ) : (
            <>
              {t("login")}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </>
          )}
        </Button>
      </form>

      {/* Demo accounts — friendly "Try it out" card */}
      <div className="mt-6 rounded-xl border border-primary/15 bg-primary/[0.03] dark:bg-primary/[0.08] px-4 py-3.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
          <p className="font-bold text-foreground text-[11px] tracking-wider uppercase">
            Try it out
          </p>
        </div>
        <ul className="space-y-1.5">
          <li className="flex items-center gap-2">
            <KeyRound className="w-3 h-3 text-muted-foreground/60 shrink-0" aria-hidden="true" />
            <span>
              <span className="text-foreground font-medium">resident@starcity.com</span>
              <span className="mx-1.5 text-muted-foreground/40">&middot;</span>
              password123
              <span className="ml-1 text-muted-foreground/50 text-[10px]">(City Loft)</span>
            </span>
          </li>
          <li className="flex items-center gap-2">
            <KeyRound className="w-3 h-3 text-muted-foreground/60 shrink-0" aria-hidden="true" />
            <span>
              <span className="text-foreground font-medium">hla.win@gmail.com</span>
              <span className="mx-1.5 text-muted-foreground/40">&middot;</span>
              password123
              <span className="ml-1 text-muted-foreground/50 text-[10px]">(Estella)</span>
            </span>
          </li>
          <li className="flex items-center gap-2">
            <KeyRound className="w-3 h-3 text-muted-foreground/60 shrink-0" aria-hidden="true" />
            <span>
              <span className="text-foreground font-medium">nwe.nwe@gmail.com</span>
              <span className="mx-1.5 text-muted-foreground/40">&middot;</span>
              password123
              <span className="ml-1 text-muted-foreground/50 text-[10px]">(ARA)</span>
            </span>
          </li>
          <li className="flex items-center gap-2">
            <KeyRound className="w-3 h-3 text-muted-foreground/60 shrink-0" aria-hidden="true" />
            <span>
              <span className="text-foreground font-medium">demo@starcity.com</span>
              <span className="mx-1.5 text-muted-foreground/40">&middot;</span>
              password123
              <span className="ml-1 text-muted-foreground/50 text-[10px]">(Guest)</span>
            </span>
          </li>
        </ul>
      </div>
    </AuthShell>
  );
}
