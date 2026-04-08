import { useLocation } from "wouter";
import { useGetHomeSummary, getGetHomeSummaryQueryKey, useListPromotions, getListPromotionsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout/app-layout";
import { formatMMK } from "@/lib/format";
import { Bell, CreditCard, HelpCircle, Dumbbell, BookOpen, Newspaper, ChevronRight, ArrowUpCircle, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { user, isResident, isAuthenticated } = useAuth();

  const { data: summary, isLoading: summaryLoading } = useGetHomeSummary({
    query: { queryKey: getGetHomeSummaryQueryKey() }
  });

  const { data: promotions } = useListPromotions(
    { limit: 3 },
    { query: { queryKey: getListPromotionsQueryKey({ limit: 3 }) } }
  );

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <AppLayout>
      <div className="page-enter">
        {/* Energetic Header */}
        <div className="bg-gradient-teal px-6 pt-16 pb-10 rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/20 blur-2xl rounded-full" />
          
          <div className="relative z-10 flex items-start justify-between mb-2">
            <div>
              <p className="text-primary-foreground/80 font-medium text-sm tracking-wide mb-1 uppercase">{greeting()}</p>
              <h1 className="text-primary-foreground font-extrabold text-2xl tracking-tight" data-testid="text-username">
                {user?.name ?? "Guest"}
              </h1>
              {isResident && user?.unitNumber && (
                <p className="text-accent font-semibold text-sm mt-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  {user.developmentName} · Unit {user.unitNumber}
                </p>
              )}
            </div>
            <button
              onClick={() => setLocation("/notifications")}
              className="relative p-3 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-colors shadow-sm"
              data-testid="button-notifications"
            >
              <Bell className="w-5 h-5 text-primary-foreground" />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-destructive border-2 border-primary rounded-full"></span>
            </button>
          </div>
        </div>

        <div className="px-5 -mt-8 space-y-6 pb-8 relative z-20">
          {/* Primary action cards */}
          {isResident ? (
            <div
              className="bg-card rounded-[1.5rem] p-6 shadow-xl shadow-primary/5 border border-card-border cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              onClick={() => setLocation("/bills")}
              data-testid="card-bill-payment"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Outstanding Balance</p>
                  {summaryLoading ? (
                    <Skeleton className="h-10 w-40 mt-2" />
                  ) : (
                    <p className="text-3xl font-black text-foreground mt-1.5 tracking-tight" data-testid="text-outstanding-balance">
                      {formatMMK(summary?.outstandingBalance ?? 0)}
                    </p>
                  )}
                  {!summaryLoading && (summary?.unpaidInvoiceCount ?? 0) > 0 && (
                    <div className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 bg-destructive/10 text-destructive rounded-full text-xs font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                      {summary?.unpaidInvoiceCount} pending invoice{summary?.unpaidInvoiceCount !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
                <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                  <CreditCard className="w-7 h-7" />
                </div>
              </div>
              <button
                className="mt-6 w-full bg-primary text-primary-foreground py-3.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-md shadow-primary/20 flex items-center justify-center gap-2 group"
                data-testid="button-pay-bills"
              >
                View & Pay Bills <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          ) : (
            <div
              className="bg-gradient-gold border-none rounded-[1.5rem] p-6 shadow-xl shadow-accent/20 cursor-pointer hover:-translate-y-1 transition-all duration-300 text-accent-foreground"
              onClick={() => setLocation(isAuthenticated ? "/upgrade" : "/login")}
              data-testid="card-upgrade-prompt"
            >
              <div className="flex items-center gap-4">
                <div className="p-3.5 bg-white/30 backdrop-blur-sm rounded-2xl flex-shrink-0">
                  <ArrowUpCircle className="w-7 h-7 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-extrabold text-lg">Upgrade to Resident</p>
                  <p className="text-sm font-medium mt-1 opacity-90 leading-snug">Link your unit to access bill payment, wallet, and more.</p>
                </div>
              </div>
            </div>
          )}

          {/* Star Assist card */}
          <div
            className="bg-card rounded-[1.5rem] p-6 shadow-md shadow-slate-200/50 border border-card-border cursor-pointer hover:shadow-lg transition-all"
            onClick={() => setLocation("/star-assist")}
            data-testid="card-star-assist"
          >
            <div className="flex items-start justify-between">
              <div className="pr-4">
                <p className="font-bold text-lg text-foreground tracking-tight">Star Assist</p>
                <p className="text-sm font-medium text-muted-foreground mt-1.5 leading-relaxed">Report issues, request services, and track tickets.</p>
                {!summaryLoading && (summary?.openTicketCount ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-accent/20 text-accent-foreground rounded-full text-xs font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-foreground" />
                    {summary?.openTicketCount} open ticket{summary?.openTicketCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="p-4 bg-secondary rounded-2xl flex-shrink-0">
                <HelpCircle className="w-7 h-7 text-primary" />
              </div>
            </div>
          </div>

          {/* Quick actions grid */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Dumbbell, label: "Book SCSC", path: "/bookings", testId: "quick-bookings" },
              { icon: BookOpen, label: "Info Centre", path: "/info", testId: "quick-info" },
              { icon: Newspaper, label: "Newsletters", path: "/discover", testId: "quick-newsletters" },
            ].map(({ icon: Icon, label, path, testId }) => (
              <button
                key={path}
                onClick={() => setLocation(path)}
                className="bg-card shadow-sm border border-card-border rounded-2xl p-4 flex flex-col items-center justify-center gap-3 hover:bg-muted hover:shadow-md transition-all active:scale-95"
                data-testid={`button-${testId}`}
              >
                <div className="p-3 bg-primary/5 rounded-xl text-primary group-hover:bg-primary/10">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-foreground text-center leading-tight">{label}</span>
              </button>
            ))}
          </div>

          {/* Latest notice */}
          {summary?.latestAnnouncement && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="font-bold text-base text-foreground tracking-tight">Community Notices</h2>
                <button className="text-sm text-primary font-bold hover:underline" onClick={() => setLocation("/discover")} data-testid="link-view-all-notices">View all</button>
              </div>
              <div
                className="bg-card border-l-4 border-l-accent border border-card-border rounded-2xl p-5 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                onClick={() => setLocation(`/discover/${summary.latestAnnouncement!.id}`)}
                data-testid="card-latest-announcement"
              >
                {summary.latestAnnouncement.isPinned && (
                  <span className="inline-block px-2.5 py-1 bg-accent/20 text-accent-foreground text-[10px] font-black uppercase tracking-wider rounded-md mb-2">Pinned</span>
                )}
                <p className="font-bold text-base text-foreground leading-snug">{summary.latestAnnouncement.title}</p>
                <p className="text-sm font-medium text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{summary.latestAnnouncement.summary}</p>
              </div>
            </div>
          )}

          {/* Offers */}
          {promotions && promotions.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="font-bold text-base text-foreground tracking-tight">Offers for You</h2>
                <button className="text-sm text-primary font-bold hover:underline" onClick={() => setLocation("/discover")} data-testid="link-view-all-offers">View all</button>
              </div>
              <div className="space-y-3">
                {promotions.map((promo) => (
                  <div
                    key={promo.id}
                    className="bg-card border border-card-border rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all flex items-center gap-4"
                    onClick={() => setLocation(`/discover/${promo.id}`)}
                    data-testid={`card-promotion-${promo.id}`}
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex-shrink-0 flex items-center justify-center">
                      <span className="text-primary font-black text-xl">%</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-foreground truncate">{promo.title}</p>
                      <p className="text-xs font-medium text-muted-foreground mt-0.5">{promo.partnerName}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Login prompt for unauthenticated */}
          {!isAuthenticated && (
            <div className="bg-gradient-teal rounded-[1.5rem] p-8 text-primary-foreground shadow-xl mt-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full pointer-events-none" />
              <User className="w-8 h-8 mb-4 text-accent" />
              <p className="font-extrabold text-xl">Sign in to get started</p>
              <p className="text-primary-foreground/80 text-sm font-medium mt-2 leading-relaxed">Register or log in to access all premium StarCity services.</p>
              <button
                className="mt-6 w-full bg-white text-primary py-3.5 rounded-xl text-sm font-bold shadow-lg hover:bg-white/90 transition-colors"
                onClick={() => setLocation("/login")}
                data-testid="button-login-prompt"
              >
                Sign In / Register
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
