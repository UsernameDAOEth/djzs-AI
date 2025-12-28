import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const members = pgTable("members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  address: text("address").notNull().unique(),
  ensName: text("ens_name"),
  xHandle: text("x_handle"),
  xLinkSignature: text("x_link_signature"),
  isAdmin: boolean("is_admin").notNull().default(false),
  isAllowlisted: boolean("is_allowlisted").notNull().default(false),
  isMuted: boolean("is_muted").notNull().default(false),
  hasNft: boolean("has_nft").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMemberSchema = createInsertSchema(members).omit({
  id: true,
  createdAt: true,
});

export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Member = typeof members.$inferSelect;

export const rooms = pgTable("rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  xmtpGroupId: text("xmtp_group_id"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRoomSchema = createInsertSchema(rooms).omit({
  id: true,
  createdAt: true,
});

export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof rooms.$inferSelect;

export const paymentReceipts = pgTable("payment_receipts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chainId: integer("chain_id").notNull(),
  tokenSymbol: text("token_symbol").notNull(),
  amount: text("amount").notNull(),
  fromAddress: text("from_address").notNull(),
  toAddress: text("to_address").notNull(),
  txHash: text("tx_hash").notNull().unique(),
  roomId: text("room_id"),
  note: text("note"),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPaymentReceiptSchema = createInsertSchema(paymentReceipts).omit({
  id: true,
  createdAt: true,
  verified: true,
});

export type InsertPaymentReceipt = z.infer<typeof insertPaymentReceiptSchema>;
export type PaymentReceipt = typeof paymentReceipts.$inferSelect;

export const tradeSignalCardSchema = z.object({
  type: z.literal("trade_signal"),
  id: z.string(),
  asset: z.string(),
  direction: z.enum(["long", "short"]),
  entry: z.string(),
  invalidation: z.string(),
  tp: z.array(z.string()),
  timeframe: z.string().optional(),
  leverage: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  authorAddress: z.string(),
});

export const tradeUpdateSchema = z.object({
  type: z.literal("trade_update"),
  tradeId: z.string(),
  status: z.enum(["hit_tp", "invalidated", "closed"]),
  note: z.string().optional(),
  createdAt: z.string(),
  authorAddress: z.string(),
});

export const predictionCardSchema = z.object({
  type: z.literal("prediction"),
  id: z.string(),
  question: z.string(),
  endsAt: z.string(),
  outcomes: z.tuple([z.literal("YES"), z.literal("NO")]),
  stakeToken: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  authorAddress: z.string(),
});

export const predictionVoteSchema = z.object({
  type: z.literal("prediction_vote"),
  predictionId: z.string(),
  choice: z.enum(["YES", "NO"]),
  voterAddress: z.string(),
  createdAt: z.string(),
});

export const eventCardSchema = z.object({
  type: z.literal("event"),
  id: z.string(),
  title: z.string(),
  startsAt: z.string(),
  locationOrLink: z.string().optional(),
  description: z.string().optional(),
  createdAt: z.string(),
  authorAddress: z.string(),
});

export const eventRsvpSchema = z.object({
  type: z.literal("event_rsvp"),
  eventId: z.string(),
  status: z.enum(["going", "maybe", "no"]),
  userAddress: z.string(),
  createdAt: z.string(),
});

export const paymentReceiptCardSchema = z.object({
  type: z.literal("payment_receipt"),
  chainId: z.number(),
  tokenSymbol: z.string(),
  amount: z.string(),
  to: z.string(),
  txHash: z.string(),
  note: z.string().optional(),
  createdAt: z.string(),
  authorAddress: z.string(),
});

export const announcementCardSchema = z.object({
  type: z.literal("announcement"),
  id: z.string(),
  title: z.string(),
  body: z.string(),
  priority: z.enum(["low", "med", "high"]),
  createdAt: z.string(),
  authorAddress: z.string(),
});

export const newsletterArticleSchema = z.object({
  type: z.literal("newsletter"),
  id: z.string(),
  postId: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  imageUrl: z.string().optional(),
  publishedAt: z.string().optional(),
  slug: z.string(),
  publicationSlug: z.string(),
  excerpt: z.string().optional(),
  createdAt: z.string(),
  authorAddress: z.string(),
});

export const textMessageSchema = z.object({
  type: z.literal("text"),
  content: z.string(),
  createdAt: z.string(),
  authorAddress: z.string(),
});

export const chatMessageSchema = z.discriminatedUnion("type", [
  textMessageSchema,
  tradeSignalCardSchema,
  tradeUpdateSchema,
  predictionCardSchema,
  predictionVoteSchema,
  eventCardSchema,
  eventRsvpSchema,
  paymentReceiptCardSchema,
  announcementCardSchema,
  newsletterArticleSchema,
]);

export type TradeSignalCard = z.infer<typeof tradeSignalCardSchema>;
export type TradeUpdate = z.infer<typeof tradeUpdateSchema>;
export type PredictionCard = z.infer<typeof predictionCardSchema>;
export type PredictionVote = z.infer<typeof predictionVoteSchema>;
export type EventCard = z.infer<typeof eventCardSchema>;
export type EventRsvp = z.infer<typeof eventRsvpSchema>;
export type PaymentReceiptCard = z.infer<typeof paymentReceiptCardSchema>;
export type AnnouncementCard = z.infer<typeof announcementCardSchema>;
export type NewsletterArticle = z.infer<typeof newsletterArticleSchema>;
export type TextMessage = z.infer<typeof textMessageSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const storedMessageSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  message: chatMessageSchema,
});

export type StoredMessage = z.infer<typeof storedMessageSchema>;

export const insertStoredMessageSchema = storedMessageSchema.omit({ id: true });
export type InsertStoredMessage = z.infer<typeof insertStoredMessageSchema>;

// Journal entries table
export const journalEntries = pgTable("journal_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
});

export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;

// Pinned memories table
export const pinnedMemories = pgTable("pinned_memories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull(),
  content: text("content").notNull(),
  source: text("source"), // "user_pinned" | "recurring_theme"
  sourceEntryId: text("source_entry_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPinnedMemorySchema = createInsertSchema(pinnedMemories).omit({
  id: true,
  createdAt: true,
});

export type InsertPinnedMemory = z.infer<typeof insertPinnedMemorySchema>;
export type PinnedMemory = typeof pinnedMemories.$inferSelect;

// Venice AI structured response schema
export const journalAnalysisSchema = z.object({
  summary: z.string().min(10).max(300),
  insight: z.string().min(10).max(220),
  question: z.string().min(10).max(220),
  memoryCandidates: z.array(z.string().min(6).max(140)).max(2),
});

export type JournalAnalysis = z.infer<typeof journalAnalysisSchema>;

// Journal insight card for chat display
export const journalInsightCardSchema = z.object({
  type: z.literal("journal_insight"),
  id: z.string(),
  entryId: z.string(),
  summary: z.string(),
  insight: z.string(),
  question: z.string(),
  memoryCandidates: z.array(z.string()),
  createdAt: z.string(),
  authorAddress: z.string(),
});

export type JournalInsightCard = z.infer<typeof journalInsightCardSchema>;
