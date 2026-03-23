import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, serial, uniqueIndex, foreignKey, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./auth";

export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  prompt: text("prompt").notNull(),
  style: text("style").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const generations = pgTable("generations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  characterId: integer("character_id").references(() => characters.id),
  type: text("type").notNull(),
  source: text("source").default("creator"), // "creator" | "business"
  prompt: text("prompt").notNull(),
  referenceImageUrl: text("reference_image_url"),
  resultImageUrl: text("result_image_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  characterName: text("character_name"),
  creditsUsed: integer("credits_used").notNull().default(1),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const userCredits = pgTable("user_credits", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  credits: integer("credits").notNull().default(50),
  tier: text("tier").notNull().default("free"), // "free" | "pro" | "premium"
  monthlyCreditsQuota: integer("monthly_credits_quota").notNull().default(30),
  authorName: text("author_name"),
  genre: text("genre"),
  totalGenerations: integer("total_generations").notNull().default(0),
  bubbleUsesToday: integer("bubble_uses_today").notNull().default(0),
  storyUsesToday: integer("story_uses_today").notNull().default(0),
  dailyBonusCredits: integer("daily_bonus_credits").notNull().default(0),
  lastDailyBonusAt: timestamp("last_daily_bonus_at"),
  lastResetAt: timestamp("last_reset_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  proExpiresAt: timestamp("pro_expires_at"),
});

// ── Subscriptions ──

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  plan: text("plan").notNull(), // "pro" | "premium"
  billingCycle: text("billing_cycle").notNull(), // "monthly" | "yearly"
  billingKey: text("billing_key").notNull(),
  pgProvider: text("pg_provider").notNull().default("tosspayments"),
  status: text("status").notNull().default("active"), // "active" | "cancelled" | "past_due" | "expired"
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  nextPaymentAt: timestamp("next_payment_at"),
  cancelledAt: timestamp("cancelled_at"),
  cancelReason: text("cancel_reason"),
  portoneScheduleId: text("portone_schedule_id"),
  retryCount: integer("retry_count").notNull().default(0),
  lastRetryAt: timestamp("last_retry_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  impUid: text("imp_uid").notNull(),
  merchantUid: text("merchant_uid").notNull(),
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("pending"),
  productType: text("product_type").notNull(),
  creditsAdded: integer("credits_added").notNull().default(0),
  subscriptionId: integer("subscription_id"),
  billingCycle: text("billing_cycle"), // "monthly" | "yearly"
  currency: text("currency").notNull().default("KRW"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const trendingAccounts = pgTable("trending_accounts", {
  id: serial("id").primaryKey(),
  rankType: text("rank_type").notNull(),
  rank: integer("rank").notNull(),
  handle: varchar("handle", { length: 100 }).notNull(),
  displayName: varchar("display_name", { length: 200 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  followers: integer("followers").notNull().default(0),
  avgViews: integer("avg_views").notNull().default(0),
  profileImageUrl: text("profile_image_url"),
  description: text("description"),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertTrendingAccountSchema = createInsertSchema(trendingAccounts).omit({
  id: true,
  updatedAt: true,
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
  createdAt: true,
});

export const insertGenerationSchema = createInsertSchema(generations).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const generateCharacterSchema = z.object({
  prompt: z.string().min(1, "프롬프트 또는 이미지를 입력해주세요"),
  style: z.enum(["simple-line", "cute-animal", "doodle", "minimal", "scribble", "ink-sketch"]),
  sourceImageData: z.string().optional(),
});

export const generatePoseSchema = z.object({
  characterIds: z.array(z.number()).min(1).max(4),
  prompt: z.string().min(3, "Pose description must be at least 3 characters"),
  referenceImageData: z.string().optional(),
});

export const generateBackgroundSchema = z.object({
  sourceImageDataList: z.array(z.string().min(1)).max(4).optional(),
  backgroundPrompt: z.string().min(3, "Background description must be at least 3 characters"),
  itemsPrompt: z.string().optional(),
  characterIds: z.array(z.number()).optional(),
  noBackground: z.boolean().optional(),
  aspectRatio: z.string().optional(),
});

export const removeBackgroundSchema = z.object({
  sourceImageData: z.string().min(1, "Source image is required"),
});

export const adMatchSchema = z.object({
  genre: z.string().min(1, "Genre is required"),
  followers: z.string().min(1, "Follower count is required"),
  ageGroup: z.string().min(1, "Age group is required"),
  contentStyle: z.string().min(1, "Content style is required"),
  postFrequency: z.string().min(1, "Posting frequency is required"),
  engagement: z.string().min(1, "Engagement rate is required"),
});

export const creatorProfileSchema = z.object({
  authorName: z.string().min(1, "Author name is required").max(30),
  genre: z.enum(["daily", "gag", "romance", "fantasy"]),
});

export const storyScriptSchema = z.object({
  topic: z.string().min(2, "주제를 2글자 이상 입력해주세요"),
  panelCount: z.number().min(1).max(10),
  posePrompt: z.string().optional(),
  expressionPrompt: z.string().optional(),
  itemPrompt: z.string().optional(),
  backgroundPrompt: z.string().optional(),
  characterNames: z.array(z.string()).optional(),
});

export const topicSuggestSchema = z.object({
  genre: z.string().optional(),
});

export type StoryScriptRequest = z.infer<typeof storyScriptSchema>;
export type TopicSuggestRequest = z.infer<typeof topicSuggestSchema>;

export interface StoryBubbleScript {
  text: string;
  style?: "handwritten" | "linedrawing" | "wobbly";
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
}

export interface StoryPanelScript {
  top: string;
  bottom: string;
  bubbles: StoryBubbleScript[];
}

export interface StoryScriptResponse {
  panels: StoryPanelScript[];
}

export type CreatorProfile = z.infer<typeof creatorProfileSchema>;

// ── Character Folders ──

export const characterFolders = pgTable("character_folders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const characterFolderItems = pgTable("character_folder_items", {
  id: serial("id").primaryKey(),
  folderId: integer("folder_id").notNull().references(() => characterFolders.id, { onDelete: "cascade" }),
  generationId: integer("generation_id").notNull().references(() => generations.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  uniqueFolderItem: uniqueIndex("unique_folder_item").on(table.folderId, table.generationId),
}));

export const insertCharacterFolderSchema = createInsertSchema(characterFolders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const projectFolders = pgTable("project_folders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const bubbleProjects = pgTable("bubble_projects", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  canvasData: text("canvas_data").notNull(),
  editorType: text("editor_type").notNull().default("bubble"),
  folderId: integer("folder_id").references(() => projectFolders.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertProjectFolderSchema = createInsertSchema(projectFolders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateProjectFolderSchema = z.object({
  name: z.string().min(1).optional(),
});

export const insertBubbleProjectSchema = createInsertSchema(bubbleProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateBubbleProjectSchema = z.object({
  name: z.string().min(1).optional(),
  thumbnailUrl: z.string().optional(),
  canvasData: z.string().optional(),
  folderId: z.number().int().positive().nullable().optional(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;
export type CharacterFolder = typeof characterFolders.$inferSelect;
export type InsertCharacterFolder = z.infer<typeof insertCharacterFolderSchema>;
export type CharacterFolderItem = typeof characterFolderItems.$inferSelect;
export type ProjectFolder = typeof projectFolders.$inferSelect;
export type InsertProjectFolder = z.infer<typeof insertProjectFolderSchema>;
export type BubbleProject = typeof bubbleProjects.$inferSelect;
export type InsertBubbleProject = z.infer<typeof insertBubbleProjectSchema>;

export type Character = typeof characters.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Generation = typeof generations.$inferSelect;
export type GenerationLight = Omit<Generation, "referenceImageUrl"> & {
  resultImageUrl: string | null;
  referenceImageUrl?: undefined;
  characterName?: string | null;
};
export type InsertGeneration = z.infer<typeof insertGenerationSchema>;
export type UserCredits = typeof userCredits.$inferSelect;
export type TrendingAccount = typeof trendingAccounts.$inferSelect;
export type InsertTrendingAccount = z.infer<typeof insertTrendingAccountSchema>;

// Instagram 계정 연결
export const instagramConnections = pgTable("instagram_connections", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  igUserId: varchar("ig_user_id").notNull(),
  igUsername: varchar("ig_username"),
  fbPageId: varchar("fb_page_id").notNull(),
  accessToken: text("access_token").notNull(),
  tokenExpiresAt: timestamp("token_expires_at").notNull(),
  connectedAt: timestamp("connected_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Instagram 게시 이력
export const instagramPublishLog = pgTable("instagram_publish_log", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  igMediaId: varchar("ig_media_id"),
  publishType: text("publish_type").notNull(),
  imageCount: integer("image_count").notNull().default(1),
  caption: text("caption"),
  status: text("status").notNull().default("pending"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertInstagramConnectionSchema = createInsertSchema(instagramConnections).omit({
  id: true,
  connectedAt: true,
  updatedAt: true,
});

export const insertInstagramPublishLogSchema = createInsertSchema(instagramPublishLog).omit({
  id: true,
  createdAt: true,
});

export const instagramPublishSchema = z.object({
  publishType: z.enum(["feed", "carousel", "story"]),
  images: z.array(z.string().min(1)).min(1).max(10),
  caption: z.string().max(2200).optional(),
});

export type InstagramConnection = typeof instagramConnections.$inferSelect;
export type InsertInstagramConnection = z.infer<typeof insertInstagramConnectionSchema>;
export type InstagramPublishLog = typeof instagramPublishLog.$inferSelect;
export type InsertInstagramPublishLog = z.infer<typeof insertInstagramPublishLogSchema>;

// ── Social Feed System ──

export const feedPosts = pgTable("feed_posts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // "image" | "project"
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  sourceId: integer("source_id"),
  likeCount: integer("like_count").notNull().default(0),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  postId: integer("post_id").notNull().references(() => feedPosts.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  uniqueLike: uniqueIndex("unique_like").on(table.userId, table.postId),
}));

export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: varchar("follower_id").notNull().references(() => users.id),
  followingId: varchar("following_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  uniqueFollow: uniqueIndex("unique_follow").on(table.followerId, table.followingId),
}));

export const publishToFeedSchema = z.object({
  type: z.enum(["image", "project"]),
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  sourceId: z.number().int().positive(),
});

export type FeedPost = typeof feedPosts.$inferSelect;
export type InsertFeedPost = typeof feedPosts.$inferInsert;
export type Like = typeof likes.$inferSelect;
export type Follow = typeof follows.$inferSelect;

export interface FeedPostWithAuthor extends FeedPost {
  authorName: string | null;
  authorProfileImageUrl: string | null;
  authorGenre: string | null;
  isLiked?: boolean;
}

export interface UserPublicProfile {
  id: string;
  firstName: string | null;
  profileImageUrl: string | null;
  authorName: string | null;
  genre: string | null;
  followerCount: number;
  followingCount: number;
  totalLikesReceived: number;
  postCount: number;
  isFollowing?: boolean;
}

export interface PopularCreator {
  id: string;
  firstName: string | null;
  profileImageUrl: string | null;
  authorName: string | null;
  genre: string | null;
  followerCount: number;
  totalLikes: number;
}
