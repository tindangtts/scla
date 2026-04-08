import { pgTable, text, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bookingStatusEnum = pgEnum("booking_status", ["upcoming", "completed", "cancelled"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid", "refunded"]);

export const bookingsTable = pgTable("bookings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  bookingNumber: text("booking_number").notNull(),
  userId: text("user_id").notNull(),
  facilityId: text("facility_id").notNull(),
  facilityName: text("facility_name").notNull(),
  facilityCategory: text("facility_category").notNull(),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  status: bookingStatusEnum("status").notNull().default("upcoming"),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
