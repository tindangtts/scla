import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { getFacilities } from "@/lib/queries/facilities";
import { AppHeader } from "@/components/layout/app-header";
import { EmptyState } from "@/components/ui/empty-state";
import { formatMMK } from "@/lib/format";
import {
  Waves,
  Dumbbell,
  Trophy,
  Building,
  ChevronRight,
  CircleDashed,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentType } from "react";

export const dynamic = "force-dynamic";

const CATEGORY_META: Record<
  string,
  { label: string; icon: ComponentType<{ className?: string }>; tint: string }
> = {
  swimming_pool: { label: "Swimming Pool", icon: Waves, tint: "text-cyan-600 bg-cyan-500/10" },
  tennis_court: { label: "Tennis Court", icon: Trophy, tint: "text-emerald-600 bg-emerald-500/10" },
  basketball_court: {
    label: "Basketball Court",
    icon: Trophy,
    tint: "text-orange-600 bg-orange-500/10",
  },
  gym: { label: "Gym", icon: Dumbbell, tint: "text-primary bg-primary/10" },
  badminton_court: { label: "Badminton Court", icon: Trophy, tint: "text-violet-600 bg-violet-500/10" },
  function_room: { label: "Function Room", icon: Building, tint: "text-amber-600 bg-amber-500/10" },
  squash_court: { label: "Squash Court", icon: Trophy, tint: "text-rose-600 bg-rose-500/10" },
};

const CATEGORY_FILTERS = [
  { label: "All", value: undefined as string | undefined, href: "/bookings/facilities" },
  ...Object.entries(CATEGORY_META).map(([value, meta]) => ({
    label: meta.label,
    value,
    href: `/bookings/facilities?category=${value}`,
  })),
];

export default async function FacilitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  await requireAuth();
  const { category } = await searchParams;

  const facilities = await getFacilities(category);

  return (
    <>
      <AppHeader name="SCSC Facilities" subtitle="Pool · Courts · Gym · Function room" />

      <div className="px-5 -mt-8 pb-8 relative z-20 space-y-5">
        {/* Category filter */}
        <div
          role="tablist"
          aria-label="Filter by category"
          className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1"
        >
          {CATEGORY_FILTERS.map((filter) => {
            const isActive = (category ?? undefined) === filter.value;
            return (
              <Link
                key={filter.label}
                href={filter.href}
                role="tab"
                aria-selected={isActive}
                className={cn(
                  "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card border border-card-border text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>

        {/* Facilities */}
        {facilities.length === 0 ? (
          <EmptyState
            icon={CircleDashed}
            title="No facilities found"
            description="Try a different category or clear the filter."
          />
        ) : (
          <ul className="space-y-2.5">
            {facilities.map((facility) => {
              const meta = CATEGORY_META[facility.category];
              const Icon = meta?.icon ?? CircleDashed;
              return (
                <li key={facility.id}>
                  <Link
                    href={`/bookings/facilities/${facility.id}`}
                    className="flex items-start gap-3 rounded-2xl bg-card border border-card-border p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-[transform,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className={cn("p-3 rounded-2xl shrink-0", meta?.tint ?? "bg-muted text-muted-foreground")}>
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-wider">
                          {meta?.label ?? facility.category}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-foreground truncate">
                        {facility.name}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium line-clamp-2 mt-0.5">
                        {facility.description}
                      </p>
                      <p className="text-sm font-extrabold text-foreground mt-2 tabular-nums">
                        {formatMMK(facility.memberRate)}
                        <span className="text-xs font-medium text-muted-foreground"> / hour</span>
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground self-center shrink-0" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
