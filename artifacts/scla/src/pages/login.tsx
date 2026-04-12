import { useState } from "react";
import { useLocation } from "wouter";
import { useLoginUser } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useLoginUser({
    mutation: {
      onSuccess: (data) => {
        login(data.token, data.user);
        setLocation("/");
      },
      onError: () => {
        toast({ title: "Login failed", description: "Invalid email or password.", variant: "destructive" });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ data: { email, password } });
  };

  return (
    <div className="min-h-[100dvh] bg-slate-100 flex justify-center">
      <div className="w-full max-w-md bg-background min-h-full flex flex-col relative overflow-hidden shadow-2xl">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-teal rounded-b-[3rem] opacity-10 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/20 blur-3xl rounded-full pointer-events-none" />
        
        <div className="flex-1 flex flex-col justify-center px-8 py-12 z-10">
          <div className="mb-12 text-center">
            <div className="w-20 h-20 bg-gradient-teal rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl shadow-primary/20 rotate-3 transition-transform hover:rotate-6">
              <span className="text-primary-foreground font-black text-3xl tracking-tighter -rotate-3">SC</span>
            </div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground mt-2 text-sm font-medium">Sign in to your StarCity Living app</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="h-14 rounded-2xl bg-muted/50 border-transparent focus:bg-background focus:border-primary focus:ring-primary shadow-sm text-base"
                data-testid="input-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="h-14 rounded-2xl bg-muted/50 border-transparent focus:bg-background focus:border-primary focus:ring-primary shadow-sm text-base"
                data-testid="input-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 rounded-2xl text-base font-bold mt-4 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
              disabled={loginMutation.isPending}
              data-testid="button-login"
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
              {!loginMutation.isPending && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
            </Button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <p className="text-sm text-muted-foreground font-medium">
              Don't have an account?{" "}
              <button
                className="text-primary font-bold hover:underline underline-offset-4"
                onClick={() => setLocation("/register")}
                data-testid="link-register"
              >
                Register now
              </button>
            </p>
            <div className="pt-6 border-t border-border/50">
              <p className="text-xs text-muted-foreground/60 font-mono">
                Demo guest: demo@starcity.com / password123
                <br />
                Demo resident: resident@starcity.com / password123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
