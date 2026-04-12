import { Router } from "express";
import { db } from "@workspace/db";
import { bookingsTable, facilitiesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import * as jwt from "../lib/jwt.js";

const router = Router();

function requireAuth(req: any, res: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  return jwt.verify(authHeader.slice(7));
}

function mapBooking(b: typeof bookingsTable.$inferSelect) {
  return {
    id: b.id,
    bookingNumber: b.bookingNumber,
    facilityId: b.facilityId,
    facilityName: b.facilityName,
    facilityCategory: b.facilityCategory,
    date: b.date,
    startTime: b.startTime,
    endTime: b.endTime,
    totalAmount: parseFloat(b.totalAmount as string),
    status: b.status,
    paymentStatus: b.paymentStatus,
    notes: b.notes ?? null,
    createdAt: b.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const payload = requireAuth(req, res);
  if (!payload) return res.status(401).json({ error: "unauthorized" });

  const { status } = req.query as { status?: string };
  let bookings = await db.select().from(bookingsTable)
    .where(eq(bookingsTable.userId, payload.userId))
    .orderBy(desc(bookingsTable.date));

  if (status) bookings = bookings.filter(b => b.status === status);
  return res.json(bookings.map(mapBooking));
});

router.post("/", async (req, res) => {
  const payload = requireAuth(req, res);
  if (!payload) return res.status(401).json({ error: "unauthorized" });

  const { facilityId, date, slotId, notes } = req.body;
  if (!facilityId || !date || !slotId) {
    return res.status(400).json({ error: "validation_error", message: "Required fields missing" });
  }

  const [facility] = await db.select().from(facilitiesTable).where(eq(facilitiesTable.id, facilityId)).limit(1);
  if (!facility) return res.status(404).json({ error: "not_found", message: "Facility not found" });

  const parts = slotId.split("-");
  const hour = parts[parts.length - 1];
  const startTime = `${String(hour).padStart(2, "0")}:00`;
  const endTime = `${String(parseInt(hour) + 1).padStart(2, "0")}:00`;

  const count = await db.select().from(bookingsTable).where(eq(bookingsTable.userId, payload.userId));
  const bookingNumber = `BK-${String(count.length + 1).padStart(4, "0")}`;

  const [booking] = await db.insert(bookingsTable).values({
    bookingNumber,
    userId: payload.userId,
    facilityId,
    facilityName: facility.name,
    facilityCategory: facility.category,
    date,
    startTime,
    endTime,
    totalAmount: facility.nonMemberRate,
    status: "upcoming",
    paymentStatus: "pending",
    notes: notes ?? null,
  }).returning();

  return res.status(201).json(mapBooking(booking));
});

router.get("/:id", async (req, res) => {
  const payload = requireAuth(req, res);
  if (!payload) return res.status(401).json({ error: "unauthorized" });

  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, req.params.id)).limit(1);
  if (!booking) return res.status(404).json({ error: "not_found", message: "Booking not found" });
  return res.json(mapBooking(booking));
});

router.post("/:id/cancel", async (req, res) => {
  const payload = requireAuth(req, res);
  if (!payload) return res.status(401).json({ error: "unauthorized" });

  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, req.params.id)).limit(1);
  if (!booking) return res.status(404).json({ error: "not_found", message: "Booking not found" });

  const [updated] = await db.update(bookingsTable)
    .set({ status: "cancelled" })
    .where(eq(bookingsTable.id, req.params.id))
    .returning();

  return res.json(mapBooking(updated));
});

export default router;
