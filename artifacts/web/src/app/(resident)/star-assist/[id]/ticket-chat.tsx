"use client";

import { useRef, useEffect, useState } from "react";
import { useTicketChat, type ConnectionStatus } from "@/hooks/use-ticket-chat";
import type { TicketMessage } from "@workspace/db/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function StatusDot({ status }: { status: ConnectionStatus }) {
  const colors: Record<ConnectionStatus, string> = {
    connected: "bg-green-500",
    polling: "bg-yellow-500",
    disconnected: "bg-red-500",
  };
  const labels: Record<ConnectionStatus, string> = {
    connected: "Live",
    polling: "Polling",
    disconnected: "Offline",
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-block h-2 w-2 rounded-full ${colors[status]}`} />
      <span className="text-xs text-muted-foreground">{labels[status]}</span>
    </div>
  );
}

function formatTime(date: string | Date) {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TicketChat({
  ticketId,
  initialMessages,
}: {
  ticketId: string;
  initialMessages: TicketMessage[];
}) {
  const { messages, sendMessage, connectionStatus } = useTicketChat(ticketId, initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content || sending) return;

    setSending(true);
    setInput("");
    try {
      await sendMessage(content);
    } catch {
      // Restore input on failure
      setInput(content);
    } finally {
      setSending(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Messages</CardTitle>
        <StatusDot status={connectionStatus} />
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Message list */}
        <div ref={scrollRef} className="max-h-80 overflow-y-auto space-y-3 p-1">
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No messages yet. Start the conversation below.
            </p>
          )}
          {messages.map((msg) => {
            const isOwn = msg.senderType === "resident";
            return (
              <div key={msg.id} className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge
                    variant={isOwn ? "outline" : "secondary"}
                    className="text-[10px] px-1.5 py-0"
                  >
                    {isOwn ? "You" : "Staff"}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={sending}
          />
          <Button type="submit" size="sm" disabled={sending || !input.trim()}>
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
