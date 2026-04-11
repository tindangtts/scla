"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import {
  ticketMessagesTable,
  ticketsTable,
  usersTable,
} from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { notifyNewMessage } from "@/lib/notifications";

export async function sendTicketMessage({
  ticketId,
  content,
}: {
  ticketId: string;
  content: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Look up the app DB user
  const userRows = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, user.email!))
    .limit(1);

  if (userRows.length === 0) {
    throw new Error("User account not found");
  }

  const dbUser = userRows[0];

  const [message] = await db
    .insert(ticketMessagesTable)
    .values({
      ticketId,
      senderId: dbUser.id,
      senderType: "resident",
      content: content.trim(),
    })
    .returning();

  // Fire-and-forget: notify assigned staff
  try {
    const ticketRows = await db
      .select({
        ticketNumber: ticketsTable.ticketNumber,
        assignedTo: ticketsTable.assignedTo,
      })
      .from(ticketsTable)
      .where(eq(ticketsTable.id, ticketId))
      .limit(1);

    if (ticketRows.length > 0 && ticketRows[0].assignedTo) {
      notifyNewMessage(
        ticketRows[0].assignedTo,
        ticketId,
        ticketRows[0].ticketNumber
      ).catch(() => {});
    }
  } catch {
    // Don't block the action on notification errors
  }

  return message;
}
