import { Router } from "express";
import { db } from "@workspace/db";
import { ticketsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import * as jwt from "../lib/jwt.js";

const router = Router();

function requireAuth(req: any, res: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  return jwt.verify(authHeader.slice(7));
}

function mapTicket(t: typeof ticketsTable.$inferSelect) {
  return {
    id: t.id,
    ticketNumber: t.ticketNumber,
    title: t.title,
    category: t.category,
    serviceType: t.serviceType,
    status: t.status,
    unitNumber: t.unitNumber ?? null,
    description: t.description,
    attachmentUrl: t.attachmentUrl ?? null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    updates: t.updates ?? [],
  };
}

router.get("/summary", async (req, res) => {
  const payload = requireAuth(req, res);
  if (!payload) return res.status(401).json({ error: "unauthorized" });

  const tickets = await db.select().from(ticketsTable).where(eq(ticketsTable.userId, payload.userId));
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  return res.json({
    openCount: tickets.filter(t => t.status === "open").length,
    inProgressCount: tickets.filter(t => t.status === "in_progress").length,
    completedCount: tickets.filter(t => t.status === "completed").length,
    recentlyUpdated: tickets.filter(t => t.updatedAt > oneDayAgo).length,
  });
});

router.get("/", async (req, res) => {
  const payload = requireAuth(req, res);
  if (!payload) return res.status(401).json({ error: "unauthorized" });

  const { status } = req.query as { status?: string };
  let tickets = await db.select().from(ticketsTable)
    .where(eq(ticketsTable.userId, payload.userId))
    .orderBy(desc(ticketsTable.createdAt));

  if (status) tickets = tickets.filter(t => t.status === status);
  return res.json(tickets.map(mapTicket));
});

router.post("/", async (req, res) => {
  const payload = requireAuth(req, res);
  if (!payload) return res.status(401).json({ error: "unauthorized" });

  const { title, category, serviceType, unitNumber, description, attachmentUrl } = req.body;
  if (!title || !category || !serviceType || !description) {
    return res.status(400).json({ error: "validation_error", message: "Required fields missing" });
  }

  const count = await db.select().from(ticketsTable).where(eq(ticketsTable.userId, payload.userId));
  const ticketNumber = `SA-${String(count.length + 1).padStart(4, "0")}`;

  const [ticket] = await db.insert(ticketsTable).values({
    ticketNumber,
    userId: payload.userId,
    title,
    category,
    serviceType,
    unitNumber: unitNumber ?? null,
    description,
    attachmentUrl: attachmentUrl ?? null,
    status: "open",
    updates: [{
      id: crypto.randomUUID(),
      message: "Ticket submitted successfully. Our team will review and respond shortly.",
      author: "Star Assist Team",
      authorType: "staff" as const,
      createdAt: new Date().toISOString(),
    }],
  }).returning();

  return res.status(201).json(mapTicket(ticket));
});

router.get("/:id", async (req, res) => {
  const payload = requireAuth(req, res);
  if (!payload) return res.status(401).json({ error: "unauthorized" });

  const [ticket] = await db.select().from(ticketsTable)
    .where(eq(ticketsTable.id, req.params.id))
    .limit(1);

  if (!ticket) return res.status(404).json({ error: "not_found", message: "Ticket not found" });
  return res.json(mapTicket(ticket));
});

export default router;
