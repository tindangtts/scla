import { pgTable, text, timestamp, boolean, pgEnum, uuid, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const staffRoleEnum = pgEnum("staff_role", [
  "admin",
  "content_manager",
  "ticket_handler",
  "booking_manager",
  "user_verifier",
]);

export const staffUsersTable = pgTable(
  "staff_users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: staffRoleEnum("role").notNull().default("ticket_handler"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_staff_users_role").on(table.role),
    index("idx_staff_users_is_active").on(table.isActive),
  ],
);

export const insertStaffUserSchema = createInsertSchema(staffUsersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertStaffUser = z.infer<typeof insertStaffUserSchema>;
export type StaffUser = typeof staffUsersTable.$inferSelect;
