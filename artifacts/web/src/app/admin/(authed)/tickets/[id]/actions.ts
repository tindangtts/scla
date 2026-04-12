"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { ticketsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { notifyTicketUpdate } from "@/lib/notifications";

export async function updateTicketStatus(formData: FormData) {
  await requireAdmin();

  const ticketId = formData.get("ticketId") as string;
  const newStatus = formData.get("status") as string;

  if (!ticketId || !newStatus) return;

  const validStatuses = ["open", "in_progress", "completed", "closed"] as const;
  if (!validStatuses.includes(newStatus as (typeof validStatuses)[number])) return;

  await db
    .update(ticketsTable)
    .set({
      status: newStatus as (typeof validStatuses)[number],
      updatedAt: new Date(),
    })
    .where(eq(ticketsTable.id, ticketId));

  // Fire-and-forget: notify the resident of the status change
  try {
    const ticketRows = await db
      .select({
        userId: ticketsTable.userId,
        ticketNumber: ticketsTable.ticketNumber,
      })
      .from(ticketsTable)
      .where(eq(ticketsTable.id, ticketId))
      .limit(1);

    if (ticketRows.length > 0) {
      const ticket = ticketRows[0];
      notifyTicketUpdate(ticket.userId, ticketId, ticket.ticketNumber, newStatus).catch(() => {});
    }
  } catch {
    // Don't block the action on notification errors
  }

  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath("/admin/tickets");
}

export async function assignTicket(formData: FormData) {
  await requireAdmin();

  const ticketId = formData.get("ticketId") as string;
  const staffId = formData.get("staffId") as string;

  if (!ticketId || !staffId) return;

  await db
    .update(ticketsTable)
    .set({
      assignedTo: staffId,
      updatedAt: new Date(),
    })
    .where(eq(ticketsTable.id, ticketId));

  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath("/admin/tickets");
}
