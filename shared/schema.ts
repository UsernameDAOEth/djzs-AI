import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const newsletterIssues = pgTable("newsletter_issues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  issueNumber: integer("issue_number").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
  pdfUrl: text("pdf_url"),
  ipfsMetadataUri: text("ipfs_metadata_uri"),
  nftContractAddress: text("nft_contract_address"),
  isPublished: boolean("is_published").notNull().default(false),
});

export const insertNewsletterIssueSchema = createInsertSchema(newsletterIssues).omit({
  id: true,
  publishedAt: true,
});

export const updateNewsletterIssueSchema = insertNewsletterIssueSchema.partial().omit({
  issueNumber: true,
});

export type InsertNewsletterIssue = z.infer<typeof insertNewsletterIssueSchema>;
export type UpdateNewsletterIssue = z.infer<typeof updateNewsletterIssueSchema>;
export type NewsletterIssue = typeof newsletterIssues.$inferSelect;
