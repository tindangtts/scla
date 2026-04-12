"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { usersTable, notificationsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

export async function markAsReadAction(
  prevState: { error?: string; success?: boolean },
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const notificationId = formData.get("notificationId") as string;
  if (!notificationId) {
    return { error: "Notification ID is required." };
  }

  const user = await requireAuth();

  const dbUsers = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, user.email!))
    .limit(1);

  const dbUser = dbUsers[0];
  if (!dbUser) {
    return { error: "User not found." };
  }

  await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(
      and(eq(notificationsTable.id, notificationId), eq(notificationsTable.userId, dbUser.id)),
    );

  revalidatePath("/notifications");
  return { success: true };
}

export async function markAllAsReadAction(
  prevState: { error?: string; success?: boolean },
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const user = await requireAuth();

  const dbUsers = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, user.email!))
    .limit(1);

  const dbUser = dbUsers[0];
  if (!dbUser) {
    return { error: "User not found." };
  }

  await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(and(eq(notificationsTable.userId, dbUser.id), eq(notificationsTable.isRead, false)));

  revalidatePath("/notifications");
  return { success: true };
}
