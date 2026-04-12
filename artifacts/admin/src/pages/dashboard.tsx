import { useQuery } from "@tanstack/react-query";
import { apiRequest, formatDate } from "@/lib/api";
import { AdminLayout } from "@/components/layout/admin-layout";
import {
  Ticket, ShieldCheck, Calendar, Users, UserCheck, UserX,
  TrendingUp, Clock, CheckCircle2
} from "lucide-react";

interface DashboardData {
  openTickets: number;
  inProgressTickets: number;
  pendingVerifications: number;
  totalUsers: number;
  residentCount: number;
  guestCount: number;
  todayBookings: number;
  recentUsers: Array<{ id: string; name: string; email: string; userType: string; createdAt: string }>;
  recentTickets: Array<{ id: string; ticketNumber: string; title: string; status: string; category: string; createdAt: string }>;
}

const statusColors: Record<string, string> = {
  open: "bg-red-100 text-red-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-600",
};

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => apiRequest<DashboardData>("GET", "/admin/dashboard"),
  });

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">StarCity Estate overview</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">Loading...</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Open Tickets", value: data?.openTickets ?? 0, icon: Ticket, color: "text-red-600", bg: "bg-red-50" },
              { label: "Pending Verifications", value: data?.pendingVerifications ?? 0, icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Today's Bookings", value: data?.todayBookings ?? 0, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Total Users", value: data?.totalUsers ?? 0, icon: Users, color: "text-primary", bg: "bg-primary/5" },
            ].map(stat => (
              <div key={stat.label} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-xs font-medium text-muted-foreground mb-3">User Breakdown</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-foreground">Residents</span>
                  </div>
                  <span className="text-sm font-semibold">{data?.residentCount ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserX className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">Guests</span>
                  </div>
                  <span className="text-sm font-semibold">{data?.guestCount ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="text-sm text-foreground">In Progress Tickets</span>
                  </div>
                  <span className="text-sm font-semibold">{data?.inProgressTickets ?? 0}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-card rounded-xl border border-border p-4">
              <p className="text-xs font-medium text-muted-foreground mb-3">Recent Tickets</p>
              {data?.recentTickets?.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tickets yet</p>
              ) : (
                <div className="space-y-2">
                  {data?.recentTickets?.map(ticket => (
                    <div key={ticket.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{ticket.title}</p>
                        <p className="text-xs text-muted-foreground">{ticket.ticketNumber} · {formatDate(ticket.createdAt)}</p>
                      </div>
                      <span className={`ml-3 px-2 py-0.5 rounded text-xs font-medium ${statusColors[ticket.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs font-medium text-muted-foreground mb-3">Recent Registrations</p>
            {data?.recentUsers?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Name</th>
                      <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Email</th>
                      <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Type</th>
                      <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.recentUsers?.map(user => (
                      <tr key={user.id} className="border-b border-border/50 last:border-0">
                        <td className="py-2.5 px-2 font-medium text-foreground">{user.name}</td>
                        <td className="py-2.5 px-2 text-muted-foreground">{user.email}</td>
                        <td className="py-2.5 px-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${user.userType === "resident" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                            {user.userType}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-muted-foreground">{formatDate(user.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
