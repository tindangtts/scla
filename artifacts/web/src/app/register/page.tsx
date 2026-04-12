"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(register, {});
  const t = useTranslations("auth");

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">Star City Living</h1>

        <Card>
          <CardHeader>
            <CardTitle>{t("register")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("name")}</Label>
                <Input id="name" name="name" type="text" placeholder="Your full name" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t("phone")}</Label>
                <Input id="phone" name="phone" type="tel" placeholder="09xxxxxxxx" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("password")}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Min 6 characters"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  required
                />
              </div>

              {state.error && <p className="text-sm text-red-600">{state.error}</p>}

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? t("creatingAccount") : t("register")}
              </Button>
            </form>

            <p className="text-sm text-center mt-4 text-muted-foreground">
              {t("hasAccount")}{" "}
              <Link href="/login" className="text-primary hover:underline">
                {t("signInLink")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
