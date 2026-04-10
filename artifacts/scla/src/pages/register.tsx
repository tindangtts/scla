import { useState } from "react";
import { useLocation } from "wouter";
import { useRegisterUser } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });

  const registerMutation = useRegisterUser({
    mutation: {
      onSuccess: (data) => {
        login(data.token, data.user);
        setLocation("/");
        toast({ title: "Welcome to StarCity!", description: "Your guest account has been created." });
      },
      onError: () => {
        toast({ title: "Registration failed", description: "Please check your details and try again.", variant: "destructive" });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({ data: form });
  };

  return (
    <div className="min-h-[100dvh] bg-slate-100 flex justify-center">
      <div className="w-full max-w-md bg-background min-h-full flex flex-col relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-3xl rounded-full pointer-events-none" />
        
        <div className="flex items-center px-4 pt-12 pb-2 z-10">
          <button onClick={() => setLocation("/login")} className="p-3 bg-muted/50 hover:bg-muted rounded-full transition-colors" data-testid="button-back">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
        </div>
        <div className="flex-1 flex flex-col px-8 pb-12 z-10">
          <div className="mb-10 mt-4">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Create account</h1>
            <p className="text-muted-foreground mt-2 text-sm font-medium leading-relaxed">Join the StarCity community as a guest. You can upgrade to a resident account later.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("auth.name")}</Label>
              <Input
                id="name"
                placeholder="Ko Zin Min"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                className="h-14 rounded-2xl bg-muted/50 border-transparent focus:bg-background focus:border-primary focus:ring-primary shadow-sm text-base"
                data-testid="input-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                className="h-14 rounded-2xl bg-muted/50 border-transparent focus:bg-background focus:border-primary focus:ring-primary shadow-sm text-base"
                data-testid="input-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("auth.phone")}</Label>
              <Input
                id="phone"
                placeholder="09-XXXX-XXXX"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                required
                className="h-14 rounded-2xl bg-muted/50 border-transparent focus:bg-background focus:border-primary focus:ring-primary shadow-sm text-base"
                data-testid="input-phone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                minLength={8}
                className="h-14 rounded-2xl bg-muted/50 border-transparent focus:bg-background focus:border-primary focus:ring-primary shadow-sm text-base"
                data-testid="input-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 rounded-2xl text-base font-bold mt-4 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
              disabled={registerMutation.isPending}
              data-testid="button-register"
            >
              {registerMutation.isPending ? t("auth.registering") : t("auth.register")}
              {!registerMutation.isPending && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
            </Button>
          </form>

          <p className="text-sm font-medium text-muted-foreground text-center mt-8">
            {t("auth.hasAccount")}{" "}
            <button className="text-primary font-bold hover:underline underline-offset-4" onClick={() => setLocation("/login")} data-testid="link-login">
              {t("auth.login")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
