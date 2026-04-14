"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { facilitiesTable, auditLogsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

export async function createFacility(formData: FormData) {
  const { staff } = await requireAdmin();

  const name = formData.get("name") as string;
  const category = formData.get("category") as
    | "swimming_pool"
    | "tennis_court"
    | "basketball_court"
    | "gym"
    | "badminton_court"
    | "function_room"
    | "squash_court";
  const description = formData.get("description") as string;
  const memberRate = formData.get("memberRate") as string;
  const nonMemberRate = formData.get("nonMemberRate") as string;
  const openingTime = formData.get("openingTime") as string;
  const closingTime = formData.get("closingTime") as string;
  const maxCapacity = parseInt(formData.get("maxCapacity") as string, 10);
  const isAvailable = formData.get("isAvailable") === "on";

  if (!name || !description || !category) return;

  const inserted = await db
    .insert(facilitiesTable)
    .values({
      name,
      category,
      description,
      memberRate,
      nonMemberRate,
      openingTime,
      closingTime,
      maxCapacity,
      isAvailable,
    })
    .returning({ id: facilitiesTable.id });

  await db.insert(auditLogsTable).values({
    actorId: staff.id,
    actorEmail: staff.email,
    action: "facility_create",
    targetType: "facility",
    targetId: inserted[0].id,
    metadata: { name },
  });

  redirect("/admin/facilities");
}

export async function updateFacility(formData: FormData) {
  const { staff } = await requireAdmin();

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const category = formData.get("category") as
    | "swimming_pool"
    | "tennis_court"
    | "basketball_court"
    | "gym"
    | "badminton_court"
    | "function_room"
    | "squash_court";
  const description = formData.get("description") as string;
  const memberRate = formData.get("memberRate") as string;
  const nonMemberRate = formData.get("nonMemberRate") as string;
  const openingTime = formData.get("openingTime") as string;
  const closingTime = formData.get("closingTime") as string;
  const maxCapacity = parseInt(formData.get("maxCapacity") as string, 10);
  const isAvailable = formData.get("isAvailable") === "on";

  if (!id) return;

  await db
    .update(facilitiesTable)
    .set({
      name,
      category,
      description,
      memberRate,
      nonMemberRate,
      openingTime,
      closingTime,
      maxCapacity,
      isAvailable,
    })
    .where(eq(facilitiesTable.id, id));

  await db.insert(auditLogsTable).values({
    actorId: staff.id,
    actorEmail: staff.email,
    action: "facility_update",
    targetType: "facility",
    targetId: id,
    metadata: { name },
  });

  revalidatePath("/admin/facilities");
  redirect("/admin/facilities");
}

export async function deleteFacility(formData: FormData) {
  const { staff } = await requireAdmin();

  const id = formData.get("id") as string;
  if (!id) return;

  await db.delete(facilitiesTable).where(eq(facilitiesTable.id, id));

  await db.insert(auditLogsTable).values({
    actorId: staff.id,
    actorEmail: staff.email,
    action: "facility_delete",
    targetType: "facility",
    targetId: id,
  });

  redirect("/admin/facilities");
}
