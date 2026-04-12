import { db } from "@/lib/db";
import { bookingsTable, type Booking } from "@workspace/db/schema";
import { eq, and, desc, count } from "drizzle-orm";

/**
 * Generate the next booking number in BK-XXXX format.
 */
export async function getNextBookingNumber(): Promise<string> {
  const result = await db.select({ total: count() }).from(bookingsTable);

  const nextNum = (result[0]?.total ?? 0) + 1;
  return "BK-" + String(nextNum).padStart(4, "0");
}

/**
 * Get bookings for a user, optionally filtered by status.
 */
export async function getUserBookings(userId: string, status?: string): Promise<Booking[]> {
  const conditions = [eq(bookingsTable.userId, userId)];

  if (status && ["upcoming", "completed", "cancelled"].includes(status)) {
    conditions.push(eq(bookingsTable.status, status as "upcoming" | "completed" | "cancelled"));
  }

  return db
    .select()
    .from(bookingsTable)
    .where(and(...conditions))
    .orderBy(desc(bookingsTable.date), desc(bookingsTable.startTime));
}

/**
 * Get a single booking by ID, scoped to a specific user.
 */
export async function getBookingById(id: string, userId: string): Promise<Booking | null> {
  const rows = await db
    .select()
    .from(bookingsTable)
    .where(and(eq(bookingsTable.id, id), eq(bookingsTable.userId, userId)))
    .limit(1);

  return rows[0] ?? null;
}
