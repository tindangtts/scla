import { pgTable, text, timestamp, integer, uuid, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const infoCategoriesTable = pgTable("info_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  description: text("description").notNull(),
  articleCount: integer("article_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const infoArticlesTable = pgTable(
  "info_articles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    summary: text("summary").notNull(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => infoCategoriesTable.id, { onDelete: "cascade" }),
    categoryName: text("category_name").notNull(),
    imageUrl: text("image_url"),
    publishedAt: timestamp("published_at").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_info_articles_category_id").on(table.categoryId),
    index("idx_info_articles_published_at").on(table.publishedAt),
  ],
);

export const insertInfoCategorySchema = createInsertSchema(infoCategoriesTable).omit({
  id: true,
  createdAt: true,
});
export const insertInfoArticleSchema = createInsertSchema(infoArticlesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertInfoCategory = z.infer<typeof insertInfoCategorySchema>;
export type InfoCategory = typeof infoCategoriesTable.$inferSelect;
export type InsertInfoArticle = z.infer<typeof insertInfoArticleSchema>;
export type InfoArticle = typeof infoArticlesTable.$inferSelect;
