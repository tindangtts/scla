"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { staffUsersTable, auditLogsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import bcryptjs from "bcryptjs";

export async function createStaff(formData: FormData) {
  const { staff } = await requireAdmin();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as (typeof staffUsersTable.role.enumValues)[number];

  if (!name || !email || !password || !role) return;

  const passwordHash = await bcryptjs.hash(password, 10);

  const inserted = await db
    .insert(staffUsersTable)
    .values({
      name,
      email,
      passwordHash,
      role,
    })
    .returning({ id: staffUsersTable.id });

  // Create Supabase Auth user
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && serviceRoleKey) {
    const adminClient = createAdminClient(supabaseUrl, serviceRoleKey);
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        user_type: "staff",
        staff_role: role,
      },
    });
  }

  // Audit log
  await db.insert(auditLogsTable).values({
    actorId: staff.id,
    actorEmail: staff.email,
    action: "staff_create",
    targetType: "staff",
    targetId: inserted[0].id,
    metadata: { name, email, role },
  });

  redirect("/admin/staff");
}

export async function updateStaff(formData: FormData) {
  const { staff } = await requireAdmin();

  const staffId = formData.get("staffId") as string;
  const name = formData.get("name") as string;
  const role = formData.get("role") as (typeof staffUsersTable.role.enumValues)[number];
  const isActive = formData.get("isActive") === "on";

  if (!staffId || !name || !role) return;

  // Get current staff to detect deactivation
  const currentRows = await db
    .select()
    .from(staffUsersTable)
    .where(eq(staffUsersTable.id, staffId))
    .limit(1);

  if (currentRows.length === 0) return;

  const wasActive = currentRows[0].isActive;

  await db
    .update(staffUsersTable)
    .set({
      name,
      role,
      isActive,
      updatedAt: new Date(),
    })
    .where(eq(staffUsersTable.id, staffId));

  // Determine audit action
  const auditAction = wasActive && !isActive ? "staff_deactivate" : "staff_update";

  await db.insert(auditLogsTable).values({
    actorId: staff.id,
    actorEmail: staff.email,
    action: auditAction,
    targetType: "staff",
    targetId: staffId,
    metadata: { name, role, isActive },
  });

  revalidatePath("/admin/staff");
  redirect("/admin/staff");
}
