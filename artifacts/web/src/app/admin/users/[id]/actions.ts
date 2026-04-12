"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { db } from "@/lib/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

export async function updateUserRole(formData: FormData) {
  await requireAdmin();

  const userId = formData.get("userId") as string;
  const newRole = formData.get("newRole") as string;

  if (!userId || !newRole) return;
  if (newRole !== "guest" && newRole !== "resident") return;

  // Update app DB
  const updatedRows = await db
    .select({ email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (updatedRows.length === 0) return;

  await db
    .update(usersTable)
    .set({ userType: newRole })
    .where(eq(usersTable.id, userId));

  // Update Supabase Auth user_metadata
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && serviceRoleKey) {
    const adminClient = createAdminClient(supabaseUrl, serviceRoleKey);
    const listResult = await adminClient.auth.admin.listUsers();
    const users = listResult.data?.users ?? [];
    const authUser = users.find(
      (u: { email?: string }) => u.email === updatedRows[0].email
    );
    if (authUser) {
      await adminClient.auth.admin.updateUserById(
        (authUser as { id: string }).id,
        {
          user_metadata: {
            user_type: newRole,
          },
        }
      );
    }
  }

  revalidatePath(`/admin/users/${userId}`);
}
