import { requireAdmin } from "@/lib/auth";
import { getAllFacilities } from "@/lib/queries/admin-facilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatCategory(category: string) {
  return category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function AdminFacilitiesPage() {
  await requireAdmin();
  const facilities = await getAllFacilities();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Facilities</h1>
        <Link href="/admin/facilities/bookings" className="text-sm text-primary hover:underline">
          View All Bookings
        </Link>
      </div>

      {facilities.length === 0 ? (
        <p className="text-muted-foreground">No facilities found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {facilities.map((facility) => (
            <Card key={facility.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{facility.name}</CardTitle>
                  {facility.isAvailable ? (
                    <Badge variant="secondary" className="text-green-600">
                      Available
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Unavailable</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <div>
                  <span className="text-muted-foreground">Category:</span>{" "}
                  {formatCategory(facility.category)}
                </div>
                <div>
                  <span className="text-muted-foreground">Member Rate:</span> {facility.memberRate}{" "}
                  MMK/hr
                </div>
                <div>
                  <span className="text-muted-foreground">Capacity:</span> {facility.maxCapacity}
                </div>
                <div>
                  <span className="text-muted-foreground">Hours:</span>{" "}
                  {facility.openingTime.substring(0, 5)} - {facility.closingTime.substring(0, 5)}
                </div>
                <div className="pt-2">
                  <Link
                    href={`/admin/facilities/bookings?facilityId=${facility.id}`}
                    className="text-primary hover:underline text-sm"
                  >
                    View Bookings &rarr;
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
