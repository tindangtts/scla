import { sendPushToUser } from "./push";
import { sendBillOverdueEmail, sendTicketUpdateEmail } from "./email";
import { db } from "@/lib/db";
import { notificationsTable, usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

async function getUserEmailInfo(userId: string) {
  const rows = await db
    .select({
      email: usersTable.email,
      name: usersTable.name,
      emailNotifications: usersTable.emailNotifications,
    })
    .from(usersTable)
    .where(eq(usersTable.id, userId));
  return rows[0] ?? null;
}

export async function notifyBillOverdue(
  userId: string,
  invoiceNumber: string,
  amount: number
) {
  const title = "Bill Overdue";
  const body = `Invoice ${invoiceNumber} for MMK ${amount.toLocaleString()} is overdue`;

  // 1. In-app notification
  try {
    await db.insert(notificationsTable).values({
      userId,
      title,
      body,
      type: "general",
    });
  } catch (err) {
    console.error("[notify] Failed to insert bill overdue notification:", err);
  }

  // 2. Push notification
  try {
    await sendPushToUser(userId, { title, body, url: "/bills" });
  } catch (err) {
    console.error("[notify] Failed to send bill overdue push:", err);
  }

  // 3. Email (if user opted in)
  try {
    const user = await getUserEmailInfo(userId);
    if (user?.emailNotifications) {
      await sendBillOverdueEmail(user.email, user.name, invoiceNumber, amount);
    }
  } catch (err) {
    console.error("[notify] Failed to send bill overdue email:", err);
  }
}

export async function notifyTicketUpdate(
  userId: string,
  ticketId: string,
  ticketNumber: string,
  newStatus: string
) {
  const title = "Ticket Updated";
  const body = `Ticket ${ticketNumber} is now ${newStatus}`;

  // 1. In-app notification
  try {
    await db.insert(notificationsTable).values({
      userId,
      title,
      body,
      type: "ticket_update",
      relatedId: ticketId,
    });
  } catch (err) {
    console.error("[notify] Failed to insert ticket update notification:", err);
  }

  // 2. Push notification
  try {
    await sendPushToUser(userId, {
      title,
      body,
      url: `/star-assist/${ticketId}`,
    });
  } catch (err) {
    console.error("[notify] Failed to send ticket update push:", err);
  }

  // 3. Email (if user opted in)
  try {
    const user = await getUserEmailInfo(userId);
    if (user?.emailNotifications) {
      await sendTicketUpdateEmail(
        user.email,
        user.name,
        ticketNumber,
        newStatus
      );
    }
  } catch (err) {
    console.error("[notify] Failed to send ticket update email:", err);
  }
}

export async function notifyNewMessage(
  userId: string,
  ticketId: string,
  ticketNumber: string
) {
  const title = "New Message";
  const body = `New message on ticket ${ticketNumber}`;

  // 1. In-app notification
  try {
    await db.insert(notificationsTable).values({
      userId,
      title,
      body,
      type: "ticket_update",
      relatedId: ticketId,
    });
  } catch (err) {
    console.error("[notify] Failed to insert new message notification:", err);
  }

  // 2. Push notification (no email for chat messages — too noisy)
  try {
    await sendPushToUser(userId, {
      title,
      body,
      url: `/star-assist/${ticketId}`,
    });
  } catch (err) {
    console.error("[notify] Failed to send new message push:", err);
  }
}
