"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

export async function updatePreferences(
  prevState: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const emailNotifications = formData.get("emailNotifications") === "on";

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
    .update(usersTable)
    .set({
      emailNotifications,
      updatedAt: new Date(),
    })
    .where(eq(usersTable.id, dbUser.id));

  revalidatePath("/notifications/preferences");
  return { success: true };
}
