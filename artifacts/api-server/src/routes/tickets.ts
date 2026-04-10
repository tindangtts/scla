import { Router } from "express";
import type { Request, Response } from "express";
import { db } from "@workspace/db";
import { ticketsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth-middleware.js";

const router = Router();

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

router.get("/summary", requireAuth, async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;

  const tickets = await db.select().from(ticketsTable).where(eq(ticketsTable.userId, user.id));
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  return res.json({
    openCount: tickets.filter(t => t.status === "open").length,
    inProgressCount: tickets.filter(t => t.status === "in_progress").length,
    completedCount: tickets.filter(t => t.status === "completed").length,
    recentlyUpdated: tickets.filter(t => t.updatedAt > oneDayAgo).length,
  });
});

router.get("/", requireAuth, async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;

  const { status } = req.query as { status?: string };
  let tickets = await db.select().from(ticketsTable)
    .where(eq(ticketsTable.userId, user.id))
    .orderBy(desc(ticketsTable.createdAt));

  if (status) tickets = tickets.filter(t => t.status === status);
  return res.json(tickets.map(mapTicket));
});

router.post("/", requireAuth, async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;

  const { title, category, serviceType, unitNumber, description, attachmentUrl } = req.body;
  if (!title || !category || !serviceType || !description) {
    return res.status(400).json({ error: "validation_error", message: "Required fields missing" });
  }

  const result = await db.execute(
    sql`SELECT lpad(nextval('ticket_number_seq')::text, 4, '0') AS num`
  );
  const ticketNumber = `SA-${result.rows[0].num}`;

  const [ticket] = await db.insert(ticketsTable).values({
    ticketNumber,
    userId: user.id,
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

router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const [ticket] = await db.select().from(ticketsTable)
    .where(eq(ticketsTable.id, id))
    .limit(1);

  if (!ticket) return res.status(404).json({ error: "not_found", message: "Ticket not found" });
  return res.json(mapTicket(ticket));
});

export default router;
