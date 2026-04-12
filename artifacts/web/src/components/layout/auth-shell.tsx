import Link from "next/link";
import { Building2 } from "lucide-react";
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
 * Two-panel auth shell: teal (or slate) hero on the left/top, form card on
 * the right/bottom. Fully responsive — stacks to a single column under lg.
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
        className={`relative overflow-hidden p-8 lg:p-12 flex flex-col justify-between text-white ${
          staff
            ? "bg-[linear-gradient(135deg,hsl(220_30%_14%),hsl(185_60%_22%))]"
            : "bg-gradient-teal"
        }`}
      >
        <div aria-hidden="true" className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-24 -left-16 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
            <Building2 className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <p className="font-extrabold tracking-tight text-lg leading-tight">Star City Living</p>
            <p className="text-white/70 text-xs font-medium">Yangon · Myanmar</p>
          </div>
        </div>

        <div className="relative max-w-md">
          {eyebrow ? (
            <p className="text-accent font-bold text-xs tracking-[0.2em] uppercase mb-3">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.1]">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-4 text-white/80 text-base leading-relaxed font-medium">{subtitle}</p>
          ) : null}
        </div>

        <div className="relative flex items-center justify-between text-xs font-medium text-white/60">
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} StarCity Estate</span>
          </div>
          {!staff ? (
            <Link
              href="/admin/login"
              className="hover:text-white underline-offset-4 hover:underline transition-colors"
            >
              Staff portal →
            </Link>
          ) : (
            <Link
              href="/login"
              className="hover:text-white underline-offset-4 hover:underline transition-colors"
            >
              ← Resident portal
            </Link>
          )}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12 relative">
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
