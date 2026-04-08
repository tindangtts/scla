import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout/app-layout";
import { getStatusBadgeClass, getStatusLabel } from "@/lib/format";
import { User, LogOut, ChevronRight, ArrowUpCircle, Wallet, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isResident, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground">Sign in to view your profile</p>
          <p className="text-muted-foreground text-sm mt-1">Access your account, bookings, and tickets.</p>
          <Button className="mt-6 w-full" onClick={() => setLocation("/login")} data-testid="button-login">
            Sign In
          </Button>
          <button className="mt-2 text-sm text-primary font-medium" onClick={() => setLocation("/register")} data-testid="link-register">
            Create an account
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-enter">
        <div className="bg-primary px-4 pt-12 pb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-xl">
                {user?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-primary-foreground font-semibold text-lg" data-testid="text-profile-name">{user?.name}</p>
              <p className="text-primary-foreground/70 text-sm">{user?.email}</p>
              <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                isResident ? "bg-emerald-500/20 text-emerald-100" : "bg-primary-foreground/20 text-primary-foreground/80"
              }`} data-testid="text-user-type">
                {isResident ? "Resident" : "Guest"}
              </span>
            </div>
          </div>
        </div>

        <div className="px-4 py-4 pb-8 space-y-4">
          {/* Unit info for residents */}
          {isResident && user?.unitNumber && (
            <div className="bg-card border border-card-border rounded-xl p-4">
              <h3 className="font-semibold text-sm mb-3">Unit Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Development</span>
                  <span className="font-medium">{user.developmentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unit Number</span>
                  <span className="font-medium" data-testid="text-unit-number">{user.unitNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resident ID</span>
                  <span className="font-medium">{user.residentId}</span>
                </div>
              </div>
            </div>
          )}

          {/* Upgrade status for guests */}
          {!isResident && (
            <div className="bg-card border border-card-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">Resident Upgrade</p>
                  <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(user?.upgradeStatus ?? "none")}`} data-testid="text-upgrade-status">
                    {getStatusLabel(user?.upgradeStatus ?? "none")}
                  </span>
                </div>
                {user?.upgradeStatus === "none" && (
                  <button
                    onClick={() => setLocation("/upgrade")}
                    className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-xs font-medium"
                    data-testid="button-upgrade"
                  >
                    <ArrowUpCircle className="w-3 h-3" />
                    Apply
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="bg-card border border-card-border rounded-xl overflow-hidden">
            {[
              { icon: Bell, label: "Notifications", path: "/notifications", testId: "link-notifications" },
              ...(isResident ? [{ icon: Wallet, label: "Wallet & Deposits", path: "/wallet", testId: "link-wallet" }] : []),
            ].map(({ icon: Icon, label, path, testId }) => (
              <button
                key={path}
                onClick={() => setLocation(path)}
                className="w-full flex items-center gap-3 px-4 py-4 hover:bg-muted transition-colors border-b border-border last:border-0"
                data-testid={testId}
              >
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground flex-1 text-left">{label}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>

          <div className="bg-card border border-card-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 text-xs text-muted-foreground">Account</div>
            <div className="px-4 py-3 border-t border-border space-y-1">
              <p className="text-sm text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground">{user?.phone}</p>
            </div>
          </div>

          <button
            onClick={() => { logout(); setLocation("/login"); }}
            className="w-full flex items-center justify-center gap-2 py-3 text-destructive text-sm font-medium hover:bg-destructive/5 rounded-xl transition-colors"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
