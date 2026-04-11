import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { getUserBookings } from "@/lib/queries/bookings";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_FILTERS = [
  { label: "All", value: undefined, href: "/bookings" },
  { label: "Upcoming", value: "upcoming", href: "/bookings?status=upcoming" },
  {
    label: "Completed",
    value: "completed",
    href: "/bookings?status=completed",
  },
  {
    label: "Cancelled",
    value: "cancelled",
    href: "/bookings?status=cancelled",
  },
];

function formatMMK(amount: string | number) {
  return Number(amount).toLocaleString() + " MMK";
}

function statusVariant(status: string) {
  switch (status) {
    case "upcoming":
      return "default" as const;
    case "completed":
      return "secondary" as const;
    case "cancelled":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireAuth();
  const { status } = await searchParams;

  const dbUsers = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, user.email!))
    .limit(1);

  const dbUser = dbUsers[0];
  if (!dbUser) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground">User account not found.</p>
      </div>
    );
  }

  const bookings = await getUserBookings(dbUser.id, status);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">My Bookings</h2>
        <Link href="/bookings/facilities">
          <Button size="sm">Book Facility</Button>
        </Link>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((filter) => (
          <Link key={filter.label} href={filter.href}>
            <Badge
              variant={
                (status ?? undefined) === filter.value ? "default" : "outline"
              }
              className="cursor-pointer whitespace-nowrap"
            >
              {filter.label}
            </Badge>
          </Link>
        ))}
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No bookings found.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Link key={booking.id} href={`/bookings/${booking.id}`}>
              <Card className="hover:bg-muted/50 transition-colors mb-3">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {booking.bookingNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.facilityName}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {booking.recurringGroupId && (
                        <Badge variant="outline" className="text-xs">
                          Recurring
                        </Badge>
                      )}
                      <Badge variant={statusVariant(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {booking.date} | {booking.startTime.substring(0, 5)} -{" "}
                      {booking.endTime.substring(0, 5)}
                    </p>
                    <p className="text-sm font-semibold">
                      {formatMMK(booking.totalAmount)}
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
