import { requireAdmin } from "@/lib/auth";
import { getAllBookings, getAllFacilities } from "@/lib/queries/admin-facilities";
import { AdminPageHeader } from "@/components/layout/admin-page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatMMK, formatDate, humanizeStatus, statusBadgeClass } from "@/lib/format";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

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
      <AdminPageHeader
        title="Bookings"
        description={`${bookings.length} booking${bookings.length === 1 ? "" : "s"}`}
        backHref="/admin/facilities"
        backLabel="Facilities"
      />

      <form
        method="GET"
        className="rounded-2xl bg-card border border-card-border p-3 shadow-sm mb-6 flex flex-wrap items-end gap-2.5"
      >
        <div className="space-y-1 flex-1 min-w-[160px]">
          <label
            htmlFor="facilityId"
            className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
          >
            Facility
          </label>
          <select
            id="facilityId"
            name="facilityId"
            defaultValue={facilityId || ""}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          >
            <option value="">All facilities</option>
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1 flex-1 min-w-[160px]">
          <label
            htmlFor="status"
            className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status || ""}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          >
            <option value="">All statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <Button type="submit" className="font-bold">
          Apply
        </Button>
      </form>

      {bookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No bookings match"
          description="Try clearing filters to see all bookings."
        />
      ) : (
        <div className="rounded-2xl bg-card border border-card-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/60 border-b border-border">
                  <th className="py-3 px-4 font-bold">Booking #</th>
                  <th className="py-3 px-4 font-bold">Facility</th>
                  <th className="py-3 px-4 font-bold">User</th>
                  <th className="py-3 px-4 font-bold">Date</th>
                  <th className="py-3 px-4 font-bold">Time</th>
                  <th className="py-3 px-4 font-bold text-right">Amount</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold tabular-nums">
                      {booking.bookingNumber}
                    </td>
                    <td className="py-3 px-4">{booking.facilityName}</td>
                    <td className="py-3 px-4">{booking.userName}</td>
                    <td className="py-3 px-4 text-muted-foreground tabular-nums">
                      {formatDate(booking.date)}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground tabular-nums">
                      {booking.startTime.substring(0, 5)}–{booking.endTime.substring(0, 5)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold tabular-nums">
                      {formatMMK(booking.totalAmount)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          statusBadgeClass(booking.status),
                        )}
                      >
                        {humanizeStatus(booking.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-wider">
                        {humanizeStatus(booking.paymentStatus)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
