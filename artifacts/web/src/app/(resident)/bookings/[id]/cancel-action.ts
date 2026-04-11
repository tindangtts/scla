"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { usersTable, bookingsTable } from "@workspace/db/schema";
import { eq, and, gte } from "drizzle-orm";

interface CancelActionState {
  error?: string;
  success?: boolean;
}

export async function cancelBooking(
  prevState: CancelActionState,
  formData: FormData
): Promise<CancelActionState> {
  const bookingId = formData.get("bookingId") as string;
  const mode = formData.get("mode") as string; // "single" or "bulk"

  if (!bookingId) {
    return { error: "Booking ID is required." };
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

  if (mode === "bulk") {
    // Get the booking to find its recurringGroupId
    const bookings = await db
      .select({ recurringGroupId: bookingsTable.recurringGroupId })
      .from(bookingsTable)
      .where(
        and(eq(bookingsTable.id, bookingId), eq(bookingsTable.userId, dbUser.id))
      )
      .limit(1);

    const booking = bookings[0];
    if (!booking?.recurringGroupId) {
      return { error: "Booking not found or not part of a recurring group." };
    }

    // Cancel all future bookings in the recurring group
    const today = new Date().toISOString().split("T")[0];
    await db
      .update(bookingsTable)
      .set({ status: "cancelled" })
      .where(
        and(
          eq(bookingsTable.recurringGroupId, booking.recurringGroupId),
          eq(bookingsTable.userId, dbUser.id),
          eq(bookingsTable.status, "upcoming"),
          gte(bookingsTable.date, today)
        )
      );
  } else {
    // Single cancel
    await db
      .update(bookingsTable)
      .set({ status: "cancelled" })
      .where(
        and(
          eq(bookingsTable.id, bookingId),
          eq(bookingsTable.userId, dbUser.id),
          eq(bookingsTable.status, "upcoming")
        )
      );
  }

  revalidatePath("/bookings");
  redirect("/bookings");
}
