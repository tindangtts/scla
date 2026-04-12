"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { usersTable, facilitiesTable, bookingsTable } from "@workspace/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { getNextBookingNumber } from "@/lib/queries/bookings";

interface BookActionState {
  error?: string;
  success?: boolean;
  bookingNumber?: string;
}

export async function bookSlot(
  prevState: BookActionState,
  formData: FormData,
): Promise<BookActionState> {
  const facilityId = formData.get("facilityId") as string;
  const facilityName = formData.get("facilityName") as string;
  const date = formData.get("date") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;
  const rate = formData.get("rate") as string;
  const notes = (formData.get("notes") as string)?.trim() || null;
  const isRecurring = formData.get("recurring") === "on";
  const weeksStr = formData.get("weeks") as string;
  const weeks = isRecurring ? parseInt(weeksStr || "4", 10) : 1;

  if (!facilityId || !date || !startTime || !endTime) {
    return { error: "Missing required booking details." };
  }

  // Authenticate
  const user = await requireAuth();

  // Get DB user
  const dbUsers = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, user.email!))
    .limit(1);

  const dbUser = dbUsers[0];
  if (!dbUser) {
    return { error: "User not found." };
  }

  // Validate facility
  const facilities = await db
    .select()
    .from(facilitiesTable)
    .where(eq(facilitiesTable.id, facilityId))
    .limit(1);

  const facility = facilities[0];
  if (!facility || !facility.isAvailable) {
    return { error: "Facility not found or unavailable." };
  }

  const recurringGroupId = isRecurring ? crypto.randomUUID() : null;
  let firstBookingNumber = "";

  for (let i = 0; i < weeks; i++) {
    // Calculate the date for this week
    const bookingDate = new Date(date + "T00:00:00");
    bookingDate.setDate(bookingDate.getDate() + i * 7);
    const bookingDateStr = bookingDate.toISOString().split("T")[0];

    // Check if slot is already booked (race condition prevention)
    const existing = await db
      .select({ id: bookingsTable.id })
      .from(bookingsTable)
      .where(
        and(
          eq(bookingsTable.facilityId, facilityId),
          eq(bookingsTable.date, bookingDateStr),
          eq(bookingsTable.startTime, startTime),
          ne(bookingsTable.status, "cancelled"),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      if (i === 0) {
        return { error: "This slot is already booked. Please select another." };
      }
      // Skip this week for recurring bookings
      continue;
    }

    const bookingNumber = await getNextBookingNumber();
    if (i === 0) {
      firstBookingNumber = bookingNumber;
    }

    await db.insert(bookingsTable).values({
      bookingNumber,
      userId: dbUser.id,
      facilityId: facility.id,
      facilityName: facilityName || facility.name,
      facilityCategory: facility.category,
      date: bookingDateStr,
      startTime,
      endTime,
      totalAmount: facility.memberRate,
      status: "upcoming",
      paymentStatus: "pending",
      notes,
      recurringGroupId,
    });
  }

  revalidatePath("/bookings");
  revalidatePath("/bookings/facilities");
  revalidatePath("/");

  return { success: true, bookingNumber: firstBookingNumber };
}
