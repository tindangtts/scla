import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Building2, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const { login } = useAdminAuth();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(185,55%,14%)] to-[hsl(185,55%,22%)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-accent rounded-2xl mb-4">
            <Building2 className="w-7 h-7 text-accent-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-white">StarCity Admin</h1>
          <p className="text-white/60 text-sm mt-1">Estate Management Portal</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-lg font-semibold text-foreground mb-1">Sign in to continue</h2>
          <p className="text-sm text-muted-foreground mb-6">Access the StarCity estate management portal</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="staff@starcity.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Demo credentials</p>
            <div className="space-y-1 text-xs text-muted-foreground font-mono bg-muted/50 rounded-lg p-3">
              <div>Admin: admin@starcity.com / admin123</div>
              <div>Content: content@starcity.com / content123</div>
              <div>Support: support@starcity.com / support123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
