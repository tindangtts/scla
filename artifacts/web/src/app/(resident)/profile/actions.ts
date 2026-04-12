"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

export async function updateProfile(
  prevState: { error?: string; success?: boolean },
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();

  if (!name || name.length < 2 || name.length > 100) {
    return { error: "Name must be between 2 and 100 characters." };
  }

  if (!phone) {
    return { error: "Phone number is required." };
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
    .update(usersTable)
    .set({
      name,
      phone,
      updatedAt: new Date(),
    })
    .where(eq(usersTable.id, dbUser.id));

  revalidatePath("/profile");
  revalidatePath("/");

  return { success: true };
}
