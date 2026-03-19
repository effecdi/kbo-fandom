import {
  users, type UpsertUser,
  characters, generations, userCredits, trendingAccounts, bubbleProjects, payments,
  subscriptions,
  projectFolders,
  characterFolders, characterFolderItems,
  instagramConnections, instagramPublishLog,
  feedPosts, likes, follows,
  type Character, type InsertCharacter,
  type Generation, type InsertGeneration,
  type UserCredits, type TrendingAccount, type InsertTrendingAccount,
  type CreatorProfile, type BubbleProject, type InsertBubbleProject,
  type Payment, type InsertPayment,
  type Subscription, type InsertSubscription,
  type ProjectFolder, type InsertProjectFolder,
  type CharacterFolder, type InsertCharacterFolder, type CharacterFolderItem,
  type InstagramConnection, type InsertInstagramConnection,
  type InstagramPublishLog, type InsertInstagramPublishLog,
  type FeedPost, type FeedPostWithAuthor, type UserPublicProfile, type PopularCreator,
} from "@shared/schema";
import { requireDb } from "./db";
import { eq, desc, sql, and, asc, inArray, gte, isNull } from "drizzle-orm";

function isNewDayKST(lastDate: Date | null): boolean {
  if (!lastDate) return true;
  const KST_OFFSET = 9 * 60 * 60 * 1000;
  const nowKST = new Date(Date.now() + KST_OFFSET);
  const lastKST = new Date(lastDate.getTime() + KST_OFFSET);
  return nowKST.getUTCFullYear() !== lastKST.getUTCFullYear() ||
         nowKST.getUTCMonth() !== lastKST.getUTCMonth() ||
         nowKST.getUTCDate() !== lastKST.getUTCDate();
}

export interface IStorage {
  ensureUser(data: UpsertUser): Promise<void>;

  getCharacter(id: number): Promise<Character | undefined>;
  getCharactersByUser(userId: string): Promise<Character[]>;
  createCharacter(data: InsertCharacter): Promise<Character>;

  getGenerationsByUser(userId: string): Promise<Generation[]>;
  getGenerationsLight(userId: string, limit: number, offset: number, type?: string): Promise<any[]>;
  getGalleryCount(userId: string, type?: string): Promise<number>;
  getGenerationById(id: number, userId: string): Promise<Generation | undefined>;
  createGeneration(data: InsertGeneration): Promise<Generation>;

  getUserCredits(userId: string): Promise<UserCredits>;
  deductCredit(userId: string, amount?: number): Promise<boolean>;
  ensureUserCredits(userId: string): Promise<UserCredits>;
  deductBubbleUse(userId: string): Promise<boolean>;
  deductStoryUse(userId: string): Promise<boolean>;

  updateUserTier(userId: string, tier: string): Promise<UserCredits>;
  addCredits(userId: string, amount: number): Promise<UserCredits>;
  cancelPro(userId: string): Promise<UserCredits>;

  updateCreatorProfile(userId: string, profile: CreatorProfile): Promise<UserCredits>;
  incrementTotalGenerations(userId: string): Promise<void>;
  getGenerationCount(userId: string): Promise<number>;

  getTrendingAccounts(rankType: string): Promise<TrendingAccount[]>;
  getAllTrending(): Promise<{ latest: TrendingAccount[]; mostViewed: TrendingAccount[]; realtime: TrendingAccount[] }>;

  createPayment(data: InsertPayment): Promise<Payment>;
  getPaymentByImpUid(impUid: string): Promise<Payment | undefined>;
  updatePaymentStatus(id: number, status: string): Promise<Payment | undefined>;
  getPaymentsByUser(userId: string): Promise<Payment[]>;

  deleteGeneration(id: number, userId: string): Promise<boolean>;
  deleteGenerationsBulk(ids: number[], userId: string): Promise<number>;
  deleteAllGenerations(userId: string): Promise<number>;

  // Character name
  updateGenerationName(id: number, userId: string, name: string): Promise<boolean>;
  updateGenerationImage(id: number, userId: string, resultImageUrl: string, thumbnailUrl: string | null): Promise<boolean>;

  // Character Folders
  createCharacterFolder(data: InsertCharacterFolder): Promise<CharacterFolder>;
  getCharacterFoldersByUser(userId: string): Promise<(CharacterFolder & { items: { generationId: number }[] })[]>;
  updateCharacterFolder(id: number, userId: string, data: { name: string }): Promise<CharacterFolder | undefined>;
  deleteCharacterFolder(id: number, userId: string): Promise<boolean>;
  addCharacterFolderItems(folderId: number, userId: string, generationIds: number[]): Promise<number>;
  removeCharacterFolderItem(folderId: number, userId: string, generationId: number): Promise<boolean>;
  getGenerationsByFolder(folderId: number, userId: string, limit: number, offset: number): Promise<any[]>;
  getGenerationsByFolderCount(folderId: number, userId: string): Promise<number>;

  // Project Folders
  createProjectFolder(data: InsertProjectFolder): Promise<ProjectFolder>;
  getProjectFoldersByUser(userId: string): Promise<ProjectFolder[]>;
  updateProjectFolder(id: number, userId: string, data: { name?: string }): Promise<ProjectFolder | undefined>;
  deleteProjectFolder(id: number, userId: string): Promise<boolean>;
  getBubbleProjectsByFolder(folderId: number, userId: string): Promise<Omit<BubbleProject, "canvasData">[]>;

  createBubbleProject(data: InsertBubbleProject): Promise<BubbleProject>;
  getBubbleProjectsByUser(userId: string): Promise<Omit<BubbleProject, "canvasData">[]>;
  getBubbleProject(id: number, userId: string): Promise<BubbleProject | undefined>;
  updateBubbleProject(id: number, userId: string, data: Partial<Pick<BubbleProject, "name" | "thumbnailUrl" | "canvasData" | "folderId">>): Promise<BubbleProject | undefined>;
  deleteBubbleProject(id: number, userId: string): Promise<boolean>;

  // Instagram
  getInstagramConnection(userId: string): Promise<InstagramConnection | undefined>;
  upsertInstagramConnection(data: InsertInstagramConnection): Promise<InstagramConnection>;
  deleteInstagramConnection(userId: string): Promise<boolean>;
  updateInstagramToken(userId: string, token: string, expiresAt: Date): Promise<void>;
  createInstagramPublishLog(data: InsertInstagramPublishLog): Promise<InstagramPublishLog>;
  updateInstagramPublishLog(id: number, data: Partial<Pick<InstagramPublishLog, "igMediaId" | "status" | "errorMessage">>): Promise<void>;
  getInstagramPublishLogs(userId: string, limit: number): Promise<InstagramPublishLog[]>;
  getPublishCountLast24h(userId: string): Promise<number>;

