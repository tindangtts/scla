import { requireAdmin } from "@/lib/auth";
import {
  getAllBookings,
  getAllFacilities,
} from "@/lib/queries/admin-facilities";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

function bookingStatusBadge(status: string) {
  switch (status) {
    case "upcoming":
      return <Badge variant="default">Upcoming</Badge>;
    case "completed":
      return (
        <Badge variant="secondary" className="text-green-600">
          Completed
        </Badge>
      );
    case "cancelled":
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function paymentStatusBadge(status: string) {
  switch (status) {
    case "paid":
      return (
        <Badge variant="secondary" className="text-green-600">
          Paid
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="secondary" className="text-yellow-600">
          Pending
        </Badge>
      );
    case "refunded":
      return <Badge variant="outline">Refunded</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ facilityId?: string; status?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const facilityId = params.facilityId;
  const status = params.status;

  const [bookings, facilities] = await Promise.all([
    getAllBookings(facilityId, status),
    getAllFacilities(),
  ]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Link
          href="/admin/facilities"
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Facilities
        </Link>
        <h1 className="text-2xl font-bold">Bookings ({bookings.length})</h1>
      </div>

      {/* Filter bar */}
      <form method="GET" className="mb-4 flex gap-2 items-center flex-wrap">
        <label htmlFor="facilityId" className="text-sm font-medium">
          Facility:
        </label>
        <select
          id="facilityId"
          name="facilityId"
          defaultValue={facilityId || ""}
          className="border rounded px-3 py-1.5 text-sm bg-background"
        >
          <option value="">All Facilities</option>
          {facilities.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>

        <label htmlFor="status" className="text-sm font-medium ml-2">
          Status:
        </label>
        <select
          id="status"
          name="status"
          defaultValue={status || ""}
          className="border rounded px-3 py-1.5 text-sm bg-background"
        >
          <option value="">All</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <button
          type="submit"
          className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm"
        >
          Filter
        </button>
      </form>

      {bookings.length === 0 ? (
        <p className="text-muted-foreground">No bookings found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-2">Booking #</th>
                <th className="p-2">Facility</th>
                <th className="p-2">User</th>
                <th className="p-2">Date</th>
                <th className="p-2">Time</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Status</th>
                <th className="p-2">Payment</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-b hover:bg-muted/50">
                  <td className="p-2 font-mono">{booking.bookingNumber}</td>
                  <td className="p-2">{booking.facilityName}</td>
                  <td className="p-2">{booking.userName}</td>
                  <td className="p-2">{booking.date}</td>
                  <td className="p-2">
                    {booking.startTime.substring(0, 5)} -{" "}
                    {booking.endTime.substring(0, 5)}
                  </td>
                  <td className="p-2">{booking.totalAmount} MMK</td>
                  <td className="p-2">{bookingStatusBadge(booking.status)}</td>
                  <td className="p-2">
                    {paymentStatusBadge(booking.paymentStatus)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
