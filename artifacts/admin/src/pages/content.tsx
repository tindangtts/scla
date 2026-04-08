import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, formatDate } from "@/lib/api";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Plus, Pencil, Trash2, Pin, Globe } from "lucide-react";

interface Announcement {
  id: string; title: string; content: string; summary: string;
  type: string; imageUrl: string | null; publishedAt: string;
  isPinned: boolean; isDraft: boolean; targetAudience: string; tags: string[];
}

interface Promotion {
  id: string; title: string; description: string; category: string;
  partnerName: string; imageUrl: string | null; isActive: boolean;
  validFrom: string; validUntil: string | null; createdAt: string;
}

type ContentTab = "announcements" | "promotions";

function AnnouncementModal({ item, onClose, onSave }: { item: Partial<Announcement> | null; onClose: () => void; onSave: (data: any) => void }) {
  const [form, setForm] = useState({
    title: item?.title ?? "", content: item?.content ?? "", summary: item?.summary ?? "",
    type: item?.type ?? "announcement", imageUrl: item?.imageUrl ?? "",
    isPinned: item?.isPinned ?? false, isDraft: item?.isDraft ?? false,
    targetAudience: item?.targetAudience ?? "all",
  });
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-lg font-semibold mb-4">{item?.id ? "Edit" : "New"} Announcement</h2>
        <div className="space-y-3">
          {[
            { label: "Title", key: "title", type: "text" },
            { label: "Summary", key: "summary", type: "text" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
              <input value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Content</label>
            <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={5}
              className="w-full mt-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-border rounded-lg text-sm bg-background">
                <option value="announcement">Announcement</option>
                <option value="newsletter">Newsletter</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Audience</label>
              <select value={form.targetAudience} onChange={e => setForm(p => ({ ...p, targetAudience: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-border rounded-lg text-sm bg-background">
                <option value="all">All Users</option>
                <option value="residents_only">Residents Only</option>
                <option value="guests_only">Guests Only</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isPinned} onChange={e => setForm(p => ({ ...p, isPinned: e.target.checked }))} className="accent-primary" />
              Pinned
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isDraft} onChange={e => setForm(p => ({ ...p, isDraft: e.target.checked }))} className="accent-primary" />
              Draft
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => onSave(form)} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">Save</button>
            <button onClick={onClose} className="flex-1 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/80">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PromotionModal({ item, onClose, onSave }: { item: Partial<Promotion> | null; onClose: () => void; onSave: (data: any) => void }) {
  const [form, setForm] = useState({
    title: item?.title ?? "", description: item?.description ?? "",
    category: item?.category ?? "", partnerName: item?.partnerName ?? "",
    imageUrl: item?.imageUrl ?? "", isActive: item?.isActive ?? true,
  });
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg p-6">
        <h2 className="text-lg font-semibold mb-4">{item?.id ? "Edit" : "New"} Promotion</h2>
        <div className="space-y-3">
          {[
            { label: "Title", key: "title" }, { label: "Category", key: "category" }, { label: "Partner Name", key: "partnerName" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
              <input value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
              className="w-full mt-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} className="accent-primary" />
            Active
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

export default function ContentPage() {
  const [tab, setTab] = useState<ContentTab>("announcements");
  const [announcementModal, setAnnouncementModal] = useState<Partial<Announcement> | null | false>(false);
  const [promotionModal, setPromotionModal] = useState<Partial<Promotion> | null | false>(false);
  const qc = useQueryClient();

  const { data: announcements = [], isLoading: aLoading } = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: () => apiRequest<Announcement[]>("GET", "/admin/content/announcements"),
  });

  const { data: promotions = [], isLoading: pLoading } = useQuery({
    queryKey: ["admin-promotions"],
    queryFn: () => apiRequest<Promotion[]>("GET", "/admin/content/promotions"),
  });

  const saveAnnouncement = useMutation({
    mutationFn: (data: any) => announcementModal && (announcementModal as any).id
      ? apiRequest("PATCH", `/admin/content/announcements/${(announcementModal as any).id}`, data)
      : apiRequest("POST", "/admin/content/announcements", data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-announcements"] }); setAnnouncementModal(false); },
  });

  const deleteAnnouncement = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/admin/content/announcements/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-announcements"] }),
  });

  const savePromotion = useMutation({
    mutationFn: (data: any) => promotionModal && (promotionModal as any).id
      ? apiRequest("PATCH", `/admin/content/promotions/${(promotionModal as any).id}`, data)
      : apiRequest("POST", "/admin/content/promotions", data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-promotions"] }); setPromotionModal(false); },
  });

  const deletePromotion = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/admin/content/promotions/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-promotions"] }),
  });

  return (
    <AdminLayout>
      {announcementModal !== false && (
        <AnnouncementModal item={announcementModal} onClose={() => setAnnouncementModal(false)} onSave={d => saveAnnouncement.mutate(d)} />
      )}
      {promotionModal !== false && (
        <PromotionModal item={promotionModal} onClose={() => setPromotionModal(false)} onSave={d => savePromotion.mutate(d)} />
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Content Management</h1>
          <p className="text-sm text-muted-foreground">Announcements and promotions</p>
        </div>
        <button
          onClick={() => tab === "announcements" ? setAnnouncementModal({}) : setPromotionModal({})}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" /> New {tab === "announcements" ? "Announcement" : "Promotion"}
        </button>
      </div>

      <div className="flex gap-1 mb-4 bg-muted/40 p-1 rounded-lg w-fit">
        {(["announcements", "promotions"] as ContentTab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${tab === t ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "announcements" && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {aLoading ? <div className="flex justify-center py-12 text-sm text-muted-foreground">Loading...</div> : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Title</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Audience</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Published</th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody>
                {announcements.map(a => (
                  <tr key={a.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {a.isPinned && <Pin className="w-3 h-3 text-accent flex-shrink-0" />}
                        <span className="font-medium text-foreground truncate max-w-[220px]">{a.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded text-xs bg-muted capitalize">{a.type}</span></td>
                    <td className="py-3 px-4 text-xs text-muted-foreground capitalize">{a.targetAudience.replace("_", " ")}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${a.isDraft ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                        {a.isDraft ? "Draft" : "Published"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{formatDate(a.publishedAt)}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => setAnnouncementModal(a)} className="p-1.5 hover:bg-muted rounded transition-colors"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                        <button onClick={() => { if (confirm("Delete?")) deleteAnnouncement.mutate(a.id); }} className="p-1.5 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "promotions" && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {pLoading ? <div className="flex justify-center py-12 text-sm text-muted-foreground">Loading...</div> : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Title</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Partner</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Category</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Valid Until</th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody>
                {promotions.map(p => (
                  <tr key={p.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 px-4 font-medium text-foreground">{p.title}</td>
                    <td className="py-3 px-4 text-muted-foreground">{p.partnerName}</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded text-xs bg-muted">{p.category}</span></td>
                    <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded text-xs font-medium ${p.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{p.isActive ? "Active" : "Inactive"}</span></td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{p.validUntil ? formatDate(p.validUntil) : "No expiry"}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => setPromotionModal(p)} className="p-1.5 hover:bg-muted rounded"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                        <button onClick={() => { if (confirm("Delete?")) deletePromotion.mutate(p.id); }} className="p-1.5 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                      </div>
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
