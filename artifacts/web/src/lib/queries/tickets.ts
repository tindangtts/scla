import { db } from "@/lib/db";
import {
  ticketsTable,
  ticketMessagesTable,
  type Ticket,
  type TicketMessage,
} from "@workspace/db/schema";
import { eq, and, desc, asc, count } from "drizzle-orm";

/**
 * Get tickets for a user, optionally filtered by status.
 */
export async function getTickets(
  userId: string,
  status?: string
): Promise<Ticket[]> {
  const conditions = [eq(ticketsTable.userId, userId)];

  if (
    status &&
    ["open", "in_progress", "completed", "closed"].includes(status)
  ) {
    conditions.push(
      eq(
        ticketsTable.status,
        status as "open" | "in_progress" | "completed" | "closed"
      )
    );
  }

  return db
    .select()
    .from(ticketsTable)
    .where(and(...conditions))
    .orderBy(desc(ticketsTable.createdAt));
}

/**
 * Get a single ticket by ID, scoped to a specific user.
 */
export async function getTicketById(
  id: string,
  userId: string
): Promise<Ticket | null> {
  const rows = await db
    .select()
    .from(ticketsTable)
    .where(and(eq(ticketsTable.id, id), eq(ticketsTable.userId, userId)))
    .limit(1);

  return rows[0] ?? null;
}

/**
 * Get messages for a ticket, ordered chronologically.
 */
export async function getTicketMessages(
  ticketId: string
): Promise<TicketMessage[]> {
  return db
    .select()
    .from(ticketMessagesTable)
    .where(eq(ticketMessagesTable.ticketId, ticketId))
    .orderBy(asc(ticketMessagesTable.createdAt));
}

/**
 * Generate the next ticket number in SA-XXXX format.
 */
export async function getNextTicketNumber(): Promise<string> {
  const result = await db
    .select({ total: count() })
    .from(ticketsTable);

  const nextNum = (result[0]?.total ?? 0) + 1;
  return "SA-" + String(nextNum).padStart(4, "0");
}
