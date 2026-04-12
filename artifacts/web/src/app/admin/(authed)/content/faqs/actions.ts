"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { faqsTable, auditLogsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

export async function createFaq(formData: FormData) {
  const { staff } = await requireAdmin();

  const question = formData.get("question") as string;
  const answer = formData.get("answer") as string;
  const category = formData.get("category") as string;
  const isPublished = formData.get("isPublished") === "on";
  const sortOrder = parseInt(formData.get("sortOrder") as string, 10) || 0;

  if (!question || !answer) return;

  const inserted = await db
    .insert(faqsTable)
    .values({
      question,
      answer,
      category: category || "General",
      isPublished,
      sortOrder,
    })
    .returning({ id: faqsTable.id });

  await db.insert(auditLogsTable).values({
    actorId: staff.id,
    actorEmail: staff.email,
    action: "content_create",
    targetType: "faq",
    targetId: inserted[0].id,
    metadata: { question },
  });

  redirect("/admin/content/faqs");
}

export async function updateFaq(formData: FormData) {
  const { staff } = await requireAdmin();

  const id = formData.get("id") as string;
  const question = formData.get("question") as string;
  const answer = formData.get("answer") as string;
  const category = formData.get("category") as string;
  const isPublished = formData.get("isPublished") === "on";
  const sortOrder = parseInt(formData.get("sortOrder") as string, 10) || 0;

  if (!id || !question || !answer) return;

  await db
    .update(faqsTable)
    .set({
      question,
      answer,
      category: category || "General",
      isPublished,
      sortOrder,
      updatedAt: new Date(),
    })
    .where(eq(faqsTable.id, id));

  await db.insert(auditLogsTable).values({
    actorId: staff.id,
    actorEmail: staff.email,
    action: "content_update",
    targetType: "faq",
    targetId: id,
    metadata: { question },
  });

  revalidatePath("/admin/content/faqs");
  redirect("/admin/content/faqs");
}

export async function deleteFaq(formData: FormData) {
  const { staff } = await requireAdmin();

  const id = formData.get("id") as string;
  if (!id) return;

  await db.delete(faqsTable).where(eq(faqsTable.id, id));

  await db.insert(auditLogsTable).values({
    actorId: staff.id,
    actorEmail: staff.email,
    action: "content_delete",
    targetType: "faq",
    targetId: id,
  });

  redirect("/admin/content/faqs");
}
