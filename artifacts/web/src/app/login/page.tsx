"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "./actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, {});
  const t = useTranslations("auth");

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">
          Star City Living
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>{t("login")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
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
                <Label htmlFor="password">{t("password")}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Your password"
                  required
                />
              </div>

              {state.error && (
                <p className="text-sm text-red-600">{state.error}</p>
              )}

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? t("signingIn") : t("login")}
              </Button>
            </form>

            <p className="text-sm text-center mt-4 text-muted-foreground">
              {t("noAccount")}{" "}
              <Link href="/register" className="text-primary hover:underline">
                {t("registerLink")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
