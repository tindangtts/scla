"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CreditCard, HelpCircle, Calendar, MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type NavLink = {
  href: string;
  label: string;
  icon: typeof Home;
};

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  const links: NavLink[] = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/bills", label: t("bills"), icon: CreditCard },
    { href: "/star-assist", label: t("starAssist"), icon: HelpCircle },
    { href: "/bookings", label: t("bookings"), icon: Calendar },
    { href: "/more", label: t("more"), icon: MoreHorizontal },
  ];

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-xl border-t border-border/60 pb-safe shadow-[0_-8px_32px_-8px_rgba(0,0,0,0.06)] lg:hidden"
    >
      <div className="max-w-md mx-auto flex items-center justify-around px-2 h-[4.5rem]">
        {links.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/" && pathname.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className="flex-1 h-full flex flex-col items-center justify-center gap-1 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
            >
              <div
                className={cn(
                  "p-2 rounded-2xl transition-all duration-300 ease-out",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm scale-110"
                    : "text-muted-foreground group-hover:bg-muted group-hover:text-foreground",
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "w-[1.125rem] h-[1.125rem]",
                    isActive ? "fill-current" : "",
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold transition-all duration-300",
                  isActive
                    ? "text-primary tracking-wide"
                    : "text-muted-foreground/80 tracking-tight",
                )}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
