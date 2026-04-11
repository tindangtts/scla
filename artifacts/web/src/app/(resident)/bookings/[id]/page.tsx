import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { getBookingById } from "@/lib/queries/bookings";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CancelButton } from "./cancel-button";

export const dynamic = "force-dynamic";

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

const CATEGORY_LABELS: Record<string, string> = {
  swimming_pool: "Swimming Pool",
  tennis_court: "Tennis Court",
  basketball_court: "Basketball Court",
  gym: "Gym",
  badminton_court: "Badminton Court",
  function_room: "Function Room",
  squash_court: "Squash Court",
};

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAuth();
  const { id } = await params;

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

  const booking = await getBookingById(id, dbUser.id);
  if (!booking) {
    notFound();
  }

  return (
    <div className="p-4 space-y-4">
      <Link
        href="/bookings"
        className="text-sm text-primary hover:underline"
      >
        &larr; Back to Bookings
      </Link>

      <Card>
        <CardContent className="pt-4 pb-4 space-y-4">
          <div className="flex items-start justify-between">
            <h2 className="text-xl font-bold">{booking.bookingNumber}</h2>
            <Badge variant={statusVariant(booking.status)}>
              {booking.status}
            </Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Facility</span>
              <span className="font-medium">{booking.facilityName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category</span>
              <span className="font-medium">
                {CATEGORY_LABELS[booking.facilityCategory] ??
                  booking.facilityCategory}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">{booking.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time</span>
              <span className="font-medium">
                {booking.startTime.substring(0, 5)} -{" "}
                {booking.endTime.substring(0, 5)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">
                {formatMMK(booking.totalAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment</span>
              <Badge variant="outline">{booking.paymentStatus}</Badge>
            </div>
            {booking.recurringGroupId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <Badge variant="outline">Recurring</Badge>
              </div>
            )}
            {booking.notes && (
              <div>
                <span className="text-muted-foreground">Notes</span>
                <p className="mt-1">{booking.notes}</p>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span className="font-medium">
                {new Date(booking.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {booking.status === "upcoming" && (
        <CancelButton
          bookingId={booking.id}
          hasRecurringGroup={!!booking.recurringGroupId}
        />
      )}
    </div>
  );
}
