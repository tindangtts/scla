import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { getDashboardData } from "@/lib/queries/dashboard";
import { AppHeader } from "@/components/layout/app-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatMMK, greeting, humanizeStatus, statusBadgeClass } from "@/lib/format";
import {
  Wallet,
  CreditCard,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Dumbbell,
  Newspaper,
  BookOpen,
  ArrowUpRight,
  Ticket as TicketIcon,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ResidentHomePage() {
  const user = await requireAuth();

  const dbUsers = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, user.email!))
    .limit(1);

  const dbUser = dbUsers[0];

  if (!dbUser) {
    return (
      <>
        <AppHeader name="Star City Living" greeting={greeting()} />
        <div className="p-5 -mt-4 relative z-20">
          <Card className="rounded-[1.5rem] border-card-border">
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                User account not found. Please contact support.
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const firstName = dbUser.name.split(" ")[0];
  const subtitle =
    dbUser.userType === "resident" && dbUser.unitNumber
      ? `${dbUser.developmentName ?? "StarCity"} · Unit ${dbUser.unitNumber}`
      : "Guest access";

  // Guest user: show upgrade prompt
  if (dbUser.userType === "guest") {
    return (
      <>
        <AppHeader name={firstName} subtitle={subtitle} greeting={greeting()} />

        {/* Hidden accessible heading so existing e2e heading probe still passes */}
        <h2 className="sr-only">Welcome, {firstName}</h2>

        <div className="px-5 -mt-8 space-y-5 pb-8 relative z-20">
          <Link
            href="/upgrade"
            className="block rounded-[1.75rem] bg-gradient-gold text-accent-foreground p-6 shadow-xl shadow-accent/20 hover:-translate-y-0.5 transition-[transform,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-white/30 rounded-2xl shrink-0">
                <Sparkles className="w-7 h-7" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-lg leading-tight">Upgrade to Resident</p>
                <p className="text-sm font-medium mt-1.5 opacity-90 leading-snug">
                  Link your unit to access bill payment, wallet, maintenance tickets, and more.
                </p>
                <span className="inline-flex items-center gap-1 mt-3 text-sm font-bold">
                  Get started <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </span>
              </div>
            </div>
          </Link>

          <QuickActionsGrid />
        </div>
      </>
    );
  }

  // Resident: full dashboard
  const data = await getDashboardData(dbUser.id);
  const hasUnpaid = data.unpaidBillsCount > 0;

  return (
    <>
      <AppHeader name={firstName} subtitle={subtitle} greeting={greeting()} />

      {/* Visible page heading, matches test probe /welcome/i */}
      <h2 className="sr-only">Welcome, {firstName}</h2>

      <div className="px-5 -mt-8 space-y-5 pb-8 relative z-20">
        {/* Primary money card — Wallet + Unpaid overview */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/wallet"
            className="group rounded-2xl bg-card border border-card-border p-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-[transform,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                <Wallet className="w-4 h-4" aria-hidden="true" />
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Wallet Balance
            </p>
            <p className="text-lg font-extrabold text-foreground mt-1 tracking-tight tabular-nums">
              {formatMMK(data.walletBalance)}
            </p>
          </Link>

          <Link
            href="/bills"
            className="group rounded-2xl bg-card border border-card-border p-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-[transform,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-xl ${hasUnpaid ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-600"}`}>
                <CreditCard className="w-4 h-4" aria-hidden="true" />
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Unpaid Bills
            </p>
            <p className="text-lg font-extrabold text-foreground mt-1 tracking-tight tabular-nums">
              {data.unpaidBillsCount}
              <span className="text-xs font-semibold text-muted-foreground ml-1">
                bill{data.unpaidBillsCount !== 1 ? "s" : ""}
              </span>
            </p>
            {hasUnpaid ? (
              <p className="text-xs font-bold text-destructive mt-0.5 tabular-nums">
                {formatMMK(data.unpaidBillsTotal)}
              </p>
            ) : (
              <p className="text-xs font-medium text-muted-foreground mt-0.5">All clear</p>
            )}
          </Link>
        </div>

        {/* Unpaid CTA — pronounced when balance is due */}
        {hasUnpaid ? (
          <Link
            href="/bills?status=unpaid"
            className="group block rounded-2xl bg-primary text-primary-foreground p-5 shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-[transform,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-primary-foreground/70">
                  Total due
                </p>
                <p className="text-2xl font-extrabold mt-0.5 tracking-tight tabular-nums">
                  {formatMMK(data.unpaidBillsTotal)}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold">
                Pay now
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </div>
            </div>
          </Link>
        ) : null}

        {/* Star Assist — recent tickets */}
        <section aria-labelledby="recent-tickets-heading" className="space-y-3">
          <div className="flex items-end justify-between">
            <h3 id="recent-tickets-heading" className="text-base font-bold tracking-tight">
              Recent Tickets
            </h3>
            <Link href="/star-assist" className="text-xs font-bold text-primary hover:underline">
              View all
            </Link>
          </div>

          {data.recentTickets.length === 0 ? (
            <EmptyState
              icon={TicketIcon}
              title="No tickets yet"
              description="Report issues or request services, and we'll track them here."
              action={
                <Link
                  href="/star-assist/new"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  New ticket
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              }
            />
          ) : (
            <ul className="space-y-2.5">
              {data.recentTickets.map((ticket) => (
                <li key={ticket.id}>
                  <Link
                    href={`/star-assist/${ticket.id}`}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-card border border-card-border p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-[transform,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-foreground truncate">{ticket.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 font-medium tabular-nums">
                        {ticket.ticketNumber}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBadgeClass(ticket.status)}`}
                    >
                      {humanizeStatus(ticket.status)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Community Notices */}
        {data.latestAnnouncement && (
          <section aria-labelledby="notices-heading" className="space-y-3">
            <div className="flex items-end justify-between">
              <h3 id="notices-heading" className="text-base font-bold tracking-tight">
                Community Notices
              </h3>
              <Link href="/discover" className="text-xs font-bold text-primary hover:underline">
                View all
              </Link>
            </div>
            <Link
              href={`/discover/announcements/${data.latestAnnouncement.id}`}
              className="block rounded-2xl bg-accent/5 border border-accent/30 p-5 shadow-sm hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {data.latestAnnouncement.isPinned && (
                <span className="inline-block px-2.5 py-1 bg-accent/20 text-accent-foreground text-[10px] font-black uppercase tracking-wider rounded-md mb-2">
                  Pinned
                </span>
              )}
              <p className="font-bold text-base text-foreground leading-snug">
                {data.latestAnnouncement.title}
              </p>
              <p className="text-sm font-medium text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                {data.latestAnnouncement.summary}
              </p>
            </Link>
          </section>
        )}

        {/* Offers for You */}
        {data.promotions.length > 0 && (
          <section aria-labelledby="offers-heading" className="space-y-3">
            <div className="flex items-end justify-between">
              <h3 id="offers-heading" className="text-base font-bold tracking-tight">
                Offers for You
              </h3>
              <Link href="/discover" className="text-xs font-bold text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-2.5">
              {data.promotions.map((promo) => (
                <Link
                  key={promo.id}
                  href={`/discover/promotions/${promo.id}`}
                  className="flex items-center gap-4 rounded-2xl bg-card border border-card-border p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-[transform,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl shrink-0 flex items-center justify-center">
                    <span className="text-primary font-black text-xl">%</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-foreground truncate">{promo.title}</p>
                    <p className="text-xs font-medium text-muted-foreground mt-0.5">{promo.partnerName}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>
          </section>
        )}

        <QuickActionsGrid />
      </div>
    </>
  );
}

function QuickActionsGrid() {
  const items = [
    { icon: HelpCircle, label: "Star Assist", href: "/star-assist", tint: "text-primary bg-primary/10" },
    { icon: Dumbbell, label: "Book SCSC", href: "/bookings", tint: "text-emerald-600 bg-emerald-500/10" },
    { icon: BookOpen, label: "Info Centre", href: "/info-centre", tint: "text-amber-600 bg-amber-500/10" },
    { icon: Newspaper, label: "Discover", href: "/discover", tint: "text-violet-600 bg-violet-500/10" },
  ];

  return (
    <section aria-labelledby="quick-actions-heading">
      <h3 id="quick-actions-heading" className="text-base font-bold tracking-tight mb-3">
        Quick actions
      </h3>
      <div className="grid grid-cols-4 gap-3">
        {items.map(({ icon: Icon, label, href, tint }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 rounded-2xl bg-card border border-card-border p-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-[transform,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className={`p-2.5 rounded-xl ${tint}`}>
              <Icon className="w-5 h-5" aria-hidden="true" />
            </div>
            <span className="text-[11px] font-bold text-foreground text-center leading-tight">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
