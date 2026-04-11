import { WebSocketServer, WebSocket } from "ws";
import type { TicketMessage } from "@workspace/db/schema";

const rooms = new Map<string, Set<WebSocket>>();

let wss: WebSocketServer | null = null;

/**
 * Broadcast a message to all WebSocket clients subscribed to a ticket room.
 */
export function broadcastToTicket(
  ticketId: string,
  message: TicketMessage,
): void {
  const clients = rooms.get(ticketId);
  if (!clients) return;

  const payload = JSON.stringify({ type: "message", data: message });
  for (const ws of clients) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
}

/**
 * Start a standalone WebSocket server for real-time ticket chat.
 * Listens on WS_PORT (default 3002).
 */
export function startWsServer(port?: number): WebSocketServer {
  const wsPort = port ?? (Number(process.env.WS_PORT) || 3002);

  wss = new WebSocketServer({ port: wsPort });

  wss.on("connection", (ws: WebSocket) => {
    let subscribedTicketId: string | null = null;

    ws.on("message", (raw: Buffer | string) => {
      try {
        const data = JSON.parse(raw.toString());

        if (data.type === "join" && typeof data.ticketId === "string") {
          // Leave previous room if any
          if (subscribedTicketId) {
            rooms.get(subscribedTicketId)?.delete(ws);
          }

          subscribedTicketId = data.ticketId;

          if (!rooms.has(subscribedTicketId!)) {
            rooms.set(subscribedTicketId!, new Set());
          }
          rooms.get(subscribedTicketId!)!.add(ws);
        }
      } catch {
        // Ignore malformed messages
      }
    });

    ws.on("close", () => {
      if (subscribedTicketId) {
        const room = rooms.get(subscribedTicketId);
        if (room) {
          room.delete(ws);
          if (room.size === 0) {
            rooms.delete(subscribedTicketId);
          }
        }
      }
    });
  });

  console.log(`WebSocket server listening on port ${wsPort}`);
  return wss;
}
