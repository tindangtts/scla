import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout/app-layout";
import { getStatusBadgeClass, getStatusLabel } from "@/lib/format";
import { User, LogOut, ChevronRight, ArrowUpCircle, Wallet, Bell, MapPin, ShieldCheck, Mail, Phone, Moon, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme, type Theme } from "@/hooks/use-theme";
import { useLanguage } from "@/hooks/use-language";

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const { user, isAuthenticated, isResident, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center page-enter">
          <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner rotate-3">
            <User className="w-10 h-10 text-primary -rotate-3" />
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">{t("profile.signIn")}</h2>
          <p className="text-muted-foreground text-sm font-medium mt-3 mb-8 leading-relaxed max-w-[280px]">
            Access your account, track bookings, and manage your StarCity resident profile.
          </p>
          <Button className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/20" onClick={() => setLocation("/login")} data-testid="button-login">
            {t("profile.signInBtn")}
          </Button>
          <button className="mt-6 text-sm text-primary font-bold hover:underline underline-offset-4" onClick={() => setLocation("/register")} data-testid="link-register">
            {t("profile.createAccount")}
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-enter bg-slate-50 min-h-full">
        <div className="bg-gradient-teal px-5 pt-16 pb-12 rounded-b-[2.5rem] shadow-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 blur-3xl rounded-full" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/20 blur-2xl rounded-full" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-white rounded-[2rem] p-1.5 shadow-xl mb-4 relative">
              <div className="w-full h-full bg-primary/10 rounded-2xl flex items-center justify-center">
                <span className="text-primary font-black text-3xl">
                  {user?.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-sm">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isResident ? "bg-emerald-500" : "bg-primary"}`}>
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            </div>
            
            <p className="text-primary-foreground font-black text-2xl tracking-tight" data-testid="text-profile-name">{user?.name}</p>
            <span className={`inline-block mt-3 px-3 py-1 rounded-md text-[11px] font-black uppercase tracking-widest shadow-sm ${
              isResident ? "bg-emerald-500/20 text-emerald-100 border border-emerald-500/30" : "bg-white/10 text-white/90 border border-white/20"
            }`} data-testid="text-user-type">
              {isResident ? "Resident" : "Guest Account"}
            </span>
          </div>
        </div>

        <div className="px-5 py-6 pb-12 space-y-6 -mt-6 relative z-20">
          {/* Unit info for residents */}
          {isResident && user?.unitNumber && (
            <div className="bg-card border border-card-border rounded-[1.5rem] p-6 shadow-lg shadow-primary/5">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <h3 className="font-extrabold text-base tracking-tight">{t("profile.unitDetails")}</h3>
              </div>
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center pb-4 border-b border-border/50">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{t("profile.development")}</span>
                  <span className="font-bold text-sm bg-muted px-2.5 py-1 rounded-md">{user.developmentName}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-border/50">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{t("profile.unitNumber")}</span>
                  <span className="font-black text-primary text-base tracking-tight" data-testid="text-unit-number">{user.unitNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{t("profile.residentId")}</span>
                  <span className="font-mono font-semibold text-xs text-muted-foreground">{user.residentId}</span>
                </div>
              </div>
            </div>
          )}

          {/* Upgrade status for guests */}
          {!isResident && (
            <div className="bg-gradient-gold border-none rounded-[1.5rem] p-6 shadow-xl shadow-accent/20 text-accent-foreground">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="font-extrabold text-lg">Resident Upgrade</p>
                  <p className="text-sm font-medium mt-1 opacity-90 leading-snug">Verify your tenancy to unlock all app features.</p>
                </div>
                
                <div className="flex items-center justify-between bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Status</p>
                    <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-white shadow-sm ${getStatusBadgeClass(user?.upgradeStatus ?? "none").replace("bg-", "text-").replace("text-", "text-")}`} data-testid="text-upgrade-status">
                      {getStatusLabel(user?.upgradeStatus ?? "none")}
                    </span>
                  </div>
                  {user?.upgradeStatus === "none" && (
                    <button
                      onClick={() => setLocation("/upgrade")}
                      className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-xl text-sm font-bold shadow-md hover:scale-105 transition-transform"
                      data-testid="button-upgrade"
                    >
                      <ArrowUpCircle className="w-4 h-4" />
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="bg-card border border-card-border rounded-[1.5rem] shadow-sm overflow-hidden">
            {[
              { icon: Bell, label: t("profile.notifications"), path: "/notifications", testId: "link-notifications" },
              ...(isResident ? [{ icon: Wallet, label: t("profile.wallet"), path: "/wallet", testId: "link-wallet" }] : []),
            ].map(({ icon: Icon, label, path, testId }) => (
              <button
                key={path}
                onClick={() => setLocation(path)}
                className="w-full flex items-center gap-4 p-5 hover:bg-muted transition-colors border-b border-border/50 last:border-0 group"
                data-testid={testId}
              >
                <div className="p-2.5 bg-primary/10 text-primary rounded-xl group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-foreground flex-1 text-left">{label}</span>
                <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary transition-colors group-hover:translate-x-1" />
              </button>
            ))}
          </div>

          <div className="bg-card border border-card-border rounded-[1.5rem] p-6 shadow-sm">
            <h3 className="font-extrabold text-base tracking-tight mb-4">{t("profile.contactInfo")}</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("profile.email")}</p>
                  <p className="font-semibold text-sm text-foreground mt-0.5">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("profile.phone")}</p>
                  <p className="font-semibold text-sm text-foreground mt-0.5">{user?.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* App Settings */}
          <div className="bg-card border border-card-border rounded-[1.5rem] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Globe2 className="w-5 h-5 text-primary" />
              <h3 className="font-extrabold text-base tracking-tight">App Settings</h3>
            </div>
            <div className="space-y-4">
              {/* Language row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
                    <Globe2 className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-bold text-foreground">Language</span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      language === 'en'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                    data-testid="button-lang-en"
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage('my')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      language === 'my'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                    data-testid="button-lang-my"
                  >
                    မြန်မာ
                  </button>
                </div>
              </div>
              {/* Theme row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
                    <Moon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-bold text-foreground">Theme</span>
                </div>
                <div className="flex gap-1.5">
                  {([
                    { value: 'light' as Theme, label: 'Light', testId: 'button-theme-light' },
                    { value: 'system' as Theme, label: 'System', testId: 'button-theme-system' },
                    { value: 'dark' as Theme, label: 'Dark', testId: 'button-theme-dark' },
                  ] as const).map(({ value, label, testId }) => (
                    <button
                      key={value}
                      onClick={() => setTheme(value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        theme === value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                      data-testid={testId}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => { logout(); setLocation("/login"); }}
            className="w-full flex items-center justify-center gap-2 py-4 text-destructive text-sm font-bold hover:bg-destructive/10 rounded-2xl transition-colors border-2 border-transparent hover:border-destructive/20"
            data-testid="button-logout"
          >
            <LogOut className="w-5 h-5" />
            {t("profile.signOut")}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
