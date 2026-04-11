import { pgTable, text, numeric, integer, boolean, pgEnum, timestamp, uuid, time, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const facilityCategoryEnum = pgEnum("facility_category", [
  "swimming_pool", "tennis_court", "basketball_court", "gym",
  "badminton_court", "function_room", "squash_court"
]);

export const facilitiesTable = pgTable("facilities", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  category: facilityCategoryEnum("category").notNull(),
  memberRate: numeric("member_rate", { precision: 12, scale: 2 }).notNull(),
  nonMemberRate: numeric("non_member_rate", { precision: 12, scale: 2 }).notNull(),
  openingTime: time("opening_time").notNull(),
  closingTime: time("closing_time").notNull(),
  maxCapacity: integer("max_capacity").notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_facilities_category").on(table.category),
  index("idx_facilities_is_available").on(table.isAvailable),
]);

export const insertFacilitySchema = createInsertSchema(facilitiesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertFacility = z.infer<typeof insertFacilitySchema>;
export type Facility = typeof facilitiesTable.$inferSelect;
