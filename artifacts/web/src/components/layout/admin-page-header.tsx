import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  action?: React.ReactNode;
}

/**
 * Consistent page header for admin pages. Provides a title/description
 * pair on the left and an optional action (primary button, link group) on
 * the right. Supports an optional back link for detail pages.
 */
export function AdminPageHeader({
  title,
  description,
  backHref,
  backLabel = "Back",
  action,
}: AdminPageHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 flex-1">
        {backHref ? (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] font-bold text-muted-foreground hover:text-foreground mb-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            <ChevronLeft className="w-3 h-3" aria-hidden="true" />
            {backLabel}
          </Link>
        ) : null}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0 flex items-center gap-2">{action}</div> : null}
    </header>
  );
}
