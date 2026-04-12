import { requireAdmin } from "@/lib/auth";
import { getAdminDashboardStats } from "@/lib/queries/admin-dashboard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatRevenue(value: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) return "0";
  return num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default async function AdminDashboardPage() {
  await requireAdmin();
  const stats = await getAdminDashboardStats();

  const kpiCards = [
    { label: "Total Residents", value: stats.totalResidents },
    { label: "Total Guests", value: stats.totalGuests },
    { label: "Open Tickets", value: stats.openTickets },
    { label: "In Progress Tickets", value: stats.inProgressTickets },
    { label: "Active Bookings", value: stats.activeBookings },
    { label: "Revenue", value: formatRevenue(stats.totalRevenue) },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {kpiCards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/users"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
        >
          Manage Users
        </Link>
        <Link
          href="/admin/tickets"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
        >
          View Tickets
        </Link>
        <Link
          href="/admin/facilities"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
        >
          View Bookings
        </Link>
      </div>
    </div>
  );
}
