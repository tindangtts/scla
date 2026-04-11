"use client";

import { useActionState } from "react";
import { adminLogin } from "./actions";
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

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(adminLogin, {});
  const t = useTranslations("auth");

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-950">
      <div className="w-full max-w-sm">
        <div className="bg-gray-900 text-white text-center py-4 rounded-t-xl">
          <h1 className="text-xl font-bold">{t("adminPortal")}</h1>
        </div>

        <Card className="rounded-t-none">
          <CardHeader>
            <CardTitle>{t("staffSignIn")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="staff@starcity.com"
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
