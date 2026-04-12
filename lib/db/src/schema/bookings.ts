import {
  pgTable,
  text,
  numeric,
  timestamp,
  pgEnum,
  pgSequence,
  uuid,
  date,
  time,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { facilitiesTable } from "./facilities";

export const bookingStatusEnum = pgEnum("booking_status", ["upcoming", "completed", "cancelled"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid", "refunded"]);

export const bookingNumberSeq = pgSequence("booking_number_seq", {
  startWith: 1,
  increment: 1,
  minValue: 1,
  maxValue: 999999,
  cycle: true,
});

export const bookingsTable = pgTable(
  "bookings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookingNumber: text("booking_number").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    facilityId: uuid("facility_id")
      .notNull()
      .references(() => facilitiesTable.id, { onDelete: "restrict" }),
    facilityName: text("facility_name").notNull(),
    facilityCategory: text("facility_category").notNull(),
    date: date("date").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
    status: bookingStatusEnum("status").notNull().default("upcoming"),
    paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
    notes: text("notes"),
    recurringGroupId: text("recurring_group_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_bookings_user_id").on(table.userId),
    index("idx_bookings_facility_id").on(table.facilityId),
    index("idx_bookings_status").on(table.status),
    index("idx_bookings_date").on(table.date),
    index("idx_bookings_user_status").on(table.userId, table.status),
    index("idx_bookings_facility_date").on(table.facilityId, table.date),
    index("idx_bookings_recurring_group").on(table.recurringGroupId),
  ],
);

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
