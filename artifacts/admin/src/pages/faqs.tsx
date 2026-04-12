import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface Faq {
  id: string; question: string; answer: string; category: string;
  isPublished: boolean; sortOrder: number; createdAt: string;
}

function FaqModal({ item, onClose, onSave }: { item: Partial<Faq> | null; onClose: () => void; onSave: (d: any) => void }) {
  const [form, setForm] = useState({
    question: item?.question ?? "", answer: item?.answer ?? "",
    category: item?.category ?? "General", isPublished: item?.isPublished ?? true,
    sortOrder: item?.sortOrder ?? 0,
  });
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg p-6">
        <h2 className="text-lg font-semibold mb-4">{item?.id ? "Edit" : "New"} FAQ</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Question</label>
            <input value={form.question} onChange={e => setForm(p => ({ ...p, question: e.target.value }))}
              className="w-full mt-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Answer</label>
            <textarea value={form.answer} onChange={e => setForm(p => ({ ...p, answer: e.target.value }))} rows={4}
              className="w-full mt-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Sort Order</label>
              <input type="number" value={form.sortOrder} onChange={e => setForm(p => ({ ...p, sortOrder: parseInt(e.target.value) }))}
                className="w-full mt-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.isPublished} onChange={e => setForm(p => ({ ...p, isPublished: e.target.checked }))} className="accent-primary" />
            Published
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

export default function FaqsPage() {
  const [modal, setModal] = useState<Partial<Faq> | null | false>(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-faqs"],
    queryFn: () => apiRequest<Faq[]>("GET", "/admin/faqs"),
  });

  const save = useMutation({
    mutationFn: (data: any) => modal && (modal as any).id
      ? apiRequest("PATCH", `/admin/faqs/${(modal as any).id}`, data)
      : apiRequest("POST", "/admin/faqs", data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-faqs"] }); setModal(false); },
  });

  const del = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/admin/faqs/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-faqs"] }),
  });

  const grouped = data.reduce((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, Faq[]>);

  return (
    <AdminLayout>
      {modal !== false && <FaqModal item={modal} onClose={() => setModal(false)} onSave={d => save.mutate(d)} />}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">FAQ Management</h1>
          <p className="text-sm text-muted-foreground">{data.length} FAQ entries</p>
        </div>
        <button onClick={() => setModal({})}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">
          <Plus className="w-4 h-4" /> New FAQ
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12 text-sm text-muted-foreground">Loading...</div>
      ) : data.length === 0 ? (
        <div className="bg-card rounded-xl border border-border flex flex-col items-center justify-center py-16 text-muted-foreground">
          <p className="text-sm">No FAQs yet. Create your first one.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([category, faqs]) => (
            <div key={category} className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/30">
                <p className="text-sm font-semibold text-foreground">{category}</p>
              </div>
              <div className="divide-y divide-border/50">
                {faqs.map(faq => (
                  <div key={faq.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <button
                        onClick={() => setExpanded(expanded === faq.id ? null : faq.id)}
                        className="flex-1 text-left"
                      >
                        <div className="flex items-center gap-2">
                          {expanded === faq.id ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                          <p className="text-sm font-medium text-foreground">{faq.question}</p>
                          {!faq.isPublished && <span className="px-1.5 py-0.5 rounded text-xs bg-amber-100 text-amber-700">Draft</span>}
                        </div>
                      </button>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => setModal(faq)} className="p-1.5 hover:bg-muted rounded"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                        <button onClick={() => { if (confirm("Delete?")) del.mutate(faq.id); }} className="p-1.5 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                      </div>
                    </div>
                    {expanded === faq.id && (
                      <p className="mt-2 ml-5 text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
