import { useState, useEffect, useRef, useCallback } from "react";

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: "resident" | "staff";
  content: string;
  createdAt: string;
}

const MAX_BACKOFF_MS = 30_000;

function buildWsUrl(apiBase: string, ticketId: string, token: string, role: string): string {
  if (apiBase.startsWith("http://") || apiBase.startsWith("https://")) {
    const wsBase = apiBase.replace(/^http/, "ws").replace(/\/api$/, "");
    return `${wsBase}/ws?token=${encodeURIComponent(token)}&ticketId=${encodeURIComponent(ticketId)}&role=${encodeURIComponent(role)}`;
  }
  // Relative base (e.g. "/api")
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const base = `${protocol}//${window.location.host}${apiBase.replace(/\/api$/, "")}`;
  return `${base}/ws?token=${encodeURIComponent(token)}&ticketId=${encodeURIComponent(ticketId)}&role=${encodeURIComponent(role)}`;
}

export function useTicketChat(
  ticketId: string | undefined,
  token: string,
  role: "resident" | "staff",
  apiBase: string
): { messages: TicketMessage[]; isConnected: boolean; sendMessage: (content: string) => Promise<void> } {
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const backoffRef = useRef<number>(1_000);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  // ─── REST fetch helpers ───────────────────────────────────────────────────

  const fetchMessages = useCallback(async (): Promise<TicketMessage[]> => {
    if (!ticketId || !token) return [];
    const endpoint =
      role === "resident"
        ? `${apiBase}/tickets/${ticketId}/messages`
        : `${apiBase}/admin/tickets/${ticketId}/messages`;
    try {
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  }, [ticketId, token, role, apiBase]);

  // ─── Polling ─────────────────────────────────────────────────────────────

  const startPolling = useCallback(() => {
    if (pollingRef.current) return; // already running
    pollingRef.current = setInterval(async () => {
      const data = await fetchMessages();
      if (mountedRef.current) {
        setMessages(data);
      }
    }, 4_000);
  }, [fetchMessages]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // ─── WebSocket ────────────────────────────────────────────────────────────

  const connectWs = useCallback(() => {
    if (!ticketId || !token || !mountedRef.current) return;

    const url = buildWsUrl(apiBase, ticketId, token, role);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) { ws.close(); return; }
      setIsConnected(true);
      backoffRef.current = 1_000; // reset backoff on successful open
      stopPolling();
    };

    ws.onmessage = (evt) => {
      if (!mountedRef.current) return;
      try {
        const data = JSON.parse(evt.data as string);
        if (data.type === "new_message") {
          const incoming: TicketMessage = data.payload;
          setMessages((prev) => {
            // deduplicate by id
            if (prev.some((m) => m.id === incoming.id)) return prev;
            return [...prev, incoming];
          });
        }
      } catch {
        // ignore malformed frames
      }
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      setIsConnected(false);
      startPolling();
      // Reconnect with exponential backoff
      const delay = backoffRef.current;
      backoffRef.current = Math.min(delay * 2, MAX_BACKOFF_MS);
      reconnectTimerRef.current = setTimeout(() => {
        if (mountedRef.current) connectWs();
      }, delay);
    };

    ws.onerror = () => {
      // onclose will fire after onerror — let it handle reconnection
    };
  }, [ticketId, token, role, apiBase, startPolling, stopPolling]);

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  useEffect(() => {
    mountedRef.current = true;

    if (!ticketId || !token) return;

    // Initial load via REST
    fetchMessages().then((data) => {
      if (mountedRef.current) setMessages(data);
    });

    // Open WS
    connectWs();

    return () => {
      mountedRef.current = false;
      stopPolling();
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect loop on unmount
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [ticketId, token]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── sendMessage ──────────────────────────────────────────────────────────

  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      if (!ticketId) return;
      const endpoint =
        role === "resident"
          ? `${apiBase}/tickets/${ticketId}/messages`
          : `${apiBase}/admin/tickets/${ticketId}/messages`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      // WS broadcast will deliver the message to all clients (including sender)
    },
    [ticketId, token, role, apiBase]
  );

  return { messages, isConnected, sendMessage };
}
