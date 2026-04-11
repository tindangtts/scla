import { Router } from "express";
import type { Request, Response } from "express";
import { db } from "@workspace/db";
import { ticketsTable, ticketMessagesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth-middleware.js";
import { broadcastToTicket } from "../lib/ws-server.js";

const ticketMessagesRouter = Router();

// GET /api/tickets/:id/messages — returns all messages for a ticket the resident owns
ticketMessagesRouter.get("/:id/messages", requireAuth, async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  const id = req.params.id as string;

  const [ticket] = await db.select().from(ticketsTable).where(eq(ticketsTable.id, id));
  if (!ticket) return res.status(404).json({ error: "not_found" });
  if (ticket.userId !== user.id) return res.status(403).json({ error: "forbidden" });

  const messages = await db
    .select()
    .from(ticketMessagesTable)
    .where(eq(ticketMessagesTable.ticketId, id))
    .orderBy(asc(ticketMessagesTable.createdAt));

  return res.json(messages);
});

// POST /api/tickets/:id/messages — resident sends a message in the ticket chat thread
ticketMessagesRouter.post("/:id/messages", requireAuth, async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  const id = req.params.id as string;

  const [ticket] = await db.select().from(ticketsTable).where(eq(ticketsTable.id, id));
  if (!ticket) return res.status(404).json({ error: "not_found" });
  if (ticket.userId !== user.id) return res.status(403).json({ error: "forbidden" });

  const { content } = req.body as { content?: string };
  if (!content || !content.trim()) {
    return res.status(400).json({ error: "validation_error", message: "content is required" });
  }

  const [inserted] = await db
    .insert(ticketMessagesTable)
    .values({
      ticketId: id,
      senderId: user.id,
      senderType: "resident",
      content: content.trim(),
    })
    .returning();

  broadcastToTicket(id, inserted);
  return res.status(201).json(inserted);
});

export default ticketMessagesRouter;
