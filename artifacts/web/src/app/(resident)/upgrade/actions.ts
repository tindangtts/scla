"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { usersTable, upgradeRequestsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

export async function submitUpgradeRequest(
  prevState: { error?: string; success?: boolean; paymentMethod?: string; sessionId?: string },
  formData: FormData,
): Promise<{ error?: string; success?: boolean; paymentMethod?: string; sessionId?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const unitNumber = (formData.get("unitNumber") as string)?.trim();
  const residentId = (formData.get("residentId") as string)?.trim();
  const developmentName = (formData.get("developmentName") as string)?.trim();
  const paymentMethod = formData.get("paymentMethod") as string;

  if (!unitNumber || !residentId || !developmentName) {
    return { error: "All fields are required." };
  }

  // Get DB user by email
  const dbUsers = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, user.email!))
    .limit(1);

  if (dbUsers.length === 0) {
    return { error: "User not found in database." };
  }

  const dbUser = dbUsers[0];

  // Check if already has a pending request
  const pendingRequests = await db
    .select()
    .from(upgradeRequestsTable)
    .where(
      and(eq(upgradeRequestsTable.userId, dbUser.id), eq(upgradeRequestsTable.status, "pending")),
    );

  if (pendingRequests.length > 0) {
    return { error: "You already have a pending upgrade request." };
  }

  // Insert upgrade request
  await db.insert(upgradeRequestsTable).values({
    userId: dbUser.id,
    userName: dbUser.name,
    userEmail: dbUser.email,
    unitNumber,
    residentId,
    developmentName,
    status: "pending",
  });

  // Update user upgrade status
  await db.update(usersTable).set({ upgradeStatus: "pending" }).where(eq(usersTable.id, dbUser.id));

  revalidatePath("/upgrade");
  const sessionId = crypto.randomUUID();
  return { success: true, paymentMethod, sessionId };
}
