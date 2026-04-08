import { pgTable, text, timestamp, boolean, pgEnum, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const announcementTypeEnum = pgEnum("announcement_type", ["announcement", "newsletter"]);
export const announcementAudienceEnum = pgEnum("announcement_audience", ["all", "residents_only", "guests_only"]);

export const announcementsTable = pgTable("announcements", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary").notNull(),
  type: announcementTypeEnum("type").notNull().default("announcement"),
  imageUrl: text("image_url"),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
  isPinned: boolean("is_pinned").notNull().default(false),
  isDraft: boolean("is_draft").notNull().default(false),
  targetAudience: announcementAudienceEnum("target_audience").notNull().default("all"),
  tags: json("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAnnouncementSchema = createInsertSchema(announcementsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcementsTable.$inferSelect;
