import { db } from "@/lib/db";
import {
  facilitiesTable,
  bookingsTable,
  usersTable,
  type Facility,
  type Booking,
} from "@workspace/db/schema";
import { eq, and, desc, asc } from "drizzle-orm";

export type AdminBooking = Booking & {
  userName: string;
};

/**
 * Get all facilities ordered by name (no availability filter for admin).
 */
export async function getAllFacilities(): Promise<Facility[]> {
  return db.select().from(facilitiesTable).orderBy(asc(facilitiesTable.name));
}

/**
 * Get all bookings with optional facility and status filters.
 * Joins users table for booker name.
 */
export async function getAllBookings(
  facilityId?: string,
  status?: string,
): Promise<AdminBooking[]> {
  const conditions: ReturnType<typeof eq>[] = [];

  if (facilityId) {
    conditions.push(eq(bookingsTable.facilityId, facilityId));
  }

  if (status && ["upcoming", "completed", "cancelled"].includes(status)) {
    conditions.push(eq(bookingsTable.status, status as "upcoming" | "completed" | "cancelled"));
  }

  const rows = await db
    .select({
      booking: bookingsTable,
      userName: usersTable.name,
    })
    .from(bookingsTable)
    .innerJoin(usersTable, eq(bookingsTable.userId, usersTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(bookingsTable.date), desc(bookingsTable.startTime));

  return rows.map((r) => ({
    ...r.booking,
    userName: r.userName,
  }));
}
