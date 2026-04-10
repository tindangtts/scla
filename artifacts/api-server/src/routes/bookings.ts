import { Router } from "express";
import type { Request, Response } from "express";
import { db } from "@workspace/db";
import { bookingsTable, facilitiesTable } from "@workspace/db";
import { eq, desc, sql, and, gte } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth-middleware.js";

const router = Router();

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
    recurringGroupId: b.recurringGroupId ?? null,
    createdAt: b.createdAt.toISOString(),
  };
}

router.get("/", requireAuth, async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;

  const { status } = req.query as { status?: string };
  let bookings = await db.select().from(bookingsTable)
    .where(eq(bookingsTable.userId, user.id))
    .orderBy(desc(bookingsTable.date));

  if (status) bookings = bookings.filter(b => b.status === status);
  return res.json(bookings.map(mapBooking));
});

router.post("/", requireAuth, async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  const { facilityId, date, slotId, notes, recurring } = req.body;

  if (!facilityId || !date || !slotId) {
    return res.status(400).json({ error: "validation_error", message: "Required fields missing" });
  }

  const [facility] = await db.select().from(facilitiesTable).where(eq(facilitiesTable.id, facilityId)).limit(1);
  if (!facility) return res.status(404).json({ error: "not_found", message: "Facility not found" });

  const parts = slotId.split("-");
  const hour = parts[parts.length - 1];
  const startTime = `${String(hour).padStart(2, "0")}:00`;
  const endTime = `${String(parseInt(hour) + 1).padStart(2, "0")}:00`;

  // For recurring: create 4 bookings on same weekday for 4 consecutive weeks
  const isRecurring = recurring === true;
  const recurringGroupId = isRecurring ? crypto.randomUUID() : null;
  const occurrenceCount = isRecurring ? 4 : 1;
  const createdBookings: (typeof bookingsTable.$inferSelect)[] = [];

  for (let i = 0; i < occurrenceCount; i++) {
    // Calculate date offset: add i * 7 days
    const baseDate = new Date(date);
    baseDate.setDate(baseDate.getDate() + i * 7);
    const bookingDate = baseDate.toISOString().split("T")[0]!;

    const result = await db.execute(
      sql`SELECT lpad(nextval('booking_number_seq')::text, 4, '0') AS num`
    );
    const bookingNumber = `BK-${result.rows[0].num}`;

    const [booking] = await db.insert(bookingsTable).values({
      bookingNumber,
      userId: user.id,
      facilityId,
      facilityName: facility.name,
      facilityCategory: facility.category,
      date: bookingDate,
      startTime,
      endTime,
      totalAmount: facility.nonMemberRate,
      status: "upcoming",
      paymentStatus: "pending",
      notes: notes ?? null,
      recurringGroupId,
    }).returning();

    createdBookings.push(booking);
  }

  // Return the first booking (the requested date) for UI navigation
  // All bookings are accessible via GET /bookings
  return res.status(201).json(mapBooking(createdBookings[0]));
});

router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id)).limit(1);
  if (!booking) return res.status(404).json({ error: "not_found", message: "Booking not found" });
  return res.json(mapBooking(booking));
});

// Cancel all upcoming bookings in a recurring group
router.post("/:id/cancel-group", requireAuth, async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { user } = req as AuthenticatedRequest;

  // Find the booking to get its recurringGroupId
  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id)).limit(1);
  if (!booking) return res.status(404).json({ error: "not_found", message: "Booking not found" });
  if (!booking.recurringGroupId) {
    return res.status(400).json({ error: "not_recurring", message: "This booking is not part of a recurring group" });
  }
  if (booking.userId !== user.id) {
    return res.status(403).json({ error: "forbidden", message: "Not your booking" });
  }

  const today = new Date().toISOString().split("T")[0]!;

  // Cancel all upcoming bookings in the group on or after today
  const updated = await db.update(bookingsTable)
    .set({ status: "cancelled" })
    .where(
      and(
        eq(bookingsTable.recurringGroupId, booking.recurringGroupId),
        eq(bookingsTable.userId, user.id),
        eq(bookingsTable.status, "upcoming"),
        gte(bookingsTable.date, today)
      )
    )
    .returning();

  return res.json({ cancelled: updated.length, bookings: updated.map(mapBooking) });
});

router.post("/:id/cancel", requireAuth, async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id)).limit(1);
  if (!booking) return res.status(404).json({ error: "not_found", message: "Booking not found" });

  const [updated] = await db.update(bookingsTable)
    .set({ status: "cancelled" })
    .where(eq(bookingsTable.id, id))
    .returning();

  return res.json(mapBooking(updated));
});

export default router;
