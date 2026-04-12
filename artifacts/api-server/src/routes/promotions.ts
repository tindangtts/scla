import { Router } from "express";
import { db } from "@workspace/db";
import { promotionsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const { category, limit = "20" } = req.query as { category?: string; limit?: string };
  const rows = await db.select().from(promotionsTable)
    .orderBy(desc(promotionsTable.validFrom))
    .limit(parseInt(limit));
  const filtered = category ? rows.filter(r => r.category === category) : rows;

  return res.json(filtered.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description,
    category: p.category,
    imageUrl: p.imageUrl ?? null,
    validFrom: p.validFrom.toISOString(),
    validUntil: p.validUntil?.toISOString() ?? null,
    isActive: p.isActive,
    partnerName: p.partnerName,
  })));
});

router.get("/:id", async (req, res) => {
  const [p] = await db.select().from(promotionsTable).where(eq(promotionsTable.id, req.params.id)).limit(1);
  if (!p) return res.status(404).json({ error: "not_found", message: "Promotion not found" });
  return res.json({
    id: p.id,
    title: p.title,
    description: p.description,
    category: p.category,
    imageUrl: p.imageUrl ?? null,
    validFrom: p.validFrom.toISOString(),
    validUntil: p.validUntil?.toISOString() ?? null,
    isActive: p.isActive,
    partnerName: p.partnerName,
  });
});

export default router;
