import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAllFacilities } from "@/lib/queries/admin-facilities";
import { AdminPageHeader } from "@/components/layout/admin-page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { formatMMK } from "@/lib/format";
import { Dumbbell, Clock, Users, CalendarRange, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function formatCategory(category: string) {
  return category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function AdminFacilitiesPage() {
  await requireAdmin();
  const facilities = await getAllFacilities();

  return (
    <div>
      <AdminPageHeader
        title="Facilities"
        description="Manage SCSC amenities and monitor bookings across the estate."
        action={
          <Link
            href="/admin/facilities/bookings"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            <CalendarRange className="w-4 h-4" aria-hidden="true" />
            View all bookings
          </Link>
        }
      />

      {facilities.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No facilities configured"
          description="Facilities added via the database migration will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {facilities.map((facility) => (
            <div
              key={facility.id}
              className="rounded-2xl bg-card border border-card-border p-5 shadow-sm flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-wider">
                    {formatCategory(facility.category)}
                  </span>
                  <p className="text-base font-extrabold tracking-tight mt-1.5">{facility.name}</p>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0",
                    facility.isAvailable
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "bg-destructive/10 text-destructive",
                  )}
                >
                  {facility.isAvailable ? "Available" : "Unavailable"}
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-3 text-sm flex-1">
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Member rate
                  </dt>
                  <dd className="text-sm font-bold tabular-nums mt-0.5">
                    {formatMMK(facility.memberRate)}/hr
                  </dd>
                </div>
                <div className="flex items-start gap-1.5">
                  <Users className="w-3.5 h-3.5 text-muted-foreground mt-0.5" aria-hidden="true" />
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Capacity
                    </dt>
                    <dd className="text-sm font-bold">{facility.maxCapacity}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-1.5 col-span-2">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground mt-0.5" aria-hidden="true" />
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Hours
                    </dt>
                    <dd className="text-sm font-bold tabular-nums">
                      {facility.openingTime.substring(0, 5)} – {facility.closingTime.substring(0, 5)}
                    </dd>
                  </div>
                </div>
              </dl>

              <Link
                href={`/admin/facilities/bookings?facilityId=${facility.id}`}
                className="inline-flex items-center justify-between mt-5 pt-4 border-t border-border text-sm font-bold text-primary hover:text-primary/80 transition-colors"
              >
                View bookings
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
