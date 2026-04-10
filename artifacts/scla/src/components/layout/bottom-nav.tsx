import { Link, useLocation } from "wouter";
import { Home, Compass, Calendar, HelpCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export function BottomNav() {
  const [location] = useLocation();
  const { t } = useTranslation();

  const links = [
    { href: "/", label: t("nav.home"), icon: Home },
    { href: "/bills", label: t("nav.bills"), icon: Compass },
    { href: "/bookings", label: t("nav.bookings"), icon: Calendar },
    { href: "/star-assist", label: t("nav.assist"), icon: HelpCircle },
    { href: "/profile", label: t("nav.profile"), icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/50 pb-safe shadow-[0_-8px_32px_-8px_rgba(0,0,0,0.05)]">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 h-[4.5rem]">
        {links.map((link) => {
          const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex-1 h-full flex flex-col items-center justify-center gap-1 group"
              data-testid={`nav-${link.label.toLowerCase()}`}
            >
              <div className={cn(
                "p-2 rounded-2xl transition-all duration-300 ease-out",
                isActive ? "bg-primary text-primary-foreground shadow-sm scale-110" : "text-muted-foreground group-hover:bg-muted group-hover:text-foreground"
              )}>
                <Icon className={cn(
                  "w-[1.125rem] h-[1.125rem]",
                  isActive ? "fill-current" : ""
                )} />
              </div>
              <span className={cn(
                "text-[10px] font-bold transition-all duration-300",
                isActive ? "text-primary tracking-wide" : "text-muted-foreground/70 tracking-tight"
              )}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
