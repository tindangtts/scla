import { Router } from "express";
import { db } from "@workspace/db";
import { infoCategoriesTable, infoArticlesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/info-categories", async (_req, res) => {
  const categories = await db.select().from(infoCategoriesTable);
  return res.json(categories.map(c => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
    description: c.description,
    articleCount: c.articleCount,
  })));
});

router.get("/info-articles", async (req, res) => {
  const { categoryId } = req.query as { categoryId?: string };
  let articles = await db.select().from(infoArticlesTable);
  if (categoryId) articles = articles.filter(a => a.categoryId === categoryId);
  return res.json(articles.map(a => ({
    id: a.id,
    title: a.title,
    content: a.content,
    summary: a.summary,
    categoryId: a.categoryId,
    categoryName: a.categoryName,
    imageUrl: a.imageUrl ?? null,
    publishedAt: a.publishedAt.toISOString(),
  })));
});

router.get("/info-articles/:id", async (req, res) => {
  const [article] = await db.select().from(infoArticlesTable).where(eq(infoArticlesTable.id, req.params.id)).limit(1);
  if (!article) return res.status(404).json({ error: "not_found", message: "Article not found" });
  return res.json({
    id: article.id,
    title: article.title,
    content: article.content,
    summary: article.summary,
    categoryId: article.categoryId,
    categoryName: article.categoryName,
    imageUrl: article.imageUrl ?? null,
    publishedAt: article.publishedAt.toISOString(),
  });
});

export default router;
