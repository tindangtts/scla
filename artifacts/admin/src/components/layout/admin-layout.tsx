import { Link, useLocation } from "wouter";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  LayoutDashboard, Users, ShieldCheck, FileText, Ticket,
  Dumbbell, HelpCircle, UserCog, LogOut, ChevronRight, Building2, ScrollText
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Users", icon: Users, href: "/users" },
  { label: "Upgrade Requests", icon: ShieldCheck, href: "/upgrade-requests" },
  { label: "Content", icon: FileText, href: "/content" },
  { label: "Tickets", icon: Ticket, href: "/tickets" },
  { label: "Facilities", icon: Dumbbell, href: "/facilities" },
  { label: "FAQs", icon: HelpCircle, href: "/faqs" },
  { label: "Staff", icon: UserCog, href: "/staff" },
  { label: "Audit Logs", icon: ScrollText, href: "/audit-logs" },
];

function NavItem({ item }: { item: typeof navItems[0] }) {
  const [location] = useLocation();
  const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
  return (
    <Link href={item.href}>
      <div className={cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all group",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
      )}>
        <item.icon className="w-4 h-4 flex-shrink-0" />
        <span>{item.label}</span>
        {isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
      </div>
    </Link>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { staff, logout } = useAdminAuth();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="w-60 flex-shrink-0 bg-sidebar flex flex-col">
        <div className="px-4 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Building2 className="w-4 h-4 text-accent-foreground" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-tight">StarCity Admin</p>
              <p className="text-sidebar-foreground/60 text-xs">Estate Management</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => <NavItem key={item.href} item={item} />)}
        </nav>

        <div className="px-4 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
              <span className="text-accent text-xs font-bold">
                {staff?.name?.charAt(0) ?? "A"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sidebar-foreground text-xs font-medium truncate">{staff?.name}</p>
              <p className="text-sidebar-foreground/50 text-xs capitalize truncate">
                {staff?.role?.replace(/_/g, " ")}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/40 text-xs transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
