import { db } from "@/lib/db";
import {
  announcementsTable,
  promotionsTable,
  faqsTable,
  type Announcement,
  type Promotion,
  type Faq,
} from "@workspace/db/schema";
import { eq, desc, asc } from "drizzle-orm";

// --- Announcements ---

export async function getAnnouncements(): Promise<Announcement[]> {
  return db.select().from(announcementsTable).orderBy(desc(announcementsTable.createdAt));
}

export async function getAnnouncementById(id: string): Promise<Announcement | null> {
  const rows = await db
    .select()
    .from(announcementsTable)
    .where(eq(announcementsTable.id, id))
    .limit(1);
  return rows[0] ?? null;
}

// --- Promotions ---

export async function getPromotions(): Promise<Promotion[]> {
  return db.select().from(promotionsTable).orderBy(desc(promotionsTable.createdAt));
}

export async function getPromotionById(id: string): Promise<Promotion | null> {
  const rows = await db.select().from(promotionsTable).where(eq(promotionsTable.id, id)).limit(1);
  return rows[0] ?? null;
}

// --- FAQs ---

export async function getFaqs(): Promise<Faq[]> {
  return db.select().from(faqsTable).orderBy(asc(faqsTable.sortOrder), desc(faqsTable.createdAt));
}

export async function getFaqById(id: string): Promise<Faq | null> {
  const rows = await db.select().from(faqsTable).where(eq(faqsTable.id, id)).limit(1);
  return rows[0] ?? null;
}
