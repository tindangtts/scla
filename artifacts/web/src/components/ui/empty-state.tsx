import * as React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-10 px-6 rounded-2xl border border-dashed border-border bg-card/40",
        className,
      )}
      {...props}
    >
      {Icon ? (
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
          <Icon className="w-6 h-6" />
        </div>
      ) : null}
      <p className="font-bold text-foreground tracking-tight">{title}</p>
      {description ? (
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
