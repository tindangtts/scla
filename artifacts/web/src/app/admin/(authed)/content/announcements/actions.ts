"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { announcementsTable, auditLogsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

export async function createAnnouncement(formData: FormData) {
  const { staff } = await requireAdmin();

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const summary = formData.get("summary") as string;
  const type = formData.get("type") as "announcement" | "newsletter";
  const targetAudience = formData.get("targetAudience") as "all" | "residents_only" | "guests_only";
  const isDraft = formData.get("isDraft") === "on";

  if (!title || !content || !summary) return;

  const inserted = await db
    .insert(announcementsTable)
    .values({
      title,
      content,
      summary,
      type: type || "announcement",
      targetAudience: targetAudience || "all",
      isDraft,
    })
    .returning({ id: announcementsTable.id });

  await db.insert(auditLogsTable).values({
    actorId: staff.id,
    actorEmail: staff.email,
    action: "content_create",
    targetType: "announcement",
    targetId: inserted[0].id,
    metadata: { title },
  });

  redirect("/admin/content/announcements");
}

export async function updateAnnouncement(formData: FormData) {
  const { staff } = await requireAdmin();

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const summary = formData.get("summary") as string;
  const type = formData.get("type") as "announcement" | "newsletter";
  const targetAudience = formData.get("targetAudience") as "all" | "residents_only" | "guests_only";
  const isDraft = formData.get("isDraft") === "on";

  if (!id || !title || !content || !summary) return;

  await db
    .update(announcementsTable)
    .set({
      title,
      content,
      summary,
      type: type || "announcement",
      targetAudience: targetAudience || "all",
      isDraft,
    })
    .where(eq(announcementsTable.id, id));

  await db.insert(auditLogsTable).values({
    actorId: staff.id,
    actorEmail: staff.email,
    action: "content_update",
    targetType: "announcement",
    targetId: id,
    metadata: { title },
  });

  revalidatePath("/admin/content/announcements");
  redirect("/admin/content/announcements");
}

export async function deleteAnnouncement(formData: FormData) {
  const { staff } = await requireAdmin();

  const id = formData.get("id") as string;
  if (!id) return;

  await db.delete(announcementsTable).where(eq(announcementsTable.id, id));

  await db.insert(auditLogsTable).values({
    actorId: staff.id,
    actorEmail: staff.email,
    action: "content_delete",
    targetType: "announcement",
    targetId: id,
  });

  redirect("/admin/content/announcements");
}
