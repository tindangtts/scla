"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentType } from "react";

interface AdminNavLinkProps {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  rootHref?: string;
}

/**
 * Client-side active-state link for the admin sidebar. Keeps the layout
 * itself a Server Component so we don't pull auth data across the client
 * boundary.
 */
export function AdminNavLink({ href, label, icon: Icon, rootHref }: AdminNavLinkProps) {
  const pathname = usePathname();
  const isActive =
    pathname === href ||
    (href !== (rootHref ?? "/admin/dashboard") && pathname.startsWith(href));

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
          : "text-sidebar-foreground/85 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{label}</span>
      {isActive ? (
        <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-70" aria-hidden="true" />
      ) : null}
    </Link>
  );
}
