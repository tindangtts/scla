import { pgTable, text, timestamp, pgEnum, boolean, uuid, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userTypeEnum = pgEnum("user_type", ["guest", "resident"]);
export const upgradeStatusEnum = pgEnum("upgrade_status", [
  "none",
  "pending",
  "approved",
  "rejected",
]);

export const usersTable = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    phone: text("phone").notNull(),
    passwordHash: text("password_hash").notNull(),
    userType: userTypeEnum("user_type").notNull().default("guest"),
    unitNumber: text("unit_number"),
    residentId: text("resident_id"),
    estateId: text("estate_id"),
    developmentName: text("development_name"),
    upgradeStatus: upgradeStatusEnum("upgrade_status").notNull().default("none"),
    emailNotifications: boolean("email_notifications").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_users_user_type").on(table.userType),
    index("idx_users_unit_number").on(table.unitNumber),
    index("idx_users_development_name").on(table.developmentName),
  ],
);

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
