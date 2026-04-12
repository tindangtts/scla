import { Router } from "express";
import { db } from "@workspace/db";
import { facilitiesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function mapFacility(f: typeof facilitiesTable.$inferSelect) {
  return {
    id: f.id,
    name: f.name,
    description: f.description,
    imageUrl: f.imageUrl ?? null,
    category: f.category,
    memberRate: parseFloat(f.memberRate as string),
    nonMemberRate: parseFloat(f.nonMemberRate as string),
    openingTime: f.openingTime,
    closingTime: f.closingTime,
    maxCapacity: f.maxCapacity,
    isAvailable: f.isAvailable,
  };
}

router.get("/", async (_req, res) => {
  const facilities = await db.select().from(facilitiesTable);
  return res.json(facilities.map(mapFacility));
});

router.get("/:id/slots", async (req, res) => {
  const [facility] = await db.select().from(facilitiesTable).where(eq(facilitiesTable.id, req.params.id)).limit(1);
  if (!facility) return res.status(404).json({ error: "not_found", message: "Facility not found" });

  const { date } = req.query as { date?: string };
  if (!date) return res.status(400).json({ error: "validation_error", message: "Date is required" });

  const slots = [];
  const startHour = parseInt(facility.openingTime.split(":")[0]);
  const endHour = parseInt(facility.closingTime.split(":")[0]);

  for (let h = startHour; h < endHour; h++) {
    const startTime = `${String(h).padStart(2, "0")}:00`;
    const endTime = `${String(h + 1).padStart(2, "0")}:00`;
    const isAvailable = Math.random() > 0.3;
    slots.push({
      id: `${req.params.id}-${date}-${h}`,
      startTime,
      endTime,
      isAvailable,
      price: parseFloat(facility.nonMemberRate as string),
    });
  }

  return res.json(slots);
});

export default router;
