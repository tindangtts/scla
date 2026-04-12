"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register } from "./actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/layout/auth-shell";
import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(register, {});
  const t = useTranslations("auth");

  return (
    <AuthShell
      eyebrow="New account"
      title="Join the StarCity community."
      subtitle="Register in under a minute. Once verified, link your unit to unlock bill payments, the wallet, and resident-only perks."
    >
      <div className="space-y-1 mb-6">
        <h2 className="text-2xl font-extrabold tracking-tight">{t("register")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("hasAccount")}{" "}
          <Link
            href="/login"
            className="text-primary font-semibold hover:underline underline-offset-4"
          >
            {t("signInLink")}
          </Link>
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">{t("name")}</Label>
          <Input id="name" name="name" type="text" autoComplete="name" placeholder="U Aung Aung" required />
        </div>

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

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="phone">{t("phone")}</Label>
            <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="09xxxxxxxx" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Min 6 chars"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat password"
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
          {isPending ? t("creatingAccount") : t("register")}
        </Button>
      </form>
    </AuthShell>
  );
}