  // Feed
  createFeedPost(data: { userId: string; type: string; title: string; description?: string; imageUrl: string; thumbnailUrl?: string; sourceId?: number }): Promise<FeedPost>;
  getFeedPosts(opts: { limit: number; offset: number; sort: string; viewerId?: string; followingOnly?: boolean }): Promise<{ items: FeedPostWithAuthor[]; total: number }>;
  getFeedPost(id: number, viewerId?: string): Promise<FeedPostWithAuthor | undefined>;
  deleteFeedPost(id: number, userId: string): Promise<boolean>;

  // Likes
  likePost(userId: string, postId: number): Promise<boolean>;
  unlikePost(userId: string, postId: number): Promise<boolean>;

  // Follows
  followUser(followerId: string, followingId: string): Promise<boolean>;
  unfollowUser(followerId: string, followingId: string): Promise<boolean>;

  // Profile
  getUserPublicProfile(userId: string, viewerId?: string): Promise<UserPublicProfile | undefined>;
  getUserFeedPosts(userId: string, limit: number, offset: number): Promise<{ items: FeedPostWithAuthor[]; total: number }>;

  // Popular creators
  getPopularCreators(limit: number): Promise<PopularCreator[]>;

  // Subscriptions
  createSubscription(data: InsertSubscription): Promise<Subscription>;
  getSubscription(userId: string): Promise<Subscription | undefined>;
  updateSubscription(userId: string, data: Partial<Subscription>): Promise<Subscription | undefined>;
  deleteSubscription(userId: string): Promise<boolean>;

