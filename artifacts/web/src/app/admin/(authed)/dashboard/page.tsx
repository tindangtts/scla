import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAdminDashboardStats } from "@/lib/queries/admin-dashboard";
import { AdminPageHeader } from "@/components/layout/admin-page-header";
import { formatMMK } from "@/lib/format";
import {
  Users,
  UserCircle,
  Ticket as TicketIcon,
  ActivitySquare,
  Calendar,
  Banknote,
  ArrowRight,
  ShieldCheck,
  Dumbbell,
} from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { staff } = await requireAdmin();
  const stats = await getAdminDashboardStats();

  const kpis: Array<{
    label: string;
    value: string;
    icon: ComponentType<{ className?: string }>;
    tint: string;
    href?: string;
  }> = [
    {
      label: "Residents",
      value: stats.totalResidents.toLocaleString(),
      icon: Users,
      tint: "text-primary bg-primary/10",
      href: "/admin/users?role=resident",
    },
    {
      label: "Guests",
      value: stats.totalGuests.toLocaleString(),
      icon: UserCircle,
      tint: "text-violet-600 bg-violet-500/10",
      href: "/admin/users?role=guest",
    },
    {
      label: "Open tickets",
      value: stats.openTickets.toLocaleString(),
      icon: TicketIcon,
      tint: "text-destructive bg-destructive/10",
      href: "/admin/tickets?status=open",
    },
    {
      label: "In progress",
      value: stats.inProgressTickets.toLocaleString(),
      icon: ActivitySquare,
      tint: "text-amber-600 bg-amber-500/10",
      href: "/admin/tickets?status=in_progress",
    },
    {
      label: "Active bookings",
      value: stats.activeBookings.toLocaleString(),
      icon: Calendar,
      tint: "text-emerald-600 bg-emerald-500/10",
      href: "/admin/facilities/bookings",
    },
    {
      label: "Revenue collected",
      value: formatMMK(stats.totalRevenue),
      icon: Banknote,
      tint: "text-accent-foreground bg-accent/20",
    },
  ];

  const quickLinks = [
    { href: "/admin/users", label: "Manage users", icon: Users },
    { href: "/admin/tickets", label: "View tickets", icon: TicketIcon },
    { href: "/admin/facilities/bookings", label: "View bookings", icon: Calendar },
    { href: "/admin/upgrade-requests", label: "Upgrade requests", icon: ShieldCheck },
    { href: "/admin/facilities", label: "Facilities", icon: Dumbbell },
  ];

  return (
    <div>
      <AdminPageHeader
        title={`Welcome back, ${staff.name.split(" ")[0]}`}
        description="Live estate operations at a glance. Drill into KPIs, tickets, and bookings."
      />

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
        {kpis.map((kpi) => {
          const content = (
            <div className="rounded-2xl bg-card border border-card-border p-5 shadow-sm transition-all group-hover:shadow-md group-hover:-translate-y-0.5 h-full">
              <div className="flex items-start justify-between mb-3">
                <div className={cn("p-2 rounded-xl", kpi.tint)}>
                  <kpi.icon className="w-4 h-4" aria-hidden="true" />
                </div>
                {kpi.href ? (
                  <ArrowRight
                    className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform"
                    aria-hidden="true"
                  />
                ) : null}
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {kpi.label}
              </p>
              <p className="text-2xl font-extrabold text-foreground mt-1 tracking-tight tabular-nums">
                {kpi.value}
              </p>
            </div>
          );
          return kpi.href ? (
            <Link
              key={kpi.label}
              href={kpi.href}
              className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
            >
              {content}
            </Link>
          ) : (
            <div key={kpi.label} className="group">
              {content}
            </div>
          );
        })}
      </div>

      {/* Quick nav */}
      <section aria-labelledby="quick-nav-heading" className="space-y-3">
        <h2 id="quick-nav-heading" className="text-sm font-bold tracking-tight">
          Quick navigation
        </h2>
        <div className="flex flex-wrap gap-2">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-card-border text-sm font-bold text-foreground hover:bg-muted hover:border-primary/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <link.icon className="w-4 h-4 text-primary" aria-hidden="true" />
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
