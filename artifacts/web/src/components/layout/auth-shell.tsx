import Link from "next/link";
import { Building2, Home, Users, TreePalm } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
  eyebrow?: string;
  children: React.ReactNode;
  /**
   * When true, tints the hero block with a darker slate gradient — used on
   * the staff sign-in to differentiate from the resident experience.
   */
  staff?: boolean;
}

/**
 * Residential-style auth shell with warm hero panel and curved divider.
 * Two-panel on desktop, compact stacked on mobile.
 */
export function AuthShell({
  title,
  subtitle,
  footer,
  eyebrow,
  children,
  staff = false,
}: AuthShellProps) {
  return (
    <div className="min-h-[100dvh] bg-muted grid lg:grid-cols-[1.1fr_1fr]">
      {/* Hero panel */}
      <div
        className={`relative overflow-hidden px-8 pt-8 pb-14 lg:px-12 lg:pt-12 lg:pb-12 flex flex-col justify-between text-white ${
          staff
            ? "bg-[linear-gradient(135deg,hsl(220_30%_14%),hsl(185_60%_22%))]"
            : "bg-gradient-teal"
        }`}
      >
        {/* Warm ambient glow spots */}
        <div
          aria-hidden="true"
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-[100px] opacity-30"
          style={{ background: "hsl(40 90% 50%)" }}
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full blur-[80px] opacity-20"
          style={{ background: "hsl(185 80% 60%)" }}
        />

        {/* Abstract building silhouettes — decorative SVG */}
        <div aria-hidden="true" className="absolute bottom-0 left-0 right-0 opacity-[0.06] pointer-events-none hidden lg:block">
          <svg viewBox="0 0 800 200" fill="currentColor" className="w-full" preserveAspectRatio="xMidYMax slice">
            <rect x="40" y="60" width="60" height="140" rx="2" />
            <rect x="50" y="80" width="8" height="10" rx="1" fill="currentColor" opacity="0.5" />
            <rect x="65" y="80" width="8" height="10" rx="1" fill="currentColor" opacity="0.5" />
            <rect x="80" y="80" width="8" height="10" rx="1" fill="currentColor" opacity="0.5" />
            <rect x="50" y="100" width="8" height="10" rx="1" fill="currentColor" opacity="0.5" />
            <rect x="65" y="100" width="8" height="10" rx="1" fill="currentColor" opacity="0.5" />
            <rect x="80" y="100" width="8" height="10" rx="1" fill="currentColor" opacity="0.5" />
            <rect x="120" y="30" width="80" height="170" rx="2" />
            <rect x="135" y="50" width="10" height="12" rx="1" fill="currentColor" opacity="0.5" />
            <rect x="155" y="50" width="10" height="12" rx="1" fill="currentColor" opacity="0.5" />
            <rect x="175" y="50" width="10" height="12" rx="1" fill="currentColor" opacity="0.5" />
            <rect x="135" y="75" width="10" height="12" rx="1" fill="currentColor" opacity="0.5" />
            <rect x="155" y="75" width="10" height="12" rx="1" fill="currentColor" opacity="0.5" />
            <rect x="175" y="75" width="10" height="12" rx="1" fill="currentColor" opacity="0.5" />
            <rect x="135" y="100" width="10" height="12" rx="1" fill="currentColor" opacity="0.5" />
            <rect x="155" y="100" width="10" height="12" rx="1" fill="currentColor" opacity="0.5" />
            <rect x="175" y="100" width="10" height="12" rx="1" fill="currentColor" opacity="0.5" />
            <rect x="230" y="80" width="50" height="120" rx="2" />
            <rect x="310" y="45" width="70" height="155" rx="2" />
            <rect x="410" y="90" width="55" height="110" rx="2" />
            <rect x="500" y="55" width="65" height="145" rx="2" />
            <rect x="600" y="70" width="50" height="130" rx="2" />
            <rect x="680" y="50" width="80" height="150" rx="2" />
          </svg>
        </div>

        {/* Brand header */}
        <div className="relative flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
            <Building2 className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <p className="font-extrabold tracking-tight text-lg leading-tight">Star City Living</p>
            <p className="text-white/70 text-xs font-medium">Yangon &middot; Myanmar</p>
          </div>
        </div>

        {/* Hero text — compact on mobile */}
        <div className="relative max-w-md mt-6 lg:mt-0">
          {eyebrow ? (
            <p className="text-accent font-bold text-xs tracking-[0.2em] uppercase mb-2 lg:mb-3">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-2xl lg:text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.1]">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 lg:mt-4 text-white/80 text-sm lg:text-base leading-relaxed font-medium">{subtitle}</p>
          ) : null}

          {/* Community icons — small decorative row */}
          {!staff && (
            <div className="flex items-center gap-3 mt-4 lg:mt-6">
              {[Home, Users, TreePalm].map((Icon, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center"
                  aria-hidden="true"
                >
                  <Icon className="w-4 h-4 text-white/70" />
                </div>
              ))}
              <span className="text-white/50 text-xs font-medium ml-1">Community &middot; Comfort &middot; Home</span>
            </div>
          )}
        </div>

        {/* Footer links */}
        <div className="relative flex items-center justify-between text-xs font-medium text-white/60 mt-6 lg:mt-0">
          <div className="flex items-center gap-3">
            <span>&copy; {new Date().getFullYear()} StarCity Estate</span>
          </div>
          {!staff ? (
            <Link
              href="/admin/login"
              className="hover:text-white underline-offset-4 hover:underline transition-colors"
            >
              Staff portal &rarr;
            </Link>
          ) : (
            <Link
              href="/login"
              className="hover:text-white underline-offset-4 hover:underline transition-colors"
            >
              &larr; Resident portal
            </Link>
          )}
        </div>

        {/* Curved wave divider — visible on mobile stacked layout */}
        <div aria-hidden="true" className="absolute -bottom-px left-0 right-0 lg:hidden">
          <svg viewBox="0 0 1440 48" fill="none" className="w-full" preserveAspectRatio="none">
            <path
              d="M0 48h1440V20C1320 4 1200 0 1080 8c-120 8-240 24-360 28S480 36 360 28C240 20 120 4 0 0v48z"
              className="fill-muted"
            />
          </svg>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12 relative -mt-1 lg:mt-0">
        <div className="absolute top-4 right-4 flex items-center gap-1">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
        <div className="w-full max-w-sm">
          {children}
          {footer ? <div className="mt-6 text-center">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
