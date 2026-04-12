import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, formatDate, formatMMK } from "@/lib/api";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Plus, Pencil, Trash2, XCircle } from "lucide-react";

interface Facility {
  id: string; name: string; description: string; category: string;
  memberRate: string; nonMemberRate: string; openingTime: string;
  closingTime: string; maxCapacity: number; isAvailable: boolean; imageUrl: string | null;
}

interface Booking {
  id: string; bookingNumber: string; userId: string; facilityId: string;
  facilityName: string; facilityCategory: string; date: string;
  startTime: string; endTime: string; totalAmount: string; status: string; createdAt: string;
  user: { name: string; email: string };
}

const CATEGORIES = [
  "swimming_pool", "tennis_court", "basketball_court", "gym",
  "badminton_court", "function_room", "squash_court"
];

function FacilityModal({ item, onClose, onSave }: { item: Partial<Facility> | null; onClose: () => void; onSave: (d: any) => void }) {
  const [form, setForm] = useState({
    name: item?.name ?? "", description: item?.description ?? "",
    category: item?.category ?? "gym",
    memberRate: item?.memberRate ?? "", nonMemberRate: item?.nonMemberRate ?? "",
    openingTime: item?.openingTime ?? "06:00", closingTime: item?.closingTime ?? "22:00",
    maxCapacity: item?.maxCapacity ?? 20, isAvailable: item?.isAvailable ?? true,
  });
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">{item?.id ? "Edit" : "New"} Facility</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Name</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full mt-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Category</label>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              className="w-full mt-1 px-3 py-2 border border-border rounded-lg text-sm bg-background">
              {CATEGORIES.map(c => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2}
              className="w-full mt-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Member Rate (MMK)</label>
              <input type="number" value={form.memberRate} onChange={e => setForm(p => ({ ...p, memberRate: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Non-member Rate (MMK)</label>
              <input type="number" value={form.nonMemberRate} onChange={e => setForm(p => ({ ...p, nonMemberRate: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Opening Time</label>
              <input type="time" value={form.openingTime} onChange={e => setForm(p => ({ ...p, openingTime: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Closing Time</label>
              <input type="time" value={form.closingTime} onChange={e => setForm(p => ({ ...p, closingTime: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Max Capacity</label>
            <input type="number" value={form.maxCapacity} onChange={e => setForm(p => ({ ...p, maxCapacity: parseInt(e.target.value) }))}
              className="w-full mt-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.isAvailable} onChange={e => setForm(p => ({ ...p, isAvailable: e.target.checked }))} className="accent-primary" />
            Available for booking
          </label>
          <div className="flex gap-3 pt-2">
            <button onClick={() => onSave(form)} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">Save</button>
            <button onClick={onClose} className="flex-1 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-medium">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FacilitiesPage() {
  const [tab, setTab] = useState<"facilities" | "bookings">("facilities");
  const [facilityModal, setFacilityModal] = useState<Partial<Facility> | null | false>(false);
  const [bookingStatusFilter, setBookingStatusFilter] = useState("");
  const qc = useQueryClient();

  const { data: facilities = [], isLoading: fLoading } = useQuery({
    queryKey: ["admin-facilities"],
    queryFn: () => apiRequest<Facility[]>("GET", "/admin/facilities"),
  });

  const { data: bookings = [], isLoading: bLoading } = useQuery({
    queryKey: ["admin-bookings", bookingStatusFilter],
    queryFn: () => apiRequest<Booking[]>("GET", `/admin/bookings?status=${bookingStatusFilter}`),
  });

  const saveFacility = useMutation({
    mutationFn: (data: any) => facilityModal && (facilityModal as any).id
      ? apiRequest("PATCH", `/admin/facilities/${(facilityModal as any).id}`, data)
      : apiRequest("POST", "/admin/facilities", data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-facilities"] }); setFacilityModal(false); },
  });

  const deleteFacility = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/admin/facilities/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-facilities"] }),
  });

  const cancelBooking = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/admin/bookings/${id}/cancel`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-bookings"] }),
  });

  const statusBadge = (s: string) => ({
    upcoming: "bg-blue-100 text-blue-700", completed: "bg-green-100 text-green-700", cancelled: "bg-gray-100 text-gray-600",
  }[s] ?? "bg-gray-100 text-gray-600");

  return (
    <AdminLayout>
      {facilityModal !== false && (
        <FacilityModal item={facilityModal} onClose={() => setFacilityModal(false)} onSave={d => saveFacility.mutate(d)} />
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">SCSC Management</h1>
          <p className="text-sm text-muted-foreground">Facilities and bookings</p>
        </div>
        {tab === "facilities" && (
          <button onClick={() => setFacilityModal({})}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">
            <Plus className="w-4 h-4" /> New Facility
          </button>
        )}
      </div>

      <div className="flex gap-1 mb-4 bg-muted/40 p-1 rounded-lg w-fit">
        {(["facilities", "bookings"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${tab === t ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "facilities" && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {fLoading ? <div className="flex justify-center py-12 text-sm text-muted-foreground">Loading...</div> : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Category</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Member Rate</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Non-member Rate</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Hours</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody>
                {facilities.map(f => (
                  <tr key={f.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 px-4 font-medium text-foreground">{f.name}</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded text-xs bg-muted capitalize">{f.category.replace("_", " ")}</span></td>
                    <td className="py-3 px-4 text-muted-foreground">{formatMMK(f.memberRate)}</td>
                    <td className="py-3 px-4 text-muted-foreground">{formatMMK(f.nonMemberRate)}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{f.openingTime} — {f.closingTime}</td>
                    <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded text-xs font-medium ${f.isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{f.isAvailable ? "Available" : "Closed"}</span></td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => setFacilityModal(f)} className="p-1.5 hover:bg-muted rounded"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                        <button onClick={() => { if (confirm("Delete facility?")) deleteFacility.mutate(f.id); }} className="p-1.5 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "bookings" && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-3 border-b border-border">
            <select value={bookingStatusFilter} onChange={e => setBookingStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-border rounded-lg text-sm bg-background">
              <option value="">All statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          {bLoading ? <div className="flex justify-center py-12 text-sm text-muted-foreground">Loading...</div> : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Booking</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">User</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Facility</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Date & Time</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{b.bookingNumber}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-foreground">{b.user.name}</p>
                      <p className="text-xs text-muted-foreground">{b.user.email}</p>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{b.facilityName}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{b.date} · {b.startTime}–{b.endTime}</td>
                    <td className="py-3 px-4 text-foreground font-medium">{formatMMK(b.totalAmount)}</td>
                    <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadge(b.status)}`}>{b.status}</span></td>
                    <td className="py-3 px-4">
                      {b.status === "upcoming" && (
                        <button onClick={() => { if (confirm("Cancel booking?")) cancelBooking.mutate(b.id); }}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors">
                          <XCircle className="w-3.5 h-3.5" /> Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
