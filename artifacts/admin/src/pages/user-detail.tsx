import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { apiRequest, formatDate } from "@/lib/api";
import { AdminLayout } from "@/components/layout/admin-layout";
import { ArrowLeft, User, Phone, Mail, Home, Ticket, Calendar } from "lucide-react";
import { useState } from "react";

interface UserDetail {
  id: string; name: string; email: string; phone: string;
  userType: string; unitNumber: string | null; developmentName: string | null;
  upgradeStatus: string; residentId: string | null; createdAt: string;
  tickets: Array<{ id: string; ticketNumber: string; title: string; status: string; createdAt: string }>;
  bookings: Array<{ id: string; bookingNumber: string; facilityName: string; date: string; status: string }>;
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const [selectedType, setSelectedType] = useState("");
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-user", id],
    queryFn: () => apiRequest<UserDetail>("GET", `/admin/users/${id}`),
    enabled: !!id,
  });

  async function handleUpdate() {
    if (!selectedType || !id) return;
    setSaving(true);
    try {
      await apiRequest("PATCH", `/admin/users/${id}`, { userType: selectedType });
      qc.invalidateQueries({ queryKey: ["admin-user", id] });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setSelectedType("");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      open: "bg-red-100 text-red-700", in_progress: "bg-amber-100 text-amber-700",
      completed: "bg-green-100 text-green-700", upcoming: "bg-blue-100 text-blue-700",
      cancelled: "bg-gray-100 text-gray-600",
    };
    return map[s] ?? "bg-gray-100 text-gray-600";
  };

  if (isLoading) return <AdminLayout><div className="flex items-center justify-center h-64 text-muted-foreground text-sm">Loading...</div></AdminLayout>;
  if (!data) return <AdminLayout><div className="text-muted-foreground text-sm">User not found</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-6">
        <button onClick={() => navigate("/users")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Users
        </button>
        <h1 className="text-xl font-bold text-foreground">{data.name}</h1>
        <p className="text-sm text-muted-foreground">User ID: {data.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Account Info</p>
            <div className="space-y-2.5">
              {[
                { icon: User, label: "Name", value: data.name },
                { icon: Mail, label: "Email", value: data.email },
                { icon: Phone, label: "Phone", value: data.phone },
                { icon: Home, label: "Unit", value: data.unitNumber ? `${data.unitNumber} (${data.developmentName})` : "—" },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-2.5">
                  <item.icon className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-medium text-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border flex gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${data.userType === "resident" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                {data.userType}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                {data.upgradeStatus}
              </span>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Change User Type</p>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background mb-2"
            >
              <option value="">Select new type...</option>
              <option value="guest">Guest</option>
              <option value="resident">Resident</option>
            </select>
            <button
              onClick={handleUpdate}
              disabled={!selectedType || saving}
              className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : "Update"}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Ticket className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Tickets ({data.tickets.length})</p>
            </div>
            {data.tickets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tickets</p>
            ) : (
              <div className="space-y-2">
                {data.tickets.map(t => (
                  <div key={t.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{t.title}</p>
                      <p className="text-xs text-muted-foreground">{t.ticketNumber} · {formatDate(t.createdAt)}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadge(t.status)}`}>{t.status.replace("_", " ")}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Bookings ({data.bookings.length})</p>
            </div>
            {data.bookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bookings</p>
            ) : (
              <div className="space-y-2">
                {data.bookings.map(b => (
                  <div key={b.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{b.facilityName}</p>
                      <p className="text-xs text-muted-foreground">{b.bookingNumber} · {b.date}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadge(b.status)}`}>{b.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
