import {
  users, type UpsertUser,
  characters, generations, userCredits, trendingAccounts, bubbleProjects, payments,
  instagramConnections, instagramPublishLog,
  type Character, type InsertCharacter,
  type Generation, type InsertGeneration,
  type UserCredits, type TrendingAccount, type InsertTrendingAccount,
  type CreatorProfile, type BubbleProject, type InsertBubbleProject,
  type Payment, type InsertPayment,
  type InstagramConnection, type InsertInstagramConnection,
  type InstagramPublishLog, type InsertInstagramPublishLog,
} from "@shared/schema";
import { requireDb } from "./db";
import { eq, desc, sql, and, asc, inArray, gte } from "drizzle-orm";

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
  deductCredit(userId: string): Promise<boolean>;
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

  createBubbleProject(data: InsertBubbleProject): Promise<BubbleProject>;
  getBubbleProjectsByUser(userId: string): Promise<BubbleProject[]>;
  getBubbleProject(id: number, userId: string): Promise<BubbleProject | undefined>;
  updateBubbleProject(id: number, userId: string, data: Partial<Pick<BubbleProject, "name" | "thumbnailUrl" | "canvasData">>): Promise<BubbleProject | undefined>;
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
      // Try with thumbnailUrl column (after migration)
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
      return rows;
    } catch {
      // Fallback: thumbnailUrl column doesn't exist yet
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
      return rows.map((r: any) => ({ ...r, thumbnailUrl: null }));
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

      if (isNewMonth) {
        updates.bubbleUsesToday = 0;
        updates.storyUsesToday = 0;
        updates.lastResetAt = now;
        if (existing.tier === "pro") {
          updates.credits = 200;
        } else {
          updates.credits = 10;
        }
      }

      // Daily bonus check (KST) — only if column exists
      try {
        if (isNewDayKST(existing.lastDailyBonusAt)) {
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
        .values({ userId, credits: 20, tier: "free" })
        .returning();
      return created;
    } catch {
      // Fallback: if insert fails with new default, try legacy
      const [created] = await db.insert(userCredits)
        .values({ userId, credits: 20, tier: "free" } as any)
        .returning();
      return { ...created, dailyBonusCredits: 0, lastDailyBonusAt: null } as UserCredits;
    }
  }

  async getUserCredits(userId: string): Promise<UserCredits> {
    return this.ensureUserCredits(userId);
  }

  async deductCredit(userId: string): Promise<boolean> {
    const credits = await this.ensureUserCredits(userId);

    const db = this.getDb();
    // Deduct daily bonus credits first, then regular credits
    if (credits.dailyBonusCredits > 0) {
      try {
        await db.update(userCredits)
          .set({ dailyBonusCredits: credits.dailyBonusCredits - 1 })
          .where(eq(userCredits.userId, userId));
        return true;
      } catch {
        // daily_bonus_credits column may not exist yet, fall through to regular credits
      }
    }
    if (credits.credits > 0) {
      await db.update(userCredits)
        .set({ credits: credits.credits - 1 })
        .where(eq(userCredits.userId, userId));
      return true;
    }
    return false;
  }

  async deductBubbleUse(userId: string): Promise<boolean> {
    const credits = await this.ensureUserCredits(userId);
    if (credits.tier === "pro") return true;
    if (credits.bubbleUsesToday >= 3) return false;
    const db = this.getDb();
    await db.update(userCredits)
      .set({ bubbleUsesToday: credits.bubbleUsesToday + 1 })
      .where(eq(userCredits.userId, userId));
    return true;
  }

  async deductStoryUse(userId: string): Promise<boolean> {
    const credits = await this.ensureUserCredits(userId);
    if (credits.tier === "pro") return true;
    if (credits.storyUsesToday >= 3) return false;
    const db = this.getDb();
    await db.update(userCredits)
      .set({ storyUsesToday: credits.storyUsesToday + 1 })
      .where(eq(userCredits.userId, userId));
    return true;
  }

  async updateUserTier(userId: string, tier: string): Promise<UserCredits> {
    await this.ensureUserCredits(userId);
    const db = this.getDb();
    const updates: any = { tier };
    if (tier === "pro") {
      updates.credits = 200;
    }
    const [updated] = await db.update(userCredits)
      .set(updates)
      .where(eq(userCredits.userId, userId))
      .returning();
    return updated;
  }

  async addCredits(userId: string, amount: number): Promise<UserCredits> {
    const credits = await this.ensureUserCredits(userId);
    const db = this.getDb();
    const [updated] = await db.update(userCredits)
      .set({ credits: credits.credits + amount })
      .where(eq(userCredits.userId, userId))
      .returning();
    return updated;
  }

  async cancelPro(userId: string): Promise<UserCredits> {
    await this.ensureUserCredits(userId);
    const db = this.getDb();
    try {
      const [updated] = await db.update(userCredits)
        .set({ tier: "free", credits: 10 })
        .where(eq(userCredits.userId, userId))
        .returning();
      return updated;
    } catch {
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

  async createBubbleProject(data: InsertBubbleProject): Promise<BubbleProject> {
    const db = this.getDb();
    const [project] = await db.insert(bubbleProjects).values(data).returning();
    return project;
  }

  async getBubbleProjectsByUser(userId: string): Promise<BubbleProject[]> {
    const db = this.getDb();
    return db.select().from(bubbleProjects)
      .where(eq(bubbleProjects.userId, userId))
      .orderBy(desc(bubbleProjects.updatedAt));
  }

  async getBubbleProject(id: number, userId: string): Promise<BubbleProject | undefined> {
    const db = this.getDb();
    const [project] = await db.select().from(bubbleProjects)
      .where(and(eq(bubbleProjects.id, id), eq(bubbleProjects.userId, userId)));
    return project || undefined;
  }

  async updateBubbleProject(id: number, userId: string, data: Partial<Pick<BubbleProject, "name" | "thumbnailUrl" | "canvasData">>): Promise<BubbleProject | undefined> {
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
}

export const storage = new DatabaseStorage();
