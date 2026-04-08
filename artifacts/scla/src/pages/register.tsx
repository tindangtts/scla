import { useState } from "react";
import { useLocation } from "wouter";
import { useRegisterUser } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft } from "lucide-react";

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
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
    <div className="min-h-[100dvh] bg-muted flex justify-center">
      <div className="w-full max-w-md bg-background min-h-full flex flex-col shadow-2xl">
        <div className="flex items-center px-4 pt-12 pb-2">
          <button onClick={() => setLocation("/login")} className="p-2 hover:bg-muted rounded-full" data-testid="button-back">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 flex flex-col px-6 pb-12">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Create account</h1>
            <p className="text-muted-foreground mt-1 text-sm">Join the StarCity community as a guest. You can upgrade to resident later.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                placeholder="Ko Zin Min"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                data-testid="input-name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                data-testid="input-email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                placeholder="09-XXXX-XXXX"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                required
                data-testid="input-phone"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                minLength={8}
                data-testid="input-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold mt-2"
              disabled={registerMutation.isPending}
              data-testid="button-register"
            >
              {registerMutation.isPending ? "Creating account..." : "Create Guest Account"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Already have an account?{" "}
            <button className="text-primary font-medium hover:underline" onClick={() => setLocation("/login")} data-testid="link-login">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
