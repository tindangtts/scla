import { db } from "@/lib/db";
import { facilitiesTable, bookingsTable } from "@workspace/db/schema";
import { eq, and, ne, asc } from "drizzle-orm";
import type { Facility } from "@workspace/db/schema";

/**
 * Get all available facilities, optionally filtered by category.
 */
export async function getFacilities(category?: string): Promise<Facility[]> {
  if (
    category &&
    [
      "swimming_pool",
      "tennis_court",
      "basketball_court",
      "gym",
      "badminton_court",
      "function_room",
      "squash_court",
    ].includes(category)
  ) {
    return db
      .select()
      .from(facilitiesTable)
      .where(
        and(
          eq(facilitiesTable.isAvailable, true),
          eq(
            facilitiesTable.category,
            category as Facility["category"]
          )
        )
      )
      .orderBy(asc(facilitiesTable.name));
  }

  return db
    .select()
    .from(facilitiesTable)
    .where(eq(facilitiesTable.isAvailable, true))
    .orderBy(asc(facilitiesTable.name));
}

/**
 * Get a single facility by ID.
 */
export async function getFacilityById(id: string): Promise<Facility | null> {
  const rows = await db
    .select()
    .from(facilitiesTable)
    .where(eq(facilitiesTable.id, id))
    .limit(1);

  return rows[0] ?? null;
}

/**
 * Generate hourly time slots for a facility on a given date,
 * marking which ones are already booked.
 */
export async function getAvailableSlots(
  facilityId: string,
  date: string
): Promise<{ startTime: string; endTime: string; isBooked: boolean }[]> {
  // Get facility hours
  const facility = await getFacilityById(facilityId);
  if (!facility) return [];

  // Parse opening/closing times (format: "HH:MM:SS" or "HH:MM")
  const openHour = parseInt(facility.openingTime.split(":")[0], 10);
  const closeHour = parseInt(facility.closingTime.split(":")[0], 10);

  // Get existing bookings for this facility+date that are not cancelled
  const existingBookings = await db
    .select({
      startTime: bookingsTable.startTime,
      endTime: bookingsTable.endTime,
    })
    .from(bookingsTable)
    .where(
      and(
        eq(bookingsTable.facilityId, facilityId),
        eq(bookingsTable.date, date),
        ne(bookingsTable.status, "cancelled")
      )
    );

  const bookedStarts = new Set(
    existingBookings.map((b) => b.startTime.substring(0, 5))
  );

  // Generate hourly slots
  const slots: { startTime: string; endTime: string; isBooked: boolean }[] = [];
  for (let h = openHour; h < closeHour; h++) {
    const start = String(h).padStart(2, "0") + ":00";
    const end = String(h + 1).padStart(2, "0") + ":00";
    slots.push({
      startTime: start,
      endTime: end,
      isBooked: bookedStarts.has(start),
    });
  }

  return slots;
}
