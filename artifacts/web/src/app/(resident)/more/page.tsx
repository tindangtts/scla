import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { getTranslations } from "next-intl/server";
import {
  Compass,
  BookOpen,
  Bell,
  User,
  ChevronRight,
  Languages,
  Palette,
  Crown,
  Clock,
} from "lucide-react";
import type { ComponentType } from "react";

export default async function MorePage() {
  const t = await getTranslations("more");
  const ts = await getTranslations("settings");

  const menuItems: Array<{
    href: string;
    label: string;
    description: string;
    icon: ComponentType<{ className?: string }>;
    tint: string;
  }> = [
    {
      href: "/profile",
      label: t("profile"),
      description: t("profileDesc"),
      icon: User,
      tint: "text-primary bg-primary/10",
    },
    {
      href: "/membership",
      label: t("membership"),
      description: t("membershipDesc"),
      icon: Crown,
      tint: "text-amber-600 bg-amber-500/10",
    },
    {
      href: "/history",
      label: t("history"),
      description: t("historyDesc"),
      icon: Clock,
      tint: "text-blue-600 bg-blue-500/10",
    },
    {
      href: "/discover",
      label: t("discover"),
      description: t("discoverDesc"),
      icon: Compass,
      tint: "text-violet-600 bg-violet-500/10",
    },
    {
      href: "/info-centre",
      label: t("infoCentre"),
      description: t("infoCentreDesc"),
      icon: BookOpen,
      tint: "text-amber-600 bg-amber-500/10",
    },
    {
      href: "/notifications",
      label: t("notifications"),
      description: t("notificationsDesc"),
      icon: Bell,
      tint: "text-rose-600 bg-rose-500/10",
    },
  ];

  return (
    <>
      <AppHeader name={t("title")} subtitle="Settings and more" />

      <div className="px-5 -mt-8 pb-8 relative z-20 space-y-6">
        <section aria-labelledby="menu-heading" className="space-y-2.5">
          <h2 id="menu-heading" className="sr-only">
            Menu
          </h2>
          <ul className="space-y-2.5">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-2xl bg-card border border-card-border p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-[transform,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className={`p-2.5 rounded-xl shrink-0 ${item.tint}`}>
                    <item.icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground font-medium line-clamp-1">
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="settings-heading" className="space-y-3">
          <h3 id="settings-heading" className="text-base font-bold tracking-tight">
            {ts("language")} & {ts("theme").toLowerCase()}
          </h3>
          <div className="rounded-2xl bg-card border border-card-border shadow-sm divide-y divide-border overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-muted text-muted-foreground">
                  <Languages className="w-4 h-4" aria-hidden="true" />
                </div>
                <span className="text-sm font-bold">{ts("language")}</span>
              </div>
              <LocaleSwitcher />
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-muted text-muted-foreground">
                  <Palette className="w-4 h-4" aria-hidden="true" />
                </div>
                <span className="text-sm font-bold">{ts("theme")}</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
