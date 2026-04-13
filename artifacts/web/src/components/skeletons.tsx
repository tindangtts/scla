import { cn } from "@/lib/utils";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}

/**
 * A skeleton that mimics the teal gradient AppHeader used on top-level
 * resident pages. Pairs with page-body skeletons to reduce CLS.
 */
export function HeroHeaderSkeleton({ withSubtitle = true }: { withSubtitle?: boolean }) {
  return (
    <div className="bg-gradient-teal rounded-b-[2.5rem] px-6 pt-10 pb-10 shadow-lg shadow-primary/20 relative overflow-hidden">
      <div aria-hidden="true" className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-xl rounded-full" />
      <div className="relative space-y-2">
        <div className="h-3 w-24 rounded-full bg-white/30 animate-pulse" />
        <div className="h-7 w-40 rounded-lg bg-white/30 animate-pulse" />
        {withSubtitle ? <div className="h-3 w-32 rounded-full bg-accent/40 animate-pulse" /> : null}
      </div>
    </div>
  );
}

export function SubHeaderSkeleton() {
  return (
    <div className="bg-gradient-teal rounded-b-[2rem] px-5 pt-6 pb-7 shadow-md shadow-primary/15 relative overflow-hidden">
      <div aria-hidden="true" className="absolute top-0 right-0 w-40 h-40 bg-white/5 blur-xl rounded-full" />
      <div className="relative space-y-2">
        <div className="h-2.5 w-16 rounded-full bg-white/30 animate-pulse" />
        <div className="h-6 w-48 rounded-lg bg-white/30 animate-pulse" />
      </div>
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-card-border bg-card p-5 space-y-3 shadow-sm", className)}>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * List skeleton sized to match resident list cards (icon + two-line text
 * + trailing chip). Scales for tickets, bookings, notifications, etc.
 */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <ul className="space-y-2.5">
      {Array.from({ length: rows }, (_, i) => (
        <li
          key={i}
          className="flex items-center gap-3 rounded-2xl bg-card border border-card-border p-4 shadow-sm"
        >
          <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-3/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
          <Skeleton className="h-5 w-14 rounded-full" />
        </li>
      ))}
    </ul>
  );
}

/**
 * Default resident-shell page skeleton — gradient hero + stat cards + list.
 */
export function PageSkeleton() {
  return (
    <>
      <HeroHeaderSkeleton />
      <div className="px-5 -mt-8 pb-8 relative z-20 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <ListSkeleton rows={3} />
      </div>
    </>
  );
}

/**
 * Detail-page skeleton — sub-header + big card + supporting card.
 */
export function DetailSkeleton() {
  return (
    <>
      <SubHeaderSkeleton />
      <div className="px-5 -mt-6 pb-8 relative z-20 space-y-4">
        <div className="rounded-2xl bg-card border border-card-border p-5 shadow-sm space-y-3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <div className="rounded-2xl bg-card border border-card-border p-5 shadow-sm space-y-3">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    </>
  );
}

/**
 * Admin shell skeleton — title strip + filter bar + table block.
 */
export function AdminTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>
      <Skeleton className="h-12 w-full rounded-2xl" />
      <div className="rounded-2xl bg-card border border-card-border shadow-sm overflow-hidden">
        <div className="divide-y divide-border">
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Skeleton className="h-3 w-1/5" />
              <Skeleton className="h-3 w-1/4" />
              <Skeleton className="h-3 w-1/6" />
              <Skeleton className="h-3 w-1/6" />
              <Skeleton className="h-5 w-16 rounded-full ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
