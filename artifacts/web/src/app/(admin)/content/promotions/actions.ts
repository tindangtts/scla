"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { promotionsTable, auditLogsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

export async function createPromotion(formData: FormData) {
  const { staff } = await requireAdmin();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const partnerName = formData.get("partnerName") as string;
  const validFrom = formData.get("validFrom") as string;
  const validUntil = formData.get("validUntil") as string;
  const isActive = formData.get("isActive") === "on";

  if (!title || !description || !category || !partnerName) return;

  const inserted = await db
    .insert(promotionsTable)
    .values({
      title,
      description,
      category,
      partnerName,
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      validUntil: validUntil ? new Date(validUntil) : null,
      isActive,
    })
    .returning({ id: promotionsTable.id });

  await db.insert(auditLogsTable).values({
    actorId: staff.id,
    actorEmail: staff.email,
    action: "content_create",
    targetType: "promotion",
    targetId: inserted[0].id,
    metadata: { title },
  });

  redirect("/admin/content/promotions");
}

export async function updatePromotion(formData: FormData) {
  const { staff } = await requireAdmin();

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const partnerName = formData.get("partnerName") as string;
  const validFrom = formData.get("validFrom") as string;
  const validUntil = formData.get("validUntil") as string;
  const isActive = formData.get("isActive") === "on";

  if (!id || !title || !description || !category || !partnerName) return;

  await db
    .update(promotionsTable)
    .set({
      title,
      description,
      category,
      partnerName,
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      validUntil: validUntil ? new Date(validUntil) : null,
      isActive,
    })
    .where(eq(promotionsTable.id, id));

  await db.insert(auditLogsTable).values({
    actorId: staff.id,
    actorEmail: staff.email,
    action: "content_update",
    targetType: "promotion",
    targetId: id,
    metadata: { title },
  });

  revalidatePath("/admin/content/promotions");
  redirect("/admin/content/promotions");
}

export async function deletePromotion(formData: FormData) {
  const { staff } = await requireAdmin();

  const id = formData.get("id") as string;
  if (!id) return;

  await db
    .delete(promotionsTable)
    .where(eq(promotionsTable.id, id));

  await db.insert(auditLogsTable).values({
    actorId: staff.id,
    actorEmail: staff.email,
    action: "content_delete",
    targetType: "promotion",
    targetId: id,
  });

  redirect("/admin/content/promotions");
}