  // Account deletion
  deleteAccount(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  private getDb() {
    return requireDb().db;
  }

  async ensureUser(data: UpsertUser): Promise<void> {
    const db = this.getDb();
    const [existing] = await db.select().from(users).where(eq(users.id, data.id!));
    if (existing) {
      await db.update(users)
        .set({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          profileImageUrl: data.profileImageUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, data.id!));
    } else {
      try {
        await db.insert(users).values(data);
      } catch (e: any) {
        // Race condition: another request already inserted this user (duplicate key)
        if (e?.code === "23505") return;
        throw e;
      }
    }
  }

  async getCharacter(id: number): Promise<Character | undefined> {
    const db = this.getDb();
    const [character] = await db.select().from(characters).where(eq(characters.id, id));
    return character || undefined;
  }

  async getCharactersByUser(userId: string): Promise<Character[]> {
    const db = this.getDb();
    return db.select().from(characters).where(eq(characters.userId, userId)).orderBy(desc(characters.createdAt));
  }

  async createCharacter(data: InsertCharacter): Promise<Character> {
    const db = this.getDb();
    const [character] = await db.insert(characters).values(data).returning();
    return character;
  }

  async getGenerationsByUser(userId: string): Promise<Generation[]> {
    const db = this.getDb();
    try {
      return await db.select().from(generations).where(eq(generations.userId, userId)).orderBy(desc(generations.createdAt));
    } catch {
      // Fallback: thumbnailUrl column might not exist yet
      const rows = await db.select({
        id: generations.id,
        userId: generations.userId,
        characterId: generations.characterId,
        type: generations.type,
        prompt: generations.prompt,
        resultImageUrl: generations.resultImageUrl,
        referenceImageUrl: generations.referenceImageUrl,
        creditsUsed: generations.creditsUsed,
        createdAt: generations.createdAt,
      }).from(generations)
        .where(eq(generations.userId, userId))
        .orderBy(desc(generations.createdAt));
      return rows.map((r: any) => ({ ...r, thumbnailUrl: null })) as Generation[];
    }
  }

  async getGenerationsLight(userId: string, limit: number, offset: number, type?: string): Promise<any[]> {
    const db = this.getDb();
    const conditions = type && type !== "all"
      ? and(eq(generations.userId, userId), eq(generations.type, type))
      : eq(generations.userId, userId);

    try {
      // Try with thumbnailUrl + characterName columns
      const rows = await db.select({
        id: generations.id,
        userId: generations.userId,
        characterId: generations.characterId,
        type: generations.type,
        prompt: generations.prompt,
        thumbnailUrl: generations.thumbnailUrl,
        characterName: generations.characterName,
        resultImageUrl: sql<string>`CASE WHEN ${generations.thumbnailUrl} IS NOT NULL THEN NULL ELSE ${generations.resultImageUrl} END`,
        creditsUsed: generations.creditsUsed,
        createdAt: generations.createdAt,
      }).from(generations)
        .where(conditions)
        .orderBy(desc(generations.createdAt))
        .limit(limit)
        .offset(offset);
      return rows;
    } catch {
      // Fallback: characterName or thumbnailUrl column doesn't exist yet
      try {
        const rows = await db.select({
          id: generations.id,
          userId: generations.userId,
          characterId: generations.characterId,
          type: generations.type,
          prompt: generations.prompt,
          thumbnailUrl: generations.thumbnailUrl,
          resultImageUrl: sql<string>`CASE WHEN ${generations.thumbnailUrl} IS NOT NULL THEN NULL ELSE ${generations.resultImageUrl} END`,
          creditsUsed: generations.creditsUsed,
          createdAt: generations.createdAt,
        }).from(generations)
          .where(conditions)
          .orderBy(desc(generations.createdAt))
          .limit(limit)
          .offset(offset);
        return rows.map((r: any) => ({ ...r, characterName: null }));
      } catch {
        const rows = await db.select({
          id: generations.id,
          userId: generations.userId,
          characterId: generations.characterId,
          type: generations.type,
          prompt: generations.prompt,
          resultImageUrl: generations.resultImageUrl,
          creditsUsed: generations.creditsUsed,
          createdAt: generations.createdAt,
        }).from(generations)
          .where(conditions)
          .orderBy(desc(generations.createdAt))
          .limit(limit)
          .offset(offset);
        return rows.map((r: any) => ({ ...r, thumbnailUrl: null, characterName: null }));
      }
    }
  }

  async getGalleryCount(userId: string, type?: string): Promise<number> {
    const db = this.getDb();
    const conditions = type && type !== "all"
      ? and(eq(generations.userId, userId), eq(generations.type, type))
      : eq(generations.userId, userId);

    const [result] = await db.select({ count: sql<number>`count(*)::int` })
      .from(generations)
      .where(conditions);
    return result?.count ?? 0;
  }

  async getGenerationById(id: number, userId: string): Promise<Generation | undefined> {
    const db = this.getDb();
    try {
      const [row] = await db.select().from(generations)
        .where(and(eq(generations.id, id), eq(generations.userId, userId)));
      return row || undefined;
    } catch {
      // Fallback: thumbnailUrl column might not exist yet
      const [row] = await db.select({
        id: generations.id,
        userId: generations.userId,
        characterId: generations.characterId,
        type: generations.type,
        prompt: generations.prompt,
        resultImageUrl: generations.resultImageUrl,
        referenceImageUrl: generations.referenceImageUrl,
        creditsUsed: generations.creditsUsed,
        createdAt: generations.createdAt,
      }).from(generations)
        .where(and(eq(generations.id, id), eq(generations.userId, userId)));
      return row ? { ...row, thumbnailUrl: null } as Generation : undefined;
    }
  }

  async createGeneration(data: InsertGeneration): Promise<Generation> {
    const db = this.getDb();
    try {
      const [generation] = await db.insert(generations).values(data).returning();
      return generation;
    } catch {
      // Fallback: thumbnailUrl column might not exist yet
      // .returning() 도 thumbnail_url을 포함하므로 컬럼을 명시적으로 지정
      const { thumbnailUrl, ...rest } = data as any;
      const [generation] = await db.insert(generations).values(rest).returning({
        id: generations.id,
        userId: generations.userId,
        characterId: generations.characterId,
        type: generations.type,
        prompt: generations.prompt,
        referenceImageUrl: generations.referenceImageUrl,
        resultImageUrl: generations.resultImageUrl,
        creditsUsed: generations.creditsUsed,
        createdAt: generations.createdAt,
      });
      return { ...generation, thumbnailUrl: null } as Generation;
    }
  }

  async ensureUserCredits(userId: string): Promise<UserCredits> {
    const db = this.getDb();

    // Try with new columns first, fallback to legacy select if columns don't exist yet
    let existing: UserCredits | undefined;
    try {
      const [row] = await db.select().from(userCredits).where(eq(userCredits.userId, userId));
      existing = row;
    } catch {
      // Fallback: new columns (daily_bonus_credits, last_daily_bonus_at) may not exist yet
      const [row] = await db.select({
        id: userCredits.id,
        userId: userCredits.userId,
        credits: userCredits.credits,
        tier: userCredits.tier,
        authorName: userCredits.authorName,
        genre: userCredits.genre,
        totalGenerations: userCredits.totalGenerations,
        bubbleUsesToday: userCredits.bubbleUsesToday,
        storyUsesToday: userCredits.storyUsesToday,
        lastResetAt: userCredits.lastResetAt,
      }).from(userCredits).where(eq(userCredits.userId, userId));
      if (row) {
        existing = { ...row, dailyBonusCredits: 0, lastDailyBonusAt: null } as UserCredits;
      }
    }

    if (existing) {
      const now = new Date();
      const lastReset = new Date(existing.lastResetAt);
      const isNewMonth = now.getUTCMonth() !== lastReset.getUTCMonth() ||
        now.getUTCFullYear() !== lastReset.getUTCFullYear();

      const updates: any = {};

      // Pro/Premium 구독 만료 체크 — proExpiresAt이 설정되어 있고 현재 시각이 지났으면 free로 전환
      try {
        if ((existing.tier === "pro" || existing.tier === "premium") && existing.proExpiresAt && new Date(existing.proExpiresAt) <= now) {
          updates.tier = "free";
          updates.credits = 30;
          updates.monthlyCreditsQuota = 30;
          updates.proExpiresAt = null;
        }
      } catch {
        // proExpiresAt column not available yet
      }

      if (isNewMonth && !updates.tier) {
        updates.bubbleUsesToday = 0;
        updates.storyUsesToday = 0;
        updates.lastResetAt = now;
        // 월 리셋: 티어별 크레딧 지급
        if (existing.tier === "premium") {
          updates.credits = 20000;
        } else if (existing.tier === "pro") {
          updates.credits = 3000;
        } else {
          updates.credits = 30;
        }
      } else if (isNewMonth) {
        updates.bubbleUsesToday = 0;
        updates.storyUsesToday = 0;
        updates.lastResetAt = now;
      }

      // Daily bonus check (KST) — free 티어만 일 보너스 지급
      try {
        if (existing.tier === "free" && isNewDayKST(existing.lastDailyBonusAt)) {
          updates.dailyBonusCredits = 5;
          updates.lastDailyBonusAt = now;
        }
      } catch {
        // daily bonus columns not available yet
      }

      if (Object.keys(updates).length > 0) {
        try {
          const [updated] = await db.update(userCredits)
            .set(updates)
            .where(eq(userCredits.userId, userId))
            .returning();
          return updated;
        } catch {
          // If update fails due to missing columns, try without daily bonus fields
          const { dailyBonusCredits, lastDailyBonusAt, ...safeUpdates } = updates;
          if (Object.keys(safeUpdates).length > 0) {
            const [updated] = await db.update(userCredits)
              .set(safeUpdates)
              .where(eq(userCredits.userId, userId))
              .returning();
            return { ...updated, dailyBonusCredits: 0, lastDailyBonusAt: null } as UserCredits;
          }
          return existing;
        }
      }
      return existing;
    }

    try {
      const [created] = await db.insert(userCredits)
        .values({ userId, credits: 30, tier: "free", monthlyCreditsQuota: 30 })
        .returning();
      return created;
    } catch {
      // Fallback: if insert fails with new default, try legacy
      const [created] = await db.insert(userCredits)
        .values({ userId, credits: 30, tier: "free" } as any)
        .returning();
      return { ...created, dailyBonusCredits: 0, lastDailyBonusAt: null } as UserCredits;
    }
  }

  async getUserCredits(userId: string): Promise<UserCredits> {
    return this.ensureUserCredits(userId);
  }

  async deductCredit(userId: string, amount: number = 1): Promise<boolean> {
    await this.ensureUserCredits(userId);

    const db = this.getDb();

    // 모든 티어가 크레딧 차감 방식으로 통일 (Pro 무제한 제거)
    // Atomic deduction: daily bonus credits first, then regular credits
    // Uses SQL-level conditions to prevent race conditions (double-spend)
    try {
      const result = await db.update(userCredits)
        .set({
          dailyBonusCredits: sql`GREATEST(0, daily_bonus_credits - LEAST(daily_bonus_credits, ${amount}))`,
          credits: sql`GREATEST(0, credits - GREATEST(0, ${amount} - daily_bonus_credits))`,
        })
        .where(
          and(
            eq(userCredits.userId, userId),
            sql`(daily_bonus_credits + credits) >= ${amount}`,
          ),
        )
        .returning();
      return result.length > 0;
    } catch {
      // daily_bonus_credits column may not exist yet, fallback to credits only
      const result = await db.update(userCredits)
        .set({
          credits: sql`credits - ${amount}`,
        })
        .where(
          and(
            eq(userCredits.userId, userId),
            sql`credits >= ${amount}`,
          ),
        )
        .returning();
      return result.length > 0;
    }
  }

  async deductBubbleUse(userId: string): Promise<boolean> {
    const credits = await this.ensureUserCredits(userId);
    // 유료 티어는 무제한
    if (credits.tier === "pro" || credits.tier === "premium") return true;

    // Atomic: only increment if under limit
    const db = this.getDb();
    const result = await db.update(userCredits)
      .set({ bubbleUsesToday: sql`bubble_uses_today + 1` })
      .where(
        and(
          eq(userCredits.userId, userId),
          sql`bubble_uses_today < 3`,
        ),
      )
      .returning();
    return result.length > 0;
  }

  async deductStoryUse(userId: string): Promise<boolean> {
    const credits = await this.ensureUserCredits(userId);
    // 유료 티어는 무제한
    if (credits.tier === "pro" || credits.tier === "premium") return true;

    // Atomic: only increment if under limit
    const db = this.getDb();
    const result = await db.update(userCredits)
      .set({ storyUsesToday: sql`story_uses_today + 1` })
      .where(
        and(
          eq(userCredits.userId, userId),
          sql`story_uses_today < 3`,
        ),
      )
      .returning();
    return result.length > 0;
  }

  async updateUserTier(userId: string, tier: string): Promise<UserCredits> {
    await this.ensureUserCredits(userId);
    const db = this.getDb();
    const updates: any = { tier };
    if (tier === "premium") {
      updates.credits = 20000;
      updates.monthlyCreditsQuota = 20000;
    } else if (tier === "pro") {
      updates.credits = 3000;
      updates.monthlyCreditsQuota = 3000;
    } else {
      updates.monthlyCreditsQuota = 30;
    }
    const [updated] = await db.update(userCredits)
      .set(updates)
      .where(eq(userCredits.userId, userId))
      .returning();
    return updated;
  }

  async addCredits(userId: string, amount: number): Promise<UserCredits> {
    await this.ensureUserCredits(userId);
    const db = this.getDb();
    // Atomic: use SQL-level addition to prevent race conditions
    const [updated] = await db.update(userCredits)
      .set({ credits: sql`credits + ${amount}` })
      .where(eq(userCredits.userId, userId))
      .returning();
    return updated;
  }

  async cancelPro(userId: string): Promise<UserCredits> {
    await this.ensureUserCredits(userId);
    const db = this.getDb();

    // 최근 Pro 결제일 조회 → 만료일 계산 (결제일 + 1개월)
    const recentPayments = await db.select()
      .from(payments)
      .where(and(eq(payments.userId, userId), eq(payments.productType, "pro"), eq(payments.status, "paid")))
      .orderBy(desc(payments.createdAt))
      .limit(1);

    let expiresAt: Date;
    if (recentPayments.length > 0) {
      expiresAt = new Date(recentPayments[0].createdAt);
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else {
      // 결제 기록이 없으면 즉시 만료 (테스트/수동 부여 등)
      expiresAt = new Date();
    }

    try {
      const [updated] = await db.update(userCredits)
        .set({ proExpiresAt: expiresAt })
        .where(eq(userCredits.userId, userId))
        .returning();
      return updated;
    } catch {
      // proExpiresAt 컬럼이 없는 경우 즉시 해지 폴백
      const [updated] = await db.update(userCredits)
        .set({ tier: "free", credits: 10 } as any)
        .where(eq(userCredits.userId, userId))
        .returning();
      return { ...updated, dailyBonusCredits: 0, lastDailyBonusAt: null } as UserCredits;
    }
  }

  async updateCreatorProfile(userId: string, profile: CreatorProfile): Promise<UserCredits> {
    await this.ensureUserCredits(userId);
    const db = this.getDb();
    const [updated] = await db.update(userCredits)
      .set({ authorName: profile.authorName, genre: profile.genre })
      .where(eq(userCredits.userId, userId))
      .returning();
    return updated;
  }

  async incrementTotalGenerations(userId: string): Promise<void> {
    await this.ensureUserCredits(userId);
    const db = this.getDb();
    await db.update(userCredits)
      .set({ totalGenerations: sql`${userCredits.totalGenerations} + 1` })
      .where(eq(userCredits.userId, userId));
  }

  async getGenerationCount(userId: string): Promise<number> {
    const credits = await this.ensureUserCredits(userId);
    return credits.totalGenerations;
  }

  async getTrendingAccounts(rankType: string): Promise<TrendingAccount[]> {
    const db = this.getDb();
    return db.select().from(trendingAccounts)
      .where(eq(trendingAccounts.rankType, rankType))
      .orderBy(asc(trendingAccounts.rank));
  }

  async getAllTrending(): Promise<{ latest: TrendingAccount[]; mostViewed: TrendingAccount[]; realtime: TrendingAccount[] }> {
    const db = this.getDb();
    const all: TrendingAccount[] = await db.select().from(trendingAccounts).orderBy(asc(trendingAccounts.rank));
    return {
      latest: all.filter((a: TrendingAccount) => a.rankType === "latest"),
      mostViewed: all.filter((a: TrendingAccount) => a.rankType === "most_viewed"),
      realtime: all.filter((a: TrendingAccount) => a.rankType === "realtime"),
    };
  }

  async createPayment(data: InsertPayment): Promise<Payment> {
    const db = this.getDb();
    const [payment] = await db.insert(payments).values(data).returning();
    return payment;
  }

  async getPaymentByImpUid(impUid: string): Promise<Payment | undefined> {
    const db = this.getDb();
    const [payment] = await db.select().from(payments).where(eq(payments.impUid, impUid));
    return payment || undefined;
  }

  async updatePaymentStatus(id: number, status: string): Promise<Payment | undefined> {
    const db = this.getDb();
    const [updated] = await db.update(payments)
      .set({ status })
      .where(eq(payments.id, id))
      .returning();
    return updated || undefined;
  }

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    const db = this.getDb();
    return db.select().from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt));
  }

  async deleteGeneration(id: number, userId: string): Promise<boolean> {
    const db = this.getDb();
    // First check if the generation exists at all, then delete with ownership check
    const [existing] = await db.select({ id: generations.id, userId: generations.userId })
      .from(generations).where(eq(generations.id, id));
    if (!existing) return false;
    // Allow deletion if the user owns it OR if userId is empty/null (legacy data)
    if (existing.userId !== userId && existing.userId) {
      return false;
    }
    await db.delete(generations).where(eq(generations.id, id));
    return true;
  }

  async deleteGenerationsBulk(ids: number[], userId: string): Promise<number> {
    if (ids.length === 0) return 0;
    const db = this.getDb();
    const result = await db.delete(generations)
      .where(and(inArray(generations.id, ids), eq(generations.userId, userId)));
    return result.rowCount ?? 0;
  }

  async deleteAllGenerations(userId: string): Promise<number> {
    const db = this.getDb();
    const result = await db.delete(generations)
      .where(eq(generations.userId, userId));
    return result.rowCount ?? 0;
  }

  // ── Character Name ──

  async updateGenerationName(id: number, userId: string, name: string): Promise<boolean> {
    const db = this.getDb();
    try {
      const result = await db.update(generations)
        .set({ characterName: name })
        .where(and(eq(generations.id, id), eq(generations.userId, userId)));
      return (result.rowCount ?? 0) > 0;
    } catch (err: any) {
      // characterName column might not exist yet — auto-create it
      if (err?.message?.includes("character_name") || err?.code === "42703") {
        try {
          await db.execute(sql`ALTER TABLE generations ADD COLUMN IF NOT EXISTS character_name text`);
          const result = await db.update(generations)
            .set({ characterName: name })
            .where(and(eq(generations.id, id), eq(generations.userId, userId)));
          return (result.rowCount ?? 0) > 0;
        } catch {
          return false;
        }
      }
      return false;
    }
  }

  async updateGenerationImage(id: number, userId: string, resultImageUrl: string, thumbnailUrl: string | null): Promise<boolean> {
    const db = this.getDb();
    try {
      const setData: any = { resultImageUrl };
      if (thumbnailUrl !== null) setData.thumbnailUrl = thumbnailUrl;
      const result = await db.update(generations)
        .set(setData)
        .where(and(eq(generations.id, id), eq(generations.userId, userId)));
      return (result.rowCount ?? 0) > 0;
    } catch {
      return false;
    }
  }

  // ── Character Folders ──

  async createCharacterFolder(data: InsertCharacterFolder): Promise<CharacterFolder> {
    const db = this.getDb();
    const [folder] = await db.insert(characterFolders).values(data).returning();
    return folder;
  }

  async getCharacterFoldersByUser(userId: string): Promise<(CharacterFolder & { items: { generationId: number; thumbnailUrl?: string | null; characterName?: string | null; prompt?: string | null }[] })[]> {
    const db = this.getDb();
    const folders = await db.select().from(characterFolders)
      .where(eq(characterFolders.userId, userId))
      .orderBy(desc(characterFolders.updatedAt));

    if (folders.length === 0) return [];

    const folderIds = folders.map(f => f.id);
    const items = await db.select({
      folderId: characterFolderItems.folderId,
      generationId: characterFolderItems.generationId,
      thumbnailUrl: generations.thumbnailUrl,
      resultImageUrl: generations.resultImageUrl,
      characterName: generations.characterName,
      prompt: generations.prompt,
    }).from(characterFolderItems)
      .leftJoin(generations, eq(characterFolderItems.generationId, generations.id))
      .where(inArray(characterFolderItems.folderId, folderIds));

    const itemsByFolder = new Map<number, { generationId: number; thumbnailUrl?: string | null; characterName?: string | null; prompt?: string | null }[]>();
    for (const item of items) {
      if (!itemsByFolder.has(item.folderId)) itemsByFolder.set(item.folderId, []);
      itemsByFolder.get(item.folderId)!.push({
        generationId: item.generationId,
        thumbnailUrl: item.thumbnailUrl || item.resultImageUrl,
        characterName: item.characterName,
        prompt: item.prompt,
      });
    }

    return folders.map(f => ({
      ...f,
      items: itemsByFolder.get(f.id) ?? [],
    }));
  }

  async updateCharacterFolder(id: number, userId: string, data: { name: string }): Promise<CharacterFolder | undefined> {
    const db = this.getDb();
    const [updated] = await db.update(characterFolders)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(characterFolders.id, id), eq(characterFolders.userId, userId)))
      .returning();
    return updated || undefined;
  }

  async deleteCharacterFolder(id: number, userId: string): Promise<boolean> {
    const db = this.getDb();
    // Items are cascade-deleted via FK
    const result = await db.delete(characterFolders)
      .where(and(eq(characterFolders.id, id), eq(characterFolders.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async addCharacterFolderItems(folderId: number, userId: string, generationIds: number[]): Promise<number> {
    const db = this.getDb();
    // Verify folder ownership
    const [folder] = await db.select({ id: characterFolders.id })
      .from(characterFolders)
      .where(and(eq(characterFolders.id, folderId), eq(characterFolders.userId, userId)));
    if (!folder) return 0;

    let added = 0;
    for (const gid of generationIds) {
      try {
        await db.insert(characterFolderItems).values({ folderId, generationId: gid });
        added++;
      } catch (e: any) {
        if (e?.code === "23505") continue; // duplicate, skip
        throw e;
      }
    }
    return added;
  }

  async removeCharacterFolderItem(folderId: number, userId: string, generationId: number): Promise<boolean> {
    const db = this.getDb();
    // Verify folder ownership
    const [folder] = await db.select({ id: characterFolders.id })
      .from(characterFolders)
      .where(and(eq(characterFolders.id, folderId), eq(characterFolders.userId, userId)));
    if (!folder) return false;

    const result = await db.delete(characterFolderItems)
      .where(and(
        eq(characterFolderItems.folderId, folderId),
        eq(characterFolderItems.generationId, generationId),
      ));
    return (result.rowCount ?? 0) > 0;
  }

  async getGenerationsByFolder(folderId: number, userId: string, limit: number, offset: number): Promise<any[]> {
    const db = this.getDb();
    try {
      const rows = await db.select({
        id: generations.id,
        userId: generations.userId,
        characterId: generations.characterId,
        type: generations.type,
        prompt: generations.prompt,
        thumbnailUrl: generations.thumbnailUrl,
        characterName: generations.characterName,
        resultImageUrl: sql<string>`CASE WHEN ${generations.thumbnailUrl} IS NOT NULL THEN NULL ELSE ${generations.resultImageUrl} END`,
        creditsUsed: generations.creditsUsed,
        createdAt: generations.createdAt,
      }).from(generations)
        .innerJoin(characterFolderItems, eq(generations.id, characterFolderItems.generationId))
        .innerJoin(characterFolders, eq(characterFolderItems.folderId, characterFolders.id))
        .where(and(
          eq(characterFolderItems.folderId, folderId),
          eq(characterFolders.userId, userId),
        ))
        .orderBy(desc(generations.createdAt))
        .limit(limit)
        .offset(offset);
      return rows;
    } catch {
      // Fallback without characterName
      try {
        const rows = await db.select({
          id: generations.id,
          userId: generations.userId,
          characterId: generations.characterId,
          type: generations.type,
          prompt: generations.prompt,
          thumbnailUrl: generations.thumbnailUrl,
          resultImageUrl: sql<string>`CASE WHEN ${generations.thumbnailUrl} IS NOT NULL THEN NULL ELSE ${generations.resultImageUrl} END`,
          creditsUsed: generations.creditsUsed,
          createdAt: generations.createdAt,
        }).from(generations)
          .innerJoin(characterFolderItems, eq(generations.id, characterFolderItems.generationId))
          .innerJoin(characterFolders, eq(characterFolderItems.folderId, characterFolders.id))
          .where(and(
            eq(characterFolderItems.folderId, folderId),
            eq(characterFolders.userId, userId),
          ))
          .orderBy(desc(generations.createdAt))
          .limit(limit)
          .offset(offset);
        return rows.map((r: any) => ({ ...r, characterName: null }));
      } catch {
        return [];
      }
    }
  }

  async getGenerationsByFolderCount(folderId: number, userId: string): Promise<number> {
    const db = this.getDb();
    const [result] = await db.select({ count: sql<number>`count(*)::int` })
      .from(characterFolderItems)
      .innerJoin(characterFolders, eq(characterFolderItems.folderId, characterFolders.id))
      .where(and(
        eq(characterFolderItems.folderId, folderId),
        eq(characterFolders.userId, userId),
      ));
    return result?.count ?? 0;
  }

  // ── Project Folders ──

  async createProjectFolder(data: InsertProjectFolder): Promise<ProjectFolder> {
    const db = this.getDb();
    const [folder] = await db.insert(projectFolders).values(data).returning();
    return folder;
  }

  async getProjectFoldersByUser(userId: string): Promise<ProjectFolder[]> {
    const db = this.getDb();
    return db.select().from(projectFolders)
      .where(eq(projectFolders.userId, userId))
      .orderBy(desc(projectFolders.updatedAt));
  }

  async updateProjectFolder(id: number, userId: string, data: { name?: string }): Promise<ProjectFolder | undefined> {
    const db = this.getDb();
    const [updated] = await db.update(projectFolders)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(projectFolders.id, id), eq(projectFolders.userId, userId)))
      .returning();
    return updated || undefined;
  }

  async deleteProjectFolder(id: number, userId: string): Promise<boolean> {
    const db = this.getDb();
    // Set folderId to null for projects in this folder (preserve projects)
    await db.update(bubbleProjects)
      .set({ folderId: null })
      .where(and(eq(bubbleProjects.folderId, id), eq(bubbleProjects.userId, userId)));
    const result = await db.delete(projectFolders)
      .where(and(eq(projectFolders.id, id), eq(projectFolders.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async getBubbleProjectsByFolder(folderId: number, userId: string): Promise<Omit<BubbleProject, "canvasData">[]> {
    const db = this.getDb();
    return db.select({
      id: bubbleProjects.id,
      userId: bubbleProjects.userId,
      name: bubbleProjects.name,
      thumbnailUrl: bubbleProjects.thumbnailUrl,
      editorType: bubbleProjects.editorType,
      folderId: bubbleProjects.folderId,
      createdAt: bubbleProjects.createdAt,
      updatedAt: bubbleProjects.updatedAt,
    }).from(bubbleProjects)
      .where(and(eq(bubbleProjects.folderId, folderId), eq(bubbleProjects.userId, userId)))
      .orderBy(asc(bubbleProjects.createdAt));
  }

  async createBubbleProject(data: InsertBubbleProject): Promise<BubbleProject> {
    const db = this.getDb();
    const [project] = await db.insert(bubbleProjects).values(data).returning();
    return project;
  }

  async getBubbleProjectsByUser(userId: string): Promise<Omit<BubbleProject, "canvasData">[]> {
    const db = this.getDb();
    return db.select({
      id: bubbleProjects.id,
      userId: bubbleProjects.userId,
      name: bubbleProjects.name,
      thumbnailUrl: bubbleProjects.thumbnailUrl,
      editorType: bubbleProjects.editorType,
      folderId: bubbleProjects.folderId,
      createdAt: bubbleProjects.createdAt,
      updatedAt: bubbleProjects.updatedAt,
    }).from(bubbleProjects)
      .where(eq(bubbleProjects.userId, userId))
      .orderBy(desc(bubbleProjects.updatedAt));
  }

  async getBubbleProject(id: number, userId: string): Promise<BubbleProject | undefined> {
    const db = this.getDb();
    const [project] = await db.select().from(bubbleProjects)
      .where(and(eq(bubbleProjects.id, id), eq(bubbleProjects.userId, userId)));
    return project || undefined;
  }

  async updateBubbleProject(id: number, userId: string, data: Partial<Pick<BubbleProject, "name" | "thumbnailUrl" | "canvasData" | "folderId">>): Promise<BubbleProject | undefined> {
    const db = this.getDb();
    const [updated] = await db.update(bubbleProjects)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(bubbleProjects.id, id), eq(bubbleProjects.userId, userId)))
      .returning();
    return updated || undefined;
  }

  async deleteBubbleProject(id: number, userId: string): Promise<boolean> {
    const db = this.getDb();
    const result = await db.delete(bubbleProjects)
      .where(and(eq(bubbleProjects.id, id), eq(bubbleProjects.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // ── Instagram ──

  async getInstagramConnection(userId: string): Promise<InstagramConnection | undefined> {
    const db = this.getDb();
    const [row] = await db.select().from(instagramConnections)
      .where(eq(instagramConnections.userId, userId));
    return row || undefined;
  }

  async upsertInstagramConnection(data: InsertInstagramConnection): Promise<InstagramConnection> {
    const db = this.getDb();
    const existing = await this.getInstagramConnection(data.userId);
    if (existing) {
      const [updated] = await db.update(instagramConnections)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(instagramConnections.userId, data.userId))
        .returning();
      return updated;
    }
    const [created] = await db.insert(instagramConnections).values(data).returning();
    return created;
  }

  async deleteInstagramConnection(userId: string): Promise<boolean> {
    const db = this.getDb();
    const result = await db.delete(instagramConnections)
      .where(eq(instagramConnections.userId, userId));
    return (result.rowCount ?? 0) > 0;
  }

  async updateInstagramToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    const db = this.getDb();
    await db.update(instagramConnections)
      .set({ accessToken: token, tokenExpiresAt: expiresAt, updatedAt: new Date() })
      .where(eq(instagramConnections.userId, userId));
  }

  async createInstagramPublishLog(data: InsertInstagramPublishLog): Promise<InstagramPublishLog> {
    const db = this.getDb();
    const [log] = await db.insert(instagramPublishLog).values(data).returning();
    return log;
  }

  async updateInstagramPublishLog(id: number, data: Partial<Pick<InstagramPublishLog, "igMediaId" | "status" | "errorMessage">>): Promise<void> {
    const db = this.getDb();
    await db.update(instagramPublishLog)
      .set(data)
      .where(eq(instagramPublishLog.id, id));
  }

  async getInstagramPublishLogs(userId: string, limit: number): Promise<InstagramPublishLog[]> {
    const db = this.getDb();
    return db.select().from(instagramPublishLog)
      .where(eq(instagramPublishLog.userId, userId))
      .orderBy(desc(instagramPublishLog.createdAt))
      .limit(limit);
  }

  async getPublishCountLast24h(userId: string): Promise<number> {
    const db = this.getDb();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [result] = await db.select({ count: sql<number>`count(*)::int` })
      .from(instagramPublishLog)
      .where(and(
        eq(instagramPublishLog.userId, userId),
        eq(instagramPublishLog.status, "published"),
        gte(instagramPublishLog.createdAt, since),
      ));
    return result?.count ?? 0;
  }

  // ── Feed ──

  async createFeedPost(data: { userId: string; type: string; title: string; description?: string; imageUrl: string; thumbnailUrl?: string; sourceId?: number }): Promise<FeedPost> {
    const db = this.getDb();
    const [post] = await db.insert(feedPosts).values({
      userId: data.userId,
      type: data.type,
      title: data.title,
      description: data.description || null,
      imageUrl: data.imageUrl,
      thumbnailUrl: data.thumbnailUrl || null,
      sourceId: data.sourceId || null,
    }).returning();
    return post;
  }

  async getFeedPosts(opts: { limit: number; offset: number; sort: string; viewerId?: string; followingOnly?: boolean }): Promise<{ items: FeedPostWithAuthor[]; total: number }> {
    const db = this.getDb();
    const { limit, offset, sort, viewerId, followingOnly } = opts;

    let whereClause = sql`1=1`;
    if (followingOnly && viewerId) {
      whereClause = sql`${feedPosts.userId} IN (SELECT ${follows.followingId} FROM ${follows} WHERE ${follows.followerId} = ${viewerId})`;
    }

    const orderBy = sort === "popular"
      ? desc(feedPosts.likeCount)
      : desc(feedPosts.createdAt);

    const rows = await db.select({
      id: feedPosts.id,
      userId: feedPosts.userId,
      type: feedPosts.type,
      title: feedPosts.title,
      description: feedPosts.description,
      imageUrl: feedPosts.imageUrl,
      thumbnailUrl: feedPosts.thumbnailUrl,
      sourceId: feedPosts.sourceId,
      likeCount: feedPosts.likeCount,
      viewCount: feedPosts.viewCount,
      createdAt: feedPosts.createdAt,
      authorName: userCredits.authorName,
      authorProfileImageUrl: users.profileImageUrl,
      authorGenre: userCredits.genre,
    })
      .from(feedPosts)
      .leftJoin(users, eq(feedPosts.userId, users.id))
      .leftJoin(userCredits, eq(feedPosts.userId, userCredits.userId))
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    const [countResult] = await db.select({ count: sql<number>`count(*)::int` })
      .from(feedPosts)
      .where(whereClause);

    // Check if viewer liked each post
    let likedPostIds = new Set<number>();
    if (viewerId && rows.length > 0) {
      const postIds = rows.map((r: any) => r.id);
      const likedRows = await db.select({ postId: likes.postId })
        .from(likes)
        .where(and(eq(likes.userId, viewerId), inArray(likes.postId, postIds)));
      likedPostIds = new Set(likedRows.map((r: any) => r.postId));
    }

    const items: FeedPostWithAuthor[] = rows.map((r: any) => ({
      ...r,
      authorName: r.authorName ?? null,
      authorProfileImageUrl: r.authorProfileImageUrl ?? null,
      authorGenre: r.authorGenre ?? null,
      isLiked: likedPostIds.has(r.id),
    }));

    return { items, total: countResult?.count ?? 0 };
  }

  async getFeedPost(id: number, viewerId?: string): Promise<FeedPostWithAuthor | undefined> {
    const db = this.getDb();
    const [row] = await db.select({
      id: feedPosts.id,
      userId: feedPosts.userId,
      type: feedPosts.type,
      title: feedPosts.title,
      description: feedPosts.description,
      imageUrl: feedPosts.imageUrl,
      thumbnailUrl: feedPosts.thumbnailUrl,
      sourceId: feedPosts.sourceId,
      likeCount: feedPosts.likeCount,
      viewCount: feedPosts.viewCount,
      createdAt: feedPosts.createdAt,
      authorName: userCredits.authorName,
      authorProfileImageUrl: users.profileImageUrl,
      authorGenre: userCredits.genre,
    })
      .from(feedPosts)
      .leftJoin(users, eq(feedPosts.userId, users.id))
      .leftJoin(userCredits, eq(feedPosts.userId, userCredits.userId))
      .where(eq(feedPosts.id, id));

    if (!row) return undefined;

    let isLiked = false;
    if (viewerId) {
      const [liked] = await db.select({ id: likes.id })
        .from(likes)
        .where(and(eq(likes.userId, viewerId), eq(likes.postId, id)));
      isLiked = !!liked;
    }

    // Increment view count
    await db.update(feedPosts)
      .set({ viewCount: sql`${feedPosts.viewCount} + 1` })
      .where(eq(feedPosts.id, id));

    return {
      ...row,
      authorName: row.authorName ?? null,
      authorProfileImageUrl: row.authorProfileImageUrl ?? null,
      authorGenre: row.authorGenre ?? null,
      isLiked,
    };
  }

  async deleteFeedPost(id: number, userId: string): Promise<boolean> {
    const db = this.getDb();
    const result = await db.delete(feedPosts)
      .where(and(eq(feedPosts.id, id), eq(feedPosts.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // ── Likes ──

  async likePost(userId: string, postId: number): Promise<boolean> {
    const db = this.getDb();
    try {
      await db.insert(likes).values({ userId, postId });
      await db.update(feedPosts)
        .set({ likeCount: sql`${feedPosts.likeCount} + 1` })
        .where(eq(feedPosts.id, postId));
      return true;
    } catch (e: any) {
      if (e?.code === "23505") return false; // Already liked
      throw e;
    }
  }

  async unlikePost(userId: string, postId: number): Promise<boolean> {
    const db = this.getDb();
    const result = await db.delete(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
    if ((result.rowCount ?? 0) > 0) {
      await db.update(feedPosts)
        .set({ likeCount: sql`GREATEST(${feedPosts.likeCount} - 1, 0)` })
        .where(eq(feedPosts.id, postId));
      return true;
    }
    return false;
  }

  // ── Follows ──

  async followUser(followerId: string, followingId: string): Promise<boolean> {
    if (followerId === followingId) return false;
    const db = this.getDb();
    try {
      await db.insert(follows).values({ followerId, followingId });
      return true;
    } catch (e: any) {
      if (e?.code === "23505") return false; // Already following
      throw e;
    }
  }

  async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    const db = this.getDb();
    const result = await db.delete(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
    return (result.rowCount ?? 0) > 0;
  }

  // ── Profile ──

  async getUserPublicProfile(userId: string, viewerId?: string): Promise<UserPublicProfile | undefined> {
    const db = this.getDb();
    const [user] = await db.select({
      id: users.id,
      firstName: users.firstName,
      profileImageUrl: users.profileImageUrl,
    }).from(users).where(eq(users.id, userId));

    if (!user) return undefined;

    const [credits] = await db.select({
      authorName: userCredits.authorName,
      genre: userCredits.genre,
    }).from(userCredits).where(eq(userCredits.userId, userId));

    const [followerResult] = await db.select({ count: sql<number>`count(*)::int` })
      .from(follows).where(eq(follows.followingId, userId));
    const [followingResult] = await db.select({ count: sql<number>`count(*)::int` })
      .from(follows).where(eq(follows.followerId, userId));
    const [postResult] = await db.select({ count: sql<number>`count(*)::int` })
      .from(feedPosts).where(eq(feedPosts.userId, userId));
    const [likesResult] = await db.select({ total: sql<number>`COALESCE(SUM(${feedPosts.likeCount}), 0)::int` })
      .from(feedPosts).where(eq(feedPosts.userId, userId));

    let isFollowing = false;
    if (viewerId && viewerId !== userId) {
      const [f] = await db.select({ id: follows.id })
        .from(follows)
        .where(and(eq(follows.followerId, viewerId), eq(follows.followingId, userId)));
      isFollowing = !!f;
    }

    return {
      id: user.id,
      firstName: user.firstName ?? null,
      profileImageUrl: user.profileImageUrl ?? null,
      authorName: credits?.authorName ?? null,
      genre: credits?.genre ?? null,
      followerCount: followerResult?.count ?? 0,
      followingCount: followingResult?.count ?? 0,
      totalLikesReceived: likesResult?.total ?? 0,
      postCount: postResult?.count ?? 0,
      isFollowing,
    };
  }

  async getUserFeedPosts(userId: string, limit: number, offset: number): Promise<{ items: FeedPostWithAuthor[]; total: number }> {
    const db = this.getDb();
    const rows = await db.select({
      id: feedPosts.id,
      userId: feedPosts.userId,
      type: feedPosts.type,
      title: feedPosts.title,
      description: feedPosts.description,
      imageUrl: feedPosts.imageUrl,
      thumbnailUrl: feedPosts.thumbnailUrl,
      sourceId: feedPosts.sourceId,
      likeCount: feedPosts.likeCount,
      viewCount: feedPosts.viewCount,
      createdAt: feedPosts.createdAt,
      authorName: userCredits.authorName,
      authorProfileImageUrl: users.profileImageUrl,
      authorGenre: userCredits.genre,
    })
      .from(feedPosts)
      .leftJoin(users, eq(feedPosts.userId, users.id))
      .leftJoin(userCredits, eq(feedPosts.userId, userCredits.userId))
      .where(eq(feedPosts.userId, userId))
      .orderBy(desc(feedPosts.createdAt))
      .limit(limit)
      .offset(offset);

    const [countResult] = await db.select({ count: sql<number>`count(*)::int` })
      .from(feedPosts)
      .where(eq(feedPosts.userId, userId));

    const items: FeedPostWithAuthor[] = rows.map((r: any) => ({
      ...r,
      authorName: r.authorName ?? null,
      authorProfileImageUrl: r.authorProfileImageUrl ?? null,
      authorGenre: r.authorGenre ?? null,
    }));

    return { items, total: countResult?.count ?? 0 };
  }

  // ── Popular Creators ──

  async getPopularCreators(limit: number): Promise<PopularCreator[]> {
    const db = this.getDb();
    const rows = await db.select({
      id: users.id,
      firstName: users.firstName,
      profileImageUrl: users.profileImageUrl,
      authorName: userCredits.authorName,
      genre: userCredits.genre,
      totalLikes: sql<number>`COALESCE(SUM(${feedPosts.likeCount}), 0)::int`,
      postCount: sql<number>`COUNT(${feedPosts.id})::int`,
    })
      .from(users)
      .innerJoin(userCredits, eq(users.id, userCredits.userId))
      .leftJoin(feedPosts, eq(users.id, feedPosts.userId))
      .groupBy(users.id, users.firstName, users.profileImageUrl, userCredits.authorName, userCredits.genre)
      .having(sql`COUNT(${feedPosts.id}) > 0 OR EXISTS (SELECT 1 FROM ${follows} WHERE ${follows.followingId} = ${users.id})`)
      .orderBy(sql`COALESCE(SUM(${feedPosts.likeCount}), 0) DESC`)
      .limit(limit);

    // Get follower counts
    const userIds = rows.map((r: any) => r.id);
    if (userIds.length === 0) return [];

    const followerCounts = await db.select({
      followingId: follows.followingId,
      count: sql<number>`count(*)::int`,
    })
      .from(follows)
      .where(inArray(follows.followingId, userIds))
      .groupBy(follows.followingId);

    const followerMap = new Map(followerCounts.map((r: any) => [r.followingId, r.count]));

    return rows.map((r: any) => ({
      id: r.id,
      firstName: r.firstName ?? null,
      profileImageUrl: r.profileImageUrl ?? null,
      authorName: r.authorName ?? null,
      genre: r.genre ?? null,
      followerCount: followerMap.get(r.id) ?? 0,
      totalLikes: r.totalLikes,
    }));
  }

  // ── Subscriptions ──

  async createSubscription(data: InsertSubscription): Promise<Subscription> {
    const db = this.getDb();
    const [sub] = await db.insert(subscriptions).values(data).returning();
    return sub;
  }

  async getSubscription(userId: string): Promise<Subscription | undefined> {
    const db = this.getDb();
    try {
      const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
      return sub || undefined;
    } catch {
      return undefined;
    }
  }

  async updateSubscription(userId: string, data: Partial<Subscription>): Promise<Subscription | undefined> {
    const db = this.getDb();
    const [updated] = await db.update(subscriptions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subscriptions.userId, userId))
      .returning();
    return updated || undefined;
  }

  async deleteSubscription(userId: string): Promise<boolean> {
    const db = this.getDb();
    const result = await db.delete(subscriptions).where(eq(subscriptions.userId, userId));
    return (result.rowCount ?? 0) > 0;
  }

  // ── Account Deletion ──

  async deleteAccount(userId: string): Promise<void> {
    const db = this.getDb();

    // FK 의존 순서에 따라 삭제 (자식 → 부모)
    // 1. likes (userId 기준 + 유저 게시물에 달린 좋아요)
    const userPostIds = await db.select({ id: feedPosts.id })
      .from(feedPosts).where(eq(feedPosts.userId, userId));
    if (userPostIds.length > 0) {
      await db.delete(likes)
        .where(inArray(likes.postId, userPostIds.map(p => p.id)));
    }
    await db.delete(likes).where(eq(likes.userId, userId));

    // 2. follows (팔로워/팔로잉 양쪽)
    await db.delete(follows).where(eq(follows.followerId, userId));
    await db.delete(follows).where(eq(follows.followingId, userId));

    // 3. feed posts
    await db.delete(feedPosts).where(eq(feedPosts.userId, userId));

    // 4. instagram
    await db.delete(instagramPublishLog).where(eq(instagramPublishLog.userId, userId));
    await db.delete(instagramConnections).where(eq(instagramConnections.userId, userId));

    // 5. bubble projects & project folders & character folders
    await db.delete(bubbleProjects).where(eq(bubbleProjects.userId, userId));
    await db.delete(projectFolders).where(eq(projectFolders.userId, userId));
    try {
      await db.delete(characterFolders).where(eq(characterFolders.userId, userId));
    } catch { /* table may not exist yet */ }

    // 6. generations → characters (generations가 characters FK 참조)
    await db.delete(generations).where(eq(generations.userId, userId));
    await db.delete(characters).where(eq(characters.userId, userId));

    // 7. payments — 전자상거래법 5년 보관 의무로 삭제하지 않음

    // 7.5. subscriptions
    try {
      await db.delete(subscriptions).where(eq(subscriptions.userId, userId));
    } catch { /* table may not exist yet */ }

    // 8. user credits
    await db.delete(userCredits).where(eq(userCredits.userId, userId));

    // 9. users 테이블 — 개인정보 익명화 (결제 기록 FK 유지를 위해 행은 보존)
    await db.update(users)
      .set({
        email: null,
        firstName: null,
        lastName: null,
        profileImageUrl: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }
}

export const storage = new DatabaseStorage();
