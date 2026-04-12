import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, formatDate } from "@/lib/api";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Search, ChevronRight } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  userType: "guest" | "resident";
  unitNumber: string | null;
  developmentName: string | null;
  upgradeStatus: string;
  createdAt: string;
}

const upgradeStatusBadge: Record<string, string> = {
  none: "bg-gray-100 text-gray-500",
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("");
  const [, navigate] = useLocation();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search, userTypeFilter],
    queryFn: () => apiRequest<{ users: User[]; total: number }>(
      "GET",
      `/admin/users?search=${encodeURIComponent(search)}&userType=${userTypeFilter}&limit=50`
    ),
  });

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">User Management</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {data?.total ?? 0} total registered users
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select
            value={userTypeFilter}
            onChange={e => setUserTypeFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
          >
            <option value="">All types</option>
            <option value="guest">Guest</option>
            <option value="resident">Resident</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Loading users...</div>
        ) : data?.users?.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Email</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Unit</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Upgrade</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Joined</th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody>
                {data?.users?.map(user => (
                  <tr
                    key={user.id}
                    onClick={() => navigate(`/users/${user.id}`)}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.phone}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${user.userType === "resident" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {user.userType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">
                      {user.unitNumber ? (
                        <span>{user.unitNumber} <span className="text-muted-foreground/60">({user.developmentName})</span></span>
                      ) : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${upgradeStatusBadge[user.upgradeStatus] ?? ""}`}>
                        {user.upgradeStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">{formatDate(user.createdAt)}</td>
                    <td className="py-3 px-4">
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
