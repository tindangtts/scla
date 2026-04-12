import { requireAdmin } from "@/lib/auth";
import { adminLogout } from "./logout-action";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { getTranslations } from "next-intl/server";
import { AdminNavLink, type AdminNavIcon } from "./nav-link";
import { LogOut, Building2 } from "lucide-react";

type NavKey =
  | "dashboard"
  | "users"
  | "upgradeRequests"
  | "tickets"
  | "facilities"
  | "content"
  | "staff"
  | "auditLogs"
  | "wallets";

interface NavItem {
  key: NavKey;
  href: string;
  icon: AdminNavIcon;
}

const navItems: NavItem[] = [
  { key: "dashboard", href: "/admin/dashboard", icon: "dashboard" },
  { key: "users", href: "/admin/users", icon: "users" },
  { key: "upgradeRequests", href: "/admin/upgrade-requests", icon: "shield" },
  { key: "tickets", href: "/admin/tickets", icon: "ticket" },
  { key: "facilities", href: "/admin/facilities", icon: "dumbbell" },
  { key: "content", href: "/admin/content", icon: "file" },
  { key: "staff", href: "/admin/staff", icon: "userCog" },
  { key: "auditLogs", href: "/admin/audit-logs", icon: "scroll" },
  { key: "wallets", href: "/admin/wallets", icon: "wallet" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, staff } = await requireAdmin();
  const t = await getTranslations("admin");
  const staffName = staff.name || user.email || "Admin";
  const staffRole = staff.role.replace(/_/g, " ");
  const initial = staffName.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen bg-muted">
      <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col bg-sidebar text-sidebar-foreground">
        <div className="px-4 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shadow-sm">
              <Building2 className="w-5 h-5 text-accent-foreground" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight tracking-tight">StarCity Admin</p>
              <p className="text-sidebar-foreground/60 text-[11px] font-medium">Estate Management</p>
            </div>
          </div>
        </div>

        <nav aria-label="Admin navigation" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <AdminNavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={t(item.key)}
              rootHref="/admin/dashboard"
            />
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-sidebar-border space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center">
              <span className="text-accent text-sm font-bold" aria-hidden="true">
                {initial}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{staffName}</p>
              <p className="text-sidebar-foreground/60 text-[11px] capitalize truncate">
                {staffRole}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-sidebar-foreground [&_button]:text-sidebar-foreground [&_button:hover]:bg-sidebar-accent/60 [&_a]:text-sidebar-foreground">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>

          <form action={adminLogout}>
            <button
              type="submit"
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              {t("signOut")}
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar (lg:hidden) — sidebar collapses to avoid cramped nav on small screens */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden bg-sidebar text-sidebar-foreground px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Building2 className="w-4 h-4 text-accent-foreground" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">StarCity Admin</p>
              <p className="text-[10px] text-sidebar-foreground/60 truncate capitalize">
                {staffName} · {staffRole}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 [&_button]:text-sidebar-foreground [&_button:hover]:bg-sidebar-accent/60 [&_a]:text-sidebar-foreground">
            <LocaleSwitcher />
            <ThemeToggle />
            <form action={adminLogout}>
              <button
                type="submit"
                aria-label={t("signOut")}
                className="p-2 rounded-md hover:bg-sidebar-accent/60 transition-colors"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
