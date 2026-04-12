import { Router } from "express";
import { db } from "@workspace/db";
import { announcementsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const { type, limit = "20" } = req.query as { type?: string; limit?: string };
  let query = db.select().from(announcementsTable).orderBy(desc(announcementsTable.publishedAt));

  const rows = await query.limit(parseInt(limit));
  const filtered = type ? rows.filter(r => r.type === type) : rows;

  return res.json(filtered.map(a => ({
    id: a.id,
    title: a.title,
    content: a.content,
    summary: a.summary,
    type: a.type,
    imageUrl: a.imageUrl ?? null,
    publishedAt: a.publishedAt.toISOString(),
    isPinned: a.isPinned,
  })));
});

router.get("/:id", async (req, res) => {
  const [a] = await db.select().from(announcementsTable).where(eq(announcementsTable.id, req.params.id)).limit(1);
  if (!a) return res.status(404).json({ error: "not_found", message: "Announcement not found" });
  return res.json({
    id: a.id,
    title: a.title,
    content: a.content,
    summary: a.summary,
    type: a.type,
    imageUrl: a.imageUrl ?? null,
    publishedAt: a.publishedAt.toISOString(),
    isPinned: a.isPinned,
  });
});

export default router;
