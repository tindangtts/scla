import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, formatDate } from "@/lib/api";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Plus, UserCog } from "lucide-react";

interface StaffUser {
  id: string; name: string; email: string; role: string; isActive: boolean; createdAt: string;
}

const ROLES = ["admin", "content_manager", "ticket_handler", "booking_manager", "user_verifier"];
const roleBadge: Record<string, string> = {
  admin: "bg-primary/10 text-primary", content_manager: "bg-purple-100 text-purple-700",
  ticket_handler: "bg-amber-100 text-amber-700", booking_manager: "bg-blue-100 text-blue-700",
  user_verifier: "bg-green-100 text-green-700",
};

function StaffModal({ item, onClose, onSave }: { item: Partial<StaffUser> | null; onClose: () => void; onSave: (d: any) => void }) {
  const [form, setForm] = useState({
    name: item?.name ?? "", email: item?.email ?? "",
    role: item?.role ?? "ticket_handler", password: "",
  });
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">{item?.id ? "Edit" : "New"} Staff Account</h2>
        <div className="space-y-3">
          {[
            { label: "Full Name", key: "name", type: "text" },
            { label: "Email", key: "email", type: "email" },
            ...(!item?.id ? [{ label: "Password", key: "password", type: "password" }] : []),
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
              <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Role</label>
            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
              className="w-full mt-1 px-3 py-2 border border-border rounded-lg text-sm bg-background">
              {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => onSave(form)} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">Save</button>
            <button onClick={onClose} className="flex-1 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-medium">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StaffPage() {
  const [modal, setModal] = useState<Partial<StaffUser> | null | false>(false);
  const qc = useQueryClient();

  const { data = [], isLoading, error } = useQuery({
    queryKey: ["admin-staff"],
    queryFn: () => apiRequest<StaffUser[]>("GET", "/admin/staff"),
  });

  const save = useMutation({
    mutationFn: (data: any) => modal && (modal as any).id
      ? apiRequest("PATCH", `/admin/staff/${(modal as any).id}`, data)
      : apiRequest("POST", "/admin/staff", data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-staff"] }); setModal(false); },
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiRequest("PATCH", `/admin/staff/${id}`, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-staff"] }),
  });

  if (error) return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <UserCog className="w-8 h-8 mb-2 opacity-40" />
        <p className="text-sm">Admin access required to manage staff accounts.</p>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      {modal !== false && <StaffModal item={modal} onClose={() => setModal(false)} onSave={d => save.mutate(d)} />}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Staff Management</h1>
          <p className="text-sm text-muted-foreground">{data.length} staff accounts</p>
        </div>
        <button onClick={() => setModal({})}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">
          <Plus className="w-4 h-4" /> New Staff
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? <div className="flex justify-center py-12 text-sm text-muted-foreground">Loading...</div> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Name</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Email</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Role</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Created</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              {data.map(s => (
                <tr key={s.id} className="border-b border-border/50 last:border-0">
                  <td className="py-3 px-4 font-medium text-foreground">{s.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{s.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${roleBadge[s.role] ?? "bg-muted text-muted-foreground"}`}>
                      {s.role.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {s.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{formatDate(s.createdAt)}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => setModal(s)} className="px-2 py-1 text-xs border border-border rounded hover:bg-muted transition-colors">Edit</button>
                      <button
                        onClick={() => toggleActive.mutate({ id: s.id, isActive: !s.isActive })}
                        className={`px-2 py-1 text-xs rounded transition-colors ${s.isActive ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}
                      >
                        {s.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
