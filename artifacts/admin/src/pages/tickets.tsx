import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, formatDate } from "@/lib/api";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Search, ChevronDown, Send } from "lucide-react";
import { useTicketChat } from "@/hooks/use-ticket-chat";

interface Ticket {
  id: string; ticketNumber: string; userId: string; title: string;
  category: string; serviceType: string; status: string;
  unitNumber: string | null; description: string; assignedTo: string | null;
  updates: Array<{ id: string; message: string; author: string; authorType: string; createdAt: string }>;
  createdAt: string; updatedAt: string;
  user: { name: string; email: string };
}

const statusColors: Record<string, string> = {
  open: "bg-red-100 text-red-700", in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700", closed: "bg-gray-100 text-gray-600",
};
const categoryColors: Record<string, string> = {
  electricals: "bg-yellow-100 text-yellow-700", plumbing: "bg-blue-100 text-blue-700",
  housekeeping: "bg-purple-100 text-purple-700", general_enquiry: "bg-gray-100 text-gray-600",
  air_conditioning: "bg-cyan-100 text-cyan-700", pest_control: "bg-orange-100 text-orange-700",
};

export default function TicketsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [staffResponse, setStaffResponse] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const qc = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const adminToken = localStorage.getItem("adminToken") ?? "";
  const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-tickets", search, statusFilter],
    queryFn: () => apiRequest<Ticket[]>("GET", `/admin/tickets?search=${encodeURIComponent(search)}&status=${statusFilter}`),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; status?: string; assignedTo?: string; staffResponse?: string }) =>
      apiRequest("PATCH", `/admin/tickets/${payload.id}`, {
        status: payload.status || undefined,
        assignedTo: payload.assignedTo ?? undefined,
        staffResponse: payload.staffResponse || undefined,
      }),
    onSuccess: (updated: any) => {
      qc.invalidateQueries({ queryKey: ["admin-tickets"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
      setSelected(updated);
      setStaffResponse("");
      setNewStatus("");
    },
  });

  const { messages: chatMessages, isConnected: chatConnected, sendMessage: sendChat } = useTicketChat(
    selected?.id, adminToken, "staff", API_BASE
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages.length]);

  async function handleSendChat() {
    const content = chatInput.trim();
    if (!content || isSending) return;
    setIsSending(true);
    try {
      await sendChat(content);
      setChatInput("");
    } finally {
      setIsSending(false);
    }
  }

  function openTicket(t: Ticket) {
    setSelected(t);
    setNewStatus(t.status);
    setAssignedTo(t.assignedTo ?? "");
    setStaffResponse("");
    setChatInput("");
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Ticket Management</h1>
        <p className="text-sm text-muted-foreground">{data.length} tickets</p>
      </div>

      <div className="flex gap-4 h-[calc(100vh-12rem)]">
        <div className={`bg-card rounded-xl border border-border flex flex-col ${selected ? "w-96 flex-shrink-0" : "flex-1"}`}>
          <div className="p-3 border-b border-border space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="search" placeholder="Search tickets..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <select
              value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-2 py-1.5 border border-border rounded-lg text-xs bg-background"
            >
              <option value="">All statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">Loading...</div>
            ) : data.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">No tickets</div>
            ) : data.map(ticket => (
              <div
                key={ticket.id}
                onClick={() => openTicket(ticket)}
                className={`p-3 border-b border-border/50 cursor-pointer hover:bg-muted/30 transition-colors ${selected?.id === ticket.id ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-medium text-foreground truncate">{ticket.title}</p>
                  <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-xs font-medium ${statusColors[ticket.status]}`}>
                    {ticket.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{ticket.ticketNumber} · {ticket.user.name}</p>
                <p className="text-xs text-muted-foreground">{ticket.unitNumber ?? "No unit"} · {formatDate(ticket.createdAt)}</p>
                <span className={`mt-1 inline-block px-1.5 py-0.5 rounded text-xs font-medium ${categoryColors[ticket.category] ?? "bg-gray-100 text-gray-600"}`}>
                  {ticket.category.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {selected && (
          <div className="flex-1 bg-card rounded-xl border border-border flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-foreground">{selected.title}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{selected.ticketNumber} · {selected.user.name} · {selected.unitNumber ?? "No unit"}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground text-xs">Close</button>
              </div>
            </div>

            <div className="p-4 border-b border-border">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Description</p>
              <p className="text-sm text-foreground">{selected.description}</p>
            </div>

            <div className="p-4 border-b border-border flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground font-medium">Status</label>
                <select
                  value={newStatus} onChange={e => setNewStatus(e.target.value)}
                  className="w-full mt-1 px-2 py-1.5 border border-border rounded text-xs bg-background"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground font-medium">Assigned To</label>
                <input
                  value={assignedTo} onChange={e => setAssignedTo(e.target.value)}
                  placeholder="Staff name..."
                  className="w-full mt-1 px-2 py-1.5 border border-border rounded text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            <div className="p-3 border-b border-border">
              <button
                onClick={() => updateMutation.mutate({ id: selected.id, status: newStatus, assignedTo })}
                disabled={updateMutation.isPending}
                className="w-full py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
              >
                {updateMutation.isPending ? "Saving..." : "Save"}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <p className="text-xs font-medium text-muted-foreground">Updates ({selected.updates.length})</p>
              {selected.updates.map(u => (
                <div key={u.id} className={`p-3 rounded-lg ${u.authorType === "staff" ? "bg-primary/5 border border-primary/10" : "bg-muted/40"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-foreground">{u.author}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(u.createdAt)}</p>
                  </div>
                  <p className="text-sm text-foreground">{u.message}</p>
                </div>
              ))}
            </div>

            {/* Chat section */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0" style={{ maxHeight: "200px" }}>
              <div className="flex items-center gap-2 mb-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Chat ({chatMessages.length})
                </p>
                <span
                  className={`w-2 h-2 rounded-full inline-block ${chatConnected ? "bg-green-500" : "bg-red-400"}`}
                  title={chatConnected ? "Live (WebSocket)" : "Polling fallback"}
                />
              </div>
              {chatMessages.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No chat messages yet.</p>
              ) : (
                <div className="space-y-3">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg text-sm ${
                        msg.senderType === "staff"
                          ? "bg-primary/5 border border-primary/10 ml-0 mr-8"
                          : "bg-muted/40 ml-8 mr-0"
                      }`}
                      data-testid={`admin-chat-message-${msg.id}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-foreground">
                          {msg.senderType === "staff" ? "You (Staff)" : "Resident"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(msg.createdAt)}
                        </p>
                      </div>
                      <p className="text-sm text-foreground">{msg.content}</p>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Chat input */}
            <div className="p-4 border-t border-border flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && chatInput.trim()) {
                    e.preventDefault();
                    handleSendChat();
                  }
                }}
                placeholder="Reply to resident..."
                className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                data-testid="admin-input-chat"
              />
              <button
                onClick={handleSendChat}
                disabled={isSending || !chatInput.trim()}
                className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                data-testid="admin-button-send-chat"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
