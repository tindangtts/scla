import { db } from "@/lib/db";
import { announcementsTable, promotionsTable } from "@workspace/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export async function getAnnouncements() {
  return db
    .select()
    .from(announcementsTable)
    .where(and(eq(announcementsTable.isDraft, false), eq(announcementsTable.type, "announcement")))
    .orderBy(desc(announcementsTable.isPinned), desc(announcementsTable.publishedAt))
    .limit(20);
}

export async function getNewsletters() {
  return db
    .select()
    .from(announcementsTable)
    .where(and(eq(announcementsTable.isDraft, false), eq(announcementsTable.type, "newsletter")))
    .orderBy(desc(announcementsTable.publishedAt))
    .limit(20);
}

export async function getPromotions() {
  return db
    .select()
    .from(promotionsTable)
    .where(
      and(
        eq(promotionsTable.isActive, true),
        sql`(${promotionsTable.validUntil} IS NULL OR ${promotionsTable.validUntil} >= NOW())`,
      ),
    )
    .orderBy(desc(promotionsTable.createdAt))
    .limit(20);
}

export async function getAnnouncementById(id: string) {
  const results = await db
    .select()
    .from(announcementsTable)
    .where(
      and(
        eq(announcementsTable.id, id),
        eq(announcementsTable.isDraft, false),
        eq(announcementsTable.type, "announcement"),
      ),
    )
    .limit(1);

  return results[0] ?? null;
}

export async function getNewsletterById(id: string) {
  const results = await db
    .select()
    .from(announcementsTable)
    .where(
      and(
        eq(announcementsTable.id, id),
        eq(announcementsTable.isDraft, false),
        eq(announcementsTable.type, "newsletter"),
      ),
    )
    .limit(1);

  return results[0] ?? null;
}

export async function getPromotionById(id: string) {
  const results = await db
    .select()
    .from(promotionsTable)
    .where(eq(promotionsTable.id, id))
    .limit(1);

  return results[0] ?? null;
}
