import Link from "next/link";
import { logout } from "@/app/(resident)/logout-action";
import NotificationBell from "@/components/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { LogOut } from "lucide-react";
import { getTranslations } from "next-intl/server";

interface AppHeaderProps {
  name: string;
  subtitle?: string | null;
  greeting?: string;
}

/**
 * Gradient teal header with greeting, unit info, and utility controls.
 * Use as the visible hero on top-level resident pages. Server Component —
 * the interactive children (NotificationBell, ThemeToggle, LocaleSwitcher,
 * logout form) handle their own client boundaries.
 */
export async function AppHeader({ name, subtitle, greeting }: AppHeaderProps) {
  const t = await getTranslations("header");

  return (
    <header className="bg-gradient-teal text-primary-foreground relative overflow-hidden rounded-b-[2.5rem] shadow-lg shadow-primary/20">
      {/* Soft decorative blobs */}
      <div aria-hidden="true" className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full" />
      <div aria-hidden="true" className="absolute -bottom-16 -left-10 w-48 h-48 bg-accent/20 blur-3xl rounded-full" />

      <div className="relative z-10 px-6 pt-8 pb-8 sm:pt-10">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {greeting ? (
              <p className="text-primary-foreground/70 font-semibold text-xs tracking-[0.18em] uppercase mb-1.5">
                {greeting}
              </p>
            ) : null}
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight truncate">
              {name}
            </h1>
            {subtitle ? (
              <p className="text-accent font-semibold text-sm mt-2 flex items-center gap-2">
                <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="truncate">{subtitle}</span>
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <div className="text-primary-foreground [&_button]:text-primary-foreground [&_button:hover]:bg-white/15 [&_a]:text-primary-foreground">
              <LocaleSwitcher />
            </div>
            <div className="text-primary-foreground [&_button]:text-primary-foreground [&_button:hover]:bg-white/15">
              <ThemeToggle />
            </div>
            <div className="p-2.5 rounded-lg hover:bg-white/15 transition-colors">
              <NotificationBell />
            </div>
            <form action={logout}>
              <button
                type="submit"
                aria-label={t("logout")}
                className="p-2.5 rounded-lg hover:bg-white/15 text-primary-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                title={t("logout")}
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Subtle bottom highlight */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
    </header>
  );
}

/**
 * Simpler top bar for deep routes (bill detail, ticket detail, etc.).
 * Shows a back link and the page title with the same gradient treatment.
 */
export function AppSubHeader({
  title,
  backHref,
  backLabel = "Back",
  action,
}: {
  title: string;
  backHref?: string;
  backLabel?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-gradient-teal text-primary-foreground relative overflow-hidden rounded-b-[2rem] shadow-md shadow-primary/15">
      <div aria-hidden="true" className="absolute top-0 right-0 w-40 h-40 bg-white/5 blur-3xl rounded-full" />
      <div className="relative z-10 px-5 pt-6 pb-7 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          {backHref ? (
            <Link
              href={backHref}
              className="inline-flex items-center gap-1 text-[11px] tracking-[0.18em] uppercase font-semibold text-primary-foreground/70 hover:text-primary-foreground transition-colors mb-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              {backLabel}
            </Link>
          ) : null}
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight truncate">{title}</h1>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
