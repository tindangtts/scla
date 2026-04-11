import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { staffUsersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

/**
 * Get the currently authenticated Supabase user, or null if not logged in.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { user };
}

/**
 * Require authentication for resident pages.
 * Redirects to /login if not authenticated.
 * Returns the Supabase User object.
 */
export async function requireAuth() {
  const { user } = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Require admin (staff) authentication.
 * Redirects to /admin/login if not authenticated or not a staff member.
 * Returns both the Supabase User and the StaffUser row.
 */
export async function requireAdmin() {
  const { user } = await getCurrentUser();
  if (!user) {
    redirect("/admin/login");
  }

  const staffRows = await db
    .select()
    .from(staffUsersTable)
    .where(eq(staffUsersTable.email, user.email!));

  if (staffRows.length === 0) {
    redirect("/admin/login");
  }

  return { user, staff: staffRows[0] };
}
