"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { TicketMessage } from "@workspace/db/schema";

export type ConnectionStatus = "connected" | "polling" | "disconnected";

interface UseTicketChatReturn {
  messages: TicketMessage[];
  sendMessage: (content: string) => Promise<void>;
  connectionStatus: ConnectionStatus;
}

const MAX_RECONNECT_RETRIES = 5;
const RECONNECT_DELAY = 3000;
const POLL_INTERVAL = 5000;

export function useTicketChat(
  ticketId: string,
  initialMessages: TicketMessage[],
): UseTicketChatReturn {
  const [messages, setMessages] = useState<TicketMessage[]>(initialMessages);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");

  const wsRef = useRef<WebSocket | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const retriesRef = useRef(0);
  const mountedRef = useRef(true);
  const messageIdsRef = useRef<Set<string>>(
    new Set(initialMessages.map((m) => m.id)),
  );

  // Keep messageIds in sync
  useEffect(() => {
    messageIdsRef.current = new Set(messages.map((m) => m.id));
  }, [messages]);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const pollMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`);
      if (!res.ok) return;
      const data: TicketMessage[] = await res.json();

      // Check for new messages
      const newMessages = data.filter(
        (m) => !messageIdsRef.current.has(m.id),
      );
      if (newMessages.length > 0) {
        setMessages(data);
      }
    } catch {
      // Polling failure — will retry on next interval
    }
  }, [ticketId]);

  const startPolling = useCallback(() => {
    stopPolling();
    setConnectionStatus("polling");
    pollIntervalRef.current = setInterval(pollMessages, POLL_INTERVAL);
  }, [stopPolling, pollMessages]);

  const connectWs = useCallback(() => {
    if (!mountedRef.current) return;

    const wsUrl =
      typeof window !== "undefined" &&
      (process.env.NEXT_PUBLIC_WS_URL || `ws://${window.location.hostname}:3002`);

    if (!wsUrl) return;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) {
          ws.close();
          return;
        }
        retriesRef.current = 0;
        setConnectionStatus("connected");
        stopPolling();
        ws.send(JSON.stringify({ type: "join", ticketId }));
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === "message" && parsed.data) {
            const msg = parsed.data as TicketMessage;
            setMessages((prev) => {
              if (prev.some((m) => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
          }
        } catch {
          // Ignore malformed WS messages
        }
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;

        wsRef.current = null;

        if (retriesRef.current < MAX_RECONNECT_RETRIES) {
          retriesRef.current += 1;
          setConnectionStatus("disconnected");
          setTimeout(connectWs, RECONNECT_DELAY);
        } else {
          // Max retries reached — fall back to polling
          startPolling();
        }
      };

      ws.onerror = () => {
        // onclose will fire after onerror, so reconnection is handled there
        ws.close();
      };
    } catch {
      // WebSocket constructor can throw if URL is invalid
      startPolling();
    }
  }, [ticketId, stopPolling, startPolling]);

  useEffect(() => {
    mountedRef.current = true;
    connectWs();

    return () => {
      mountedRef.current = false;
      stopPolling();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connectWs, stopPolling]);

  const sendMessage = useCallback(
    async (content: string) => {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      const msg: TicketMessage = await res.json();
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    },
    [ticketId],
  );

  return { messages, sendMessage, connectionStatus };
}
