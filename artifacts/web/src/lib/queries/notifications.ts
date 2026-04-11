import { db } from "@/lib/db";
import { notificationsTable } from "@workspace/db/schema";
import { eq, and, desc, sql, count } from "drizzle-orm";

export async function getUserNotifications(userId: string) {
  return db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, userId))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(50);
}

export async function getUnreadCount(userId: string) {
  const result = await db
    .select({ value: count() })
    .from(notificationsTable)
    .where(
      and(
        eq(notificationsTable.userId, userId),
        eq(notificationsTable.isRead, false)
      )
    );

  return result[0]?.value ?? 0;
}

export async function markAsRead(notificationId: string, userId: string) {
  await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(
      and(
        eq(notificationsTable.id, notificationId),
        eq(notificationsTable.userId, userId)
      )
    );
}

export async function markAllAsRead(userId: string) {
  await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(
      and(
        eq(notificationsTable.userId, userId),
        eq(notificationsTable.isRead, false)
      )
    );
}
