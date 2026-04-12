"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { staffUsersTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

export async function adminLogin(prevState: { error?: string }, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Invalid email or password" };
  }

  // Verify user is active staff
  const staffRows = await db
    .select()
    .from(staffUsersTable)
    .where(and(eq(staffUsersTable.email, email), eq(staffUsersTable.isActive, true)));

  if (staffRows.length === 0) {
    // Not a staff member — sign them out and deny access
    await supabase.auth.signOut();
    return { error: "Access denied. Staff account required." };
  }

  revalidatePath("/admin", "layout");
  redirect("/admin/dashboard");
}
