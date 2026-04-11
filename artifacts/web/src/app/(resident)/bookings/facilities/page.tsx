import { requireAuth } from "@/lib/auth";
import { getFacilities } from "@/lib/queries/facilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  swimming_pool: "Swimming Pool",
  tennis_court: "Tennis Court",
  basketball_court: "Basketball Court",
  gym: "Gym",
  badminton_court: "Badminton Court",
  function_room: "Function Room",
  squash_court: "Squash Court",
};

const CATEGORY_FILTERS = [
  { label: "All", value: undefined, href: "/bookings/facilities" },
  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    label,
    value,
    href: `/bookings/facilities?category=${value}`,
  })),
];

function formatMMK(amount: string | number) {
  return Number(amount).toLocaleString() + " MMK";
}

export default async function FacilitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  await requireAuth();
  const { category } = await searchParams;

  const facilities = await getFacilities(category);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">SCSC Facilities</h2>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORY_FILTERS.map((filter) => (
          <Link key={filter.label} href={filter.href}>
            <Badge
              variant={
                (category ?? undefined) === filter.value
                  ? "default"
                  : "outline"
              }
              className="cursor-pointer whitespace-nowrap"
            >
              {filter.label}
            </Badge>
          </Link>
        ))}
      </div>

      {/* Facilities List */}
      {facilities.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No facilities found.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {facilities.map((facility) => (
            <Link
              key={facility.id}
              href={`/bookings/facilities/${facility.id}`}
            >
              <Card className="hover:bg-muted/50 transition-colors mb-3">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{facility.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {facility.description}
                      </p>
                    </div>
                    <Badge variant="secondary" className="ml-2 shrink-0">
                      {CATEGORY_LABELS[facility.category] ?? facility.category}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">
                      {formatMMK(facility.memberRate)}
                      <span className="text-xs text-muted-foreground font-normal">
                        {" "}
                        / hour
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
