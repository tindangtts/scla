import { db } from "@/lib/db";
import { infoCategoriesTable, infoArticlesTable, faqsTable } from "@workspace/db/schema";
import { eq, and, asc, desc } from "drizzle-orm";

export async function getInfoCategories() {
  return db.select().from(infoCategoriesTable).orderBy(asc(infoCategoriesTable.name));
}

export async function getArticlesByCategory(categoryId: string) {
  return db
    .select()
    .from(infoArticlesTable)
    .where(eq(infoArticlesTable.categoryId, categoryId))
    .orderBy(desc(infoArticlesTable.publishedAt));
}

export async function getArticleById(id: string) {
  const results = await db
    .select()
    .from(infoArticlesTable)
    .where(eq(infoArticlesTable.id, id))
    .limit(1);

  return results[0] ?? null;
}

export async function getFaqs(category?: string) {
  const conditions = [eq(faqsTable.isPublished, true)];

  if (category) {
    conditions.push(eq(faqsTable.category, category));
  }

  return db
    .select()
    .from(faqsTable)
    .where(and(...conditions))
    .orderBy(asc(faqsTable.sortOrder));
}
