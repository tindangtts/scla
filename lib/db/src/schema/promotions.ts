import { pgTable, text, timestamp, boolean, uuid, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const promotionsTable = pgTable(
  "promotions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    imageUrl: text("image_url"),
    validFrom: timestamp("valid_from").notNull().defaultNow(),
    validUntil: timestamp("valid_until"),
    isActive: boolean("is_active").notNull().default(true),
    partnerName: text("partner_name").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_promotions_is_active").on(table.isActive),
    index("idx_promotions_category").on(table.category),
    index("idx_promotions_valid_from_until").on(table.validFrom, table.validUntil),
  ],
);

export const insertPromotionSchema = createInsertSchema(promotionsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
export type Promotion = typeof promotionsTable.$inferSelect;
