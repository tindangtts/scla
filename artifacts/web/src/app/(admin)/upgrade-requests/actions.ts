"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { db } from "@/lib/db";
import {
  usersTable,
  staffUsersTable,
  upgradeRequestsTable,
} from "@workspace/db/schema";
import { eq } from "drizzle-orm";

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const staffRows = await db
    .select()
    .from(staffUsersTable)
    .where(eq(staffUsersTable.email, user.email!));

  if (staffRows.length === 0) {
    throw new Error("Not authorized");
  }

  return { user, staff: staffRows[0] };
}

export async function approveUpgrade(formData: FormData) {
  await verifyAdmin();

  const requestId = formData.get("requestId") as string;
  if (!requestId) return;

  // Get the upgrade request
  const requests = await db
    .select()
    .from(upgradeRequestsTable)
    .where(eq(upgradeRequestsTable.id, requestId))
    .limit(1);

  if (requests.length === 0 || requests[0].status !== "pending") return;

  const request = requests[0];

  // Update upgrade request status
  await db
    .update(upgradeRequestsTable)
    .set({ status: "approved", reviewedAt: new Date() })
    .where(eq(upgradeRequestsTable.id, requestId));

  // Update user: set to resident with apartment details
  await db
    .update(usersTable)
    .set({
      userType: "resident",
      upgradeStatus: "approved",
      unitNumber: request.unitNumber,
      residentId: request.residentId,
      developmentName: request.developmentName,
    })
    .where(eq(usersTable.id, request.userId));

  // Update Supabase Auth user metadata
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && serviceRoleKey) {
    const adminClient = createAdminClient(supabaseUrl, serviceRoleKey);
    // Find the auth user by email, then update metadata
    const listResult = await adminClient.auth.admin.listUsers();
    const users = listResult.data?.users ?? [];
    const authUser = users.find(
      (u: { email?: string }) => u.email === request.userEmail
    );
    if (authUser) {
      await adminClient.auth.admin.updateUserById(
        (authUser as { id: string }).id,
        {
          user_metadata: {
            user_type: "resident",
          },
        }
      );
    }
  }

  revalidatePath("/upgrade-requests");
}

export async function rejectUpgrade(formData: FormData) {
  await verifyAdmin();

  const requestId = formData.get("requestId") as string;
  if (!requestId) return;

  // Get the upgrade request
  const requests = await db
    .select()
    .from(upgradeRequestsTable)
    .where(eq(upgradeRequestsTable.id, requestId))
    .limit(1);

  if (requests.length === 0 || requests[0].status !== "pending") return;

  const request = requests[0];

  // Update upgrade request status
  await db
    .update(upgradeRequestsTable)
    .set({ status: "rejected", reviewedAt: new Date() })
    .where(eq(upgradeRequestsTable.id, requestId));

  // Update user upgrade status
  await db
    .update(usersTable)
    .set({ upgradeStatus: "rejected" })
    .where(eq(usersTable.id, request.userId));

  revalidatePath("/upgrade-requests");
}
