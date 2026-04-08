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
        {/* Header */}
        <div className="bg-primary px-5 pt-12 pb-8">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-primary-foreground/70 text-sm">{greeting()}</p>
              <h1 className="text-primary-foreground font-semibold text-lg" data-testid="text-username">
                {user?.name ?? "Guest"}
              </h1>
              {isResident && user?.unitNumber && (
                <p className="text-primary-foreground/60 text-xs mt-0.5">{user.developmentName} · Unit {user.unitNumber}</p>
              )}
            </div>
            <button
              onClick={() => setLocation("/notifications")}
              className="relative p-2 bg-primary-foreground/10 rounded-full hover:bg-primary-foreground/20 transition-colors"
              data-testid="button-notifications"
            >
              <Bell className="w-5 h-5 text-primary-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
            </button>
          </div>
        </div>

        <div className="px-4 -mt-4 space-y-4 pb-6">
          {/* Primary action cards */}
          {isResident ? (
            <div
              className="bg-card rounded-2xl p-5 shadow-md border border-card-border cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setLocation("/bills")}
              data-testid="card-bill-payment"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Outstanding Balance</p>
                  {summaryLoading ? (
                    <Skeleton className="h-8 w-40 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground mt-1" data-testid="text-outstanding-balance">
                      {formatMMK(summary?.outstandingBalance ?? 0)}
                    </p>
                  )}
                  {!summaryLoading && (summary?.unpaidInvoiceCount ?? 0) > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {summary?.unpaidInvoiceCount} invoice{summary?.unpaidInvoiceCount !== 1 ? "s" : ""} pending
                    </p>
                  )}
                </div>
                <div className="p-3 bg-primary/10 rounded-xl">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
              </div>
              <button
                className="mt-4 w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                data-testid="button-pay-bills"
              >
                View & Pay Bills <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              className="bg-primary/5 border border-primary/20 rounded-2xl p-5 cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => setLocation(isAuthenticated ? "/upgrade" : "/login")}
              data-testid="card-upgrade-prompt"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/15 rounded-xl flex-shrink-0">
                  <ArrowUpCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Upgrade to Resident</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Link your unit to access bill payment, wallet, and more.</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto flex-shrink-0" />
              </div>
            </div>
          )}

          {/* Star Assist card */}
          <div
            className="bg-card rounded-2xl p-5 shadow-sm border border-card-border cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setLocation("/star-assist")}
            data-testid="card-star-assist"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-foreground">Star Assist</p>
                <p className="text-xs text-muted-foreground mt-1">Report issues, request services, track your tickets.</p>
                {!summaryLoading && (summary?.openTicketCount ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    {summary?.openTicketCount} open ticket{summary?.openTicketCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="p-3 bg-accent/10 rounded-xl">
                <HelpCircle className="w-6 h-6 text-accent" />
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Dumbbell, label: "Book SCSC", path: "/bookings", testId: "quick-bookings" },
              { icon: BookOpen, label: "Info Centre", path: "/info", testId: "quick-info" },
              { icon: Newspaper, label: "Newsletters", path: "/discover", testId: "quick-newsletters" },
            ].map(({ icon: Icon, label, path, testId }) => (
              <button
                key={path}
                onClick={() => setLocation(path)}
                className="bg-card border border-card-border rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-muted transition-colors"
                data-testid={`button-${testId}`}
              >
                <div className="p-2 bg-primary/8 rounded-lg">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-medium text-foreground text-center">{label}</span>
              </button>
            ))}
          </div>

          {/* Latest notice */}
          {summary?.latestAnnouncement && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-sm text-foreground">Community Notices</h2>
                <button className="text-xs text-primary font-medium" onClick={() => setLocation("/discover")} data-testid="link-view-all-notices">View all</button>
              </div>
              <div
                className="bg-amber-50 border border-amber-200 rounded-xl p-4 cursor-pointer hover:bg-amber-100 transition-colors"
                onClick={() => setLocation(`/discover/${summary.latestAnnouncement!.id}`)}
                data-testid="card-latest-announcement"
              >
                {summary.latestAnnouncement.isPinned && (
                  <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Pinned</span>
                )}
                <p className="font-medium text-sm text-gray-800 mt-0.5 leading-snug">{summary.latestAnnouncement.title}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{summary.latestAnnouncement.summary}</p>
              </div>
            </div>
          )}

          {/* Offers */}
          {promotions && promotions.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-sm text-foreground">Offers for You</h2>
                <button className="text-xs text-primary font-medium" onClick={() => setLocation("/discover")} data-testid="link-view-all-offers">View all</button>
              </div>
              <div className="space-y-2">
                {promotions.map((promo) => (
                  <div
                    key={promo.id}
                    className="bg-card border border-card-border rounded-xl p-4 cursor-pointer hover:bg-muted transition-colors flex items-center gap-3"
                    onClick={() => setLocation(`/discover/${promo.id}`)}
                    data-testid={`card-promotion-${promo.id}`}
                  >
                    <div className="w-10 h-10 bg-accent/15 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <span className="text-accent font-bold text-sm">%</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{promo.title}</p>
                      <p className="text-xs text-muted-foreground">{promo.partnerName}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Login prompt for unauthenticated */}
          {!isAuthenticated && (
            <div className="bg-primary rounded-2xl p-5 text-primary-foreground">
              <User className="w-6 h-6 mb-2" />
              <p className="font-semibold">Sign in to get started</p>
              <p className="text-primary-foreground/70 text-sm mt-1">Register or log in to access all StarCity services.</p>
              <button
                className="mt-4 w-full bg-primary-foreground text-primary py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-foreground/90 transition-colors"
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
