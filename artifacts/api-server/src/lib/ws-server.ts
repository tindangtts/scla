import * as http from "http";
import * as crypto from "crypto";
import { WebSocketServer, WebSocket } from "ws";
import * as jwt from "./jwt.js";
import type { TicketMessage } from "@workspace/db";

// ─── Admin token verification (mirrors admin.ts) ──────────────────────────────

const ADMIN_SECRET = process.env.SESSION_SECRET ?? "scla-dev-secret-2026";

interface AdminTokenPayload {
  staffId: string;
  role: string;
  exp: number;
}

function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;
    const headerData = JSON.parse(Buffer.from(header, "base64url").toString());
    if (headerData.ctx !== "admin") return null;
    const expectedSig = crypto.createHmac("sha256", ADMIN_SECRET).update(`${header}.${body}`).digest("base64url");
    if (sig !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as AdminTokenPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// ─── Room management ──────────────────────────────────────────────────────────

// Map from ticketId -> Set of active WebSocket connections
const rooms = new Map<string, Set<WebSocket>>();

function joinRoom(ticketId: string, ws: WebSocket): void {
  let room = rooms.get(ticketId);
  if (!room) {
    room = new Set();
    rooms.set(ticketId, room);
  }
  room.add(ws);
}

function leaveRoom(ticketId: string, ws: WebSocket): void {
  const room = rooms.get(ticketId);
  if (!room) return;
  room.delete(ws);
  if (room.size === 0) {
    rooms.delete(ticketId);
  }
}

// ─── Heartbeat ────────────────────────────────────────────────────────────────

const HEARTBEAT_INTERVAL_MS = 30_000;

interface AliveSocket extends WebSocket {
  isAlive?: boolean;
}

function setupHeartbeat(wss: WebSocketServer): void {
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      const socket = ws as AliveSocket;
      if (socket.isAlive === false) {
        socket.terminate();
        return;
      }
      socket.isAlive = false;
      socket.ping();
    });
  }, HEARTBEAT_INTERVAL_MS);

  wss.on("close", () => clearInterval(interval));
}

// ─── Broadcast ────────────────────────────────────────────────────────────────

/**
 * Send a new_message event to all WS clients subscribed to the given ticket room.
 * Called by REST POST handlers after inserting a message into the DB.
 */
export function broadcastToTicket(ticketId: string, message: TicketMessage): void {
  const room = rooms.get(ticketId);
  if (!room || room.size === 0) return;

  const payload = JSON.stringify({ type: "new_message", payload: message });
  for (const client of room) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

// ─── Setup ────────────────────────────────────────────────────────────────────

/**
 * Attach a WebSocket server to the existing HTTP server.
 * WS connections are authenticated via JWT query params before the upgrade completes.
 *
 * Query params:
 *   ?token=<jwt>&ticketId=<id>&role=resident|staff
 */
export function setupWebSocket(server: http.Server): void {
  const wss = new WebSocketServer({ server });

  setupHeartbeat(wss);

  wss.on("connection", (ws: AliveSocket, req) => {
    // Parse query params from the upgrade URL
    const url = new URL(req.url ?? "/", "ws://localhost");
    const token = url.searchParams.get("token") ?? "";
    const ticketId = url.searchParams.get("ticketId") ?? "";
    const role = url.searchParams.get("role") ?? "";

    // Authenticate
    let authenticated = false;

    if (role === "resident") {
      const payload = jwt.verify(token);
      if (payload) {
        authenticated = true;
      }
    } else if (role === "staff") {
      const payload = verifyAdminToken(token);
      if (payload) {
        authenticated = true;
      }
    }

    if (!authenticated || !ticketId) {
      ws.send(JSON.stringify({ type: "error", message: "unauthorized" }));
      ws.close(1008, "unauthorized");
      return;
    }

    // Setup heartbeat tracking
    ws.isAlive = true;
    ws.on("pong", () => {
      ws.isAlive = true;
    });

    // Join the ticket room
    joinRoom(ticketId, ws);

    // Clients send messages via REST POST; WS is receive-only
    ws.on("message", () => {
      // Ignore incoming client messages — REST POST is the authoritative write path
    });

    ws.on("close", () => {
      leaveRoom(ticketId, ws);
    });

    ws.on("error", () => {
      leaveRoom(ticketId, ws);
    });
  });
}
