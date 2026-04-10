import { useState, useRef, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useGetTicket, getGetTicketQueryKey } from "@workspace/api-client-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { formatDateTime, getStatusBadgeClass, getStatusLabel } from "@/lib/format";
import { ChevronLeft, User, Shield, MessageSquare, Paperclip, Send } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: "resident" | "staff";
  content: string;
  createdAt: string;
}

const categoryLabels: Record<string, string> = {
  electricals: "Electricals", plumbing: "Plumbing", housekeeping: "Housekeeping",
  general_enquiry: "General Enquiry", air_conditioning: "Air Conditioning",
  pest_control: "Pest Control", civil_works: "Civil Works", other: "Other",
};

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  const { data: ticket, isLoading } = useGetTicket(id, {
    query: { queryKey: getGetTicketQueryKey(id) }
  });

  const qc = useQueryClient();
  const token = localStorage.getItem("token") ?? "";
  const API_BASE = import.meta.env.VITE_API_URL ?? "/api";
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [] } = useQuery<TicketMessage[]>({
    queryKey: ["ticket-messages", id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/tickets/${id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 4000,
    enabled: !!id && !!token,
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`${API_BASE}/tickets/${id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ticket-messages", id] });
      setChatInput("");
    },
  });

  // Auto-scroll to bottom when messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-5 space-y-5 pt-14">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-48 w-full rounded-[1.5rem]" />
        </div>
      </AppLayout>
    );
  }

  if (!ticket) {
    return <AppLayout><div className="p-5 pt-20 text-center text-muted-foreground font-bold">Ticket not found</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="page-enter bg-slate-50 min-h-[100dvh]">
        <div className="bg-gradient-teal px-5 pt-14 pb-8 rounded-b-[2rem] shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full" />

          <div className="relative z-10 flex items-start gap-4 mb-4">
            <button onClick={() => setLocation("/star-assist")} className="p-2.5 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors mt-1 flex-shrink-0" data-testid="button-back">
              <ChevronLeft className="w-5 h-5 text-primary-foreground" />
            </button>
            <div>
              <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-widest mb-1">{ticket.ticketNumber}</p>
              <h1 className="text-xl font-extrabold text-primary-foreground leading-tight">{ticket.title}</h1>
            </div>
          </div>
          <div className="relative z-10 ml-14">
            <span className={`inline-flex px-3 py-1.5 rounded-md text-[11px] font-black uppercase tracking-wider shadow-sm ${getStatusBadgeClass(ticket.status)}`} data-testid="text-ticket-status">
              {getStatusLabel(ticket.status)}
            </span>
          </div>
        </div>

        <div className="px-5 py-6 space-y-6 pb-10 -mt-4 relative z-20">
          <div className="bg-card border border-card-border rounded-[1.5rem] p-6 shadow-md shadow-primary/5 space-y-5">
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Category</p>
                <p className="font-bold text-foreground">{categoryLabels[ticket.category] ?? ticket.category}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Service Type</p>
                <p className="font-bold text-foreground">{ticket.serviceType}</p>
              </div>
              {ticket.unitNumber && (
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Unit</p>
                  <p className="font-bold text-foreground">{ticket.unitNumber}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Submitted</p>
                <p className="font-bold text-foreground">{formatDateTime(ticket.createdAt)}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-border/50">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Description</p>
              <p className="text-sm font-medium text-foreground leading-relaxed">{ticket.description}</p>
            </div>
          </div>

          {ticket.attachmentUrl && (
            <div className="bg-card border border-card-border rounded-[1.5rem] p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-primary" />
                <h3 className="font-extrabold text-sm tracking-tight text-foreground">Attachment</h3>
              </div>
              <div className="rounded-2xl overflow-hidden border border-border">
                <img
                  src={ticket.attachmentUrl}
                  alt="Ticket attachment"
                  className="w-full max-h-64 object-cover"
                  data-testid="ticket-attachment-image"
                />
              </div>
            </div>
          )}

          {/* Conversation history */}
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-4 px-1">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h3 className="font-extrabold text-base tracking-tight">Updates</h3>
            </div>

            <div className="space-y-5 bg-card p-5 rounded-[1.5rem] border border-card-border shadow-sm">
              {ticket.updates.length === 0 ? (
                <p className="text-sm font-medium text-muted-foreground text-center py-4">No updates yet.</p>
              ) : (
                ticket.updates.map((update: { id: string; message: string; author: string; authorType: string; createdAt: string }) => (
                  <div
                    key={update.id}
                    className={`flex gap-3 ${update.authorType === "resident" ? "flex-row-reverse" : ""}`}
                    data-testid={`ticket-update-${update.id}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                      update.authorType === "staff" ? "bg-primary/10 border border-primary/20" : "bg-accent/10 border border-accent/20"
                    }`}>
                      {update.authorType === "staff" ? (
                        <Shield className="w-5 h-5 text-primary" />
                      ) : (
                        <User className="w-5 h-5 text-accent-foreground" />
                      )}
                    </div>
                    <div className={`max-w-[75%] ${update.authorType === "resident" ? "items-end" : "items-start"} flex flex-col`}>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 mx-1">
                        {update.authorType === "staff" ? "Support Team" : "You"}
                      </p>
                      <div className={`px-4 py-3 text-sm font-medium leading-relaxed shadow-sm ${
                        update.authorType === "staff"
                          ? "bg-muted/50 border border-border text-foreground rounded-2xl rounded-tl-sm"
                          : "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                      }`}>
                        {update.message}
                      </div>
                      <p className="text-[10px] font-bold text-muted-foreground mt-1.5 mx-1 opacity-70">
                        {formatDateTime(update.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat with Support */}
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-4 px-1">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h3 className="font-extrabold text-base tracking-tight">Chat with Support</h3>
            </div>

            {/* Message thread */}
            <div className="bg-card border border-card-border rounded-[1.5rem] shadow-sm overflow-hidden">
              <div className="p-5 space-y-4 min-h-[120px] max-h-[400px] overflow-y-auto">
                {messages.length === 0 ? (
                  <p className="text-sm font-medium text-muted-foreground text-center py-6">
                    No messages yet. Send a message to the support team.
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.senderType === "resident" ? "flex-row-reverse" : ""}`}
                      data-testid={`chat-message-${msg.id}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.senderType === "staff" ? "bg-primary/10 border border-primary/20" : "bg-accent/10 border border-accent/20"
                      }`}>
                        {msg.senderType === "staff" ? (
                          <Shield className="w-4 h-4 text-primary" />
                        ) : (
                          <User className="w-4 h-4 text-accent-foreground" />
                        )}
                      </div>
                      <div className={`max-w-[75%] flex flex-col ${msg.senderType === "resident" ? "items-end" : "items-start"}`}>
                        <div className={`px-4 py-2.5 text-sm font-medium leading-relaxed shadow-sm ${
                          msg.senderType === "staff"
                            ? "bg-muted/50 border border-border text-foreground rounded-2xl rounded-tl-sm"
                            : "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                        }`}>
                          {msg.content}
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground mt-1 opacity-70">
                          {formatDateTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-border p-4 flex gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && chatInput.trim()) {
                      e.preventDefault();
                      sendMessage.mutate(chatInput.trim());
                    }
                  }}
                  placeholder="Message support team..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring font-medium"
                  data-testid="input-chat-message"
                />
                <button
                  onClick={() => chatInput.trim() && sendMessage.mutate(chatInput.trim())}
                  disabled={sendMessage.isPending || !chatInput.trim()}
                  className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 transition-colors flex-shrink-0"
                  data-testid="button-send-chat"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
