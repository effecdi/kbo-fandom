import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated, type AuthRequest } from "./authMiddleware";
import { generateCharacterImage, generatePoseImage, generateWithBackground, generateWebtoonScene, removeWhiteBackground, generateThumbnail } from "./imageGen";
import { generateAIPrompt, analyzeAdMatch, enhanceBio, generateStoryScripts, suggestStoryTopics, generateWebtoonSceneBreakdown } from "./aiText";
import { generateCharacterSchema, generatePoseSchema, generateBackgroundSchema, removeBackgroundSchema, adMatchSchema, creatorProfileSchema, storyScriptSchema, topicSuggestSchema, updateBubbleProjectSchema, instagramPublishSchema } from "@shared/schema";
import axios from "axios";
import { config } from "./config";
import {
  getOAuthUrl, exchangeCodeForToken, getInstagramBusinessAccount,
  refreshLongLivedToken, encryptToken, decryptToken,
  uploadImageToStorage, publishSingleImage, publishCarousel, publishStory,
} from "./instagramService";

// Product prices (must match client-side pricing)
const PRODUCT_PRICES = {
  pro: 19900,
  credits: 4900,
} as const;

async function getPortoneAccessToken(): Promise<string> {
  const response = await axios.post("https://api.iamport.kr/users/getToken", {
    imp_key: config.portoneApiKey,
    imp_secret: config.portoneApiSecret,
  });
  return response.data.response.access_token;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/auth/user", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const user = req.supabaseUser;
      
      const email = user.email || null;
      const firstName = user.user_metadata?.full_name?.split(" ")[0] || user.user_metadata?.name || null;
      const lastName = user.user_metadata?.full_name?.split(" ").slice(1).join(" ") || null;
      const profileImageUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

      // 🔥 핵심 추가: 로그인 통과한 유저를 내 DB의 users 테이블에도 확실히 저장해줌!
      await storage.ensureUser({
        id: userId,
        email,
        firstName,
        lastName,
        profileImageUrl,
      });

      res.json({
        id: userId,
        email,
        firstName,
        lastName,
        profileImageUrl,
      });
    } catch (error) {
      console.error("User sync error:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/generate-character", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const parsed = generateCharacterSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });
      }
      const { prompt, style, sourceImageData } = parsed.data;

      const FREE_STYLES = ["simple-line", "minimal", "doodle"];
      const credits = await storage.getUserCredits(userId);
      if (credits.tier !== "pro" && !FREE_STYLES.includes(style)) {
        return res.status(403).json({ message: "이 스타일은 Pro 멤버십 전용입니다. 심플 라인, 미니멀, 낙서풍 스타일은 무료로 사용 가능합니다." });
      }

      const canGenerate = await storage.deductCredit(userId);
      if (!canGenerate) {
        return res.status(403).json({ message: "이번 달의 무료 생성 횟수를 모두 사용했습니다. 다음 달에 다시 시도해주세요." });
      }

      const imageDataUrl = await generateCharacterImage(prompt, style, sourceImageData);

      const character = await storage.createCharacter({
        userId,
        prompt,
        style,
        imageUrl: imageDataUrl,
      });

      try {
        const thumbnailUrl = await generateThumbnail(imageDataUrl);
        await storage.createGeneration({
          userId,
          characterId: character.id,
          type: "character",
          prompt,
          resultImageUrl: imageDataUrl,
          thumbnailUrl: thumbnailUrl || null,
          creditsUsed: 1,
        });
        await storage.incrementTotalGenerations(userId);
      } catch (dbError: any) {
        console.error("Character generation DB save failed (image still returned):", dbError?.message);
      }

      res.json({ characterId: character.id, imageUrl: imageDataUrl });
    } catch (error: any) {
      console.error("Character generation error:", error);
      res.status(500).json({ message: error.message || "Failed to generate character" });
    }
  });

  app.post("/api/generate-pose", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const parsed = generatePoseSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });
      }
      const { characterIds, prompt, referenceImageData } = parsed.data;

      // 모든 캐릭터 조회 및 소유권 검증
      const characters = [];
      for (const cid of characterIds) {
        const character = await storage.getCharacter(cid);
        if (!character) {
          return res.status(404).json({ message: `Character ${cid} not found` });
        }
        if (character.userId !== userId) {
          return res.status(403).json({ message: "Access denied" });
        }
        characters.push(character);
      }

      const canGenerate = await storage.deductCredit(userId);
      if (!canGenerate) {
        return res.status(403).json({ message: "이번 달의 무료 생성 횟수를 모두 사용했습니다. 다음 달에 다시 시도해주세요." });
      }

      const imageDataUrl = await generatePoseImage(characters, prompt, referenceImageData);

      try {
        const thumbnailUrl = await generateThumbnail(imageDataUrl);
        await storage.createGeneration({
          userId,
          characterId: characterIds[0],
          type: "pose",
          prompt,
          referenceImageUrl: referenceImageData || null,
          resultImageUrl: imageDataUrl,
          thumbnailUrl: thumbnailUrl || null,
          creditsUsed: 1,
        });
        await storage.incrementTotalGenerations(userId);
      } catch (dbError: any) {
        console.error("Pose generation DB save failed (image still returned):", dbError?.message);
      }

      res.json({ imageUrl: imageDataUrl });
    } catch (error: any) {
      console.error("Pose generation error:", error);
      res.status(500).json({ message: error.message || "Failed to generate pose" });
    }
  });

  app.post("/api/generate-background", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const parsed = generateBackgroundSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });
      }
      const { sourceImageDataList, backgroundPrompt, itemsPrompt, characterIds } = parsed.data;

      // 모든 캐릭터 소유권 검증
      if (characterIds && characterIds.length > 0) {
        for (const cid of characterIds) {
          const character = await storage.getCharacter(cid);
          if (!character) {
            return res.status(404).json({ message: `Character ${cid} not found` });
          }
          if (character.userId !== userId) {
            return res.status(403).json({ message: "Access denied" });
          }
        }
      }

      const canGenerate = await storage.deductCredit(userId);
      if (!canGenerate) {
        return res.status(403).json({ message: "이번 달의 무료 생성 횟수를 모두 사용했습니다. 다음 달에 다시 시도해주세요." });
      }

      const imageDataUrl = await generateWithBackground(sourceImageDataList, backgroundPrompt, itemsPrompt);

      // 이미지 생성 성공 — DB 저장은 비차단으로 처리 (thumbnail_url 컬럼 미존재 등에 대비)
      const fullPrompt = itemsPrompt
        ? `Background: ${backgroundPrompt}, Items: ${itemsPrompt}`
        : `Background: ${backgroundPrompt}`;

      try {
        const thumbnailUrl = await generateThumbnail(imageDataUrl);
        await storage.createGeneration({
          userId,
          characterId: characterIds?.[0] || null,
          type: "background",
          prompt: fullPrompt,
          referenceImageUrl: null,
          resultImageUrl: imageDataUrl,
          thumbnailUrl: thumbnailUrl || null,
          creditsUsed: 1,
        });
        await storage.incrementTotalGenerations(userId);
      } catch (dbError: any) {
        console.error("Background generation DB save failed (image still returned):", dbError?.message);
      }

      res.json({ imageUrl: imageDataUrl });
    } catch (error: any) {
      console.error("Background generation error:", error);
      res.status(500).json({ message: error.message || "Failed to generate background" });
    }
  });

  app.post("/api/remove-background", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const parsed = removeBackgroundSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });
      }
      const { sourceImageData } = parsed.data;

      const credits = await storage.getUserCredits(userId);
      if (credits.tier !== "pro") {
        return res.status(403).json({ message: "배경 제거는 Pro 멤버십 전용 기능입니다." });
      }

      const imageDataUrl = await removeWhiteBackground(sourceImageData);

      res.json({ imageUrl: imageDataUrl });
    } catch (error: any) {
      console.error("Remove background error:", error);
      res.status(500).json({ message: error.message || "Failed to remove background" });
    }
  });

  app.post("/api/ad-match", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const credits = await storage.getUserCredits(userId);
      if (credits.tier !== "pro") {
        return res.status(403).json({ message: "Pro membership required to use Advertiser Matching AI" });
      }

      const parsed = adMatchSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });
      }

      const result = await analyzeAdMatch(parsed.data);
      res.json(result);
    } catch (error: any) {
      console.error("Ad match error:", error);
      res.status(500).json({ message: error.message || "Failed to analyze ad match" });
    }
  });

  app.post("/api/ai-prompt", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const { type, context } = req.body;
      if (!type || !["character", "pose", "background"].includes(type)) {
        return res.status(400).json({ message: "Invalid type" });
      }
      const result = await generateAIPrompt(type, context);
      res.json({ prompt: result });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to generate AI prompt" });
    }
  });

  app.post("/api/enhance-bio", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const { bio, profileName, category, followers, engagement } = req.body;
      if (!bio || typeof bio !== "string" || bio.trim().length < 3) {
        return res.status(400).json({ message: "Please write at least a short description to enhance." });
      }
      const enhanced = await enhanceBio({ bio, profileName, category, followers, engagement });
      res.json({ enhancedBio: enhanced });
    } catch (error: any) {
      console.error("Bio enhance error:", error);
      res.status(500).json({ message: error.message || "Failed to enhance bio" });
    }
  });

  app.get("/api/characters", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const chars = await storage.getCharactersByUser(userId);
      res.json(chars);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch characters" });
    }
  });

  app.get("/api/characters/:id", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid character ID" });
      }
      const character = await storage.getCharacter(id);
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }
      if (character.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(character);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch character" });
    }
  });

  app.get("/api/gallery", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const isPaginated = req.query.limit !== undefined;

      if (isPaginated) {
        // New paginated format: { items, total, hasMore }
        const limit = Math.min(Math.max(parseInt(String(req.query.limit)) || 24, 1), 100);
        const offset = Math.max(parseInt(String(req.query.offset)) || 0, 0);
        const type = (req.query.type as string) || "all";

        const [items, total] = await Promise.all([
          storage.getGenerationsLight(userId, limit, offset, type),
          storage.getGalleryCount(userId, type),
        ]);

        res.json({
          items,
          total,
          hasMore: offset + items.length < total,
        });
      } else {
        // Legacy format: plain array (used by pose, background, bubble, etc.)
        const items = await storage.getGenerationsByUser(userId);
        res.json(items);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gallery" });
    }
  });

  app.get("/api/gallery/:id", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) return res.status(400).json({ message: "잘못된 ID입니다." });
      const gen = await storage.getGenerationById(id, userId);
      if (!gen) return res.status(404).json({ message: "항목을 찾을 수 없습니다." });
      res.json(gen);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gallery item" });
    }
  });

  app.get("/api/usage", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const credits = await storage.getUserCredits(userId);
      const isPro = credits.tier === "pro";
      const creatorTier = isPro ? 3 : 0;
      const tierPanelLimits = [3, 5, 8, 14];
      res.json({
        credits: credits.credits,
        dailyBonusCredits: credits.dailyBonusCredits ?? 0,
        tier: credits.tier,
        authorName: credits.authorName,
        genre: credits.genre,
        totalGenerations: credits.totalGenerations,
        dailyFreeCredits: isPro ? -1 : 30,
        bubbleUsesToday: credits.bubbleUsesToday,
        storyUsesToday: credits.storyUsesToday,
        maxBubbleUses: isPro ? -1 : 3,
        maxStoryUses: isPro ? -1 : 3,
        maxStoryPanels: tierPanelLimits[creatorTier] ?? 3,
        creatorTier,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch usage" });
    }
  });

  app.post("/api/creator-profile", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const parsed = creatorProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });
      }
      const updated = await storage.updateCreatorProfile(userId, parsed.data);
      res.json({ authorName: updated.authorName, genre: updated.genre });
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get("/api/trending", async (_req, res) => {
    try {
      const data = await storage.getAllTrending();
      res.json(data);
    } catch (error: any) {
      console.error("Trending fetch error:", error);
      res.json({
        latest: [],
        mostViewed: [],
        realtime: [],
      });
    }
  });

  app.post("/api/payment/complete", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { imp_uid, merchant_uid, product_type } = req.body;

      if (!imp_uid || !merchant_uid) {
        return res.status(400).json({ message: "imp_uid와 merchant_uid가 필요합니다." });
      }

      const existingPayment = await storage.getPaymentByImpUid(imp_uid);
      if (existingPayment) {
        return res.status(409).json({ message: "이미 처리된 결제입니다." });
      }

      const accessToken = await getPortoneAccessToken();
      const paymentResponse = await axios.get(`https://api.iamport.kr/payments/${imp_uid}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const paymentData = paymentResponse.data.response;
      if (paymentData.status !== "paid") {
        return res.status(400).json({ message: "결제가 완료되지 않았습니다." });
      }

      const amount = paymentData.amount;
      let resolvedProductType = (product_type || "credits") as keyof typeof PRODUCT_PRICES;

      // 금액 검증: 실제 결제 금액과 상품 가격이 일치하는지 확인
      const expectedAmount = PRODUCT_PRICES[resolvedProductType];
      if (!expectedAmount) {
        return res.status(400).json({ message: "유효하지 않은 상품 타입입니다." });
      }

      if (amount !== expectedAmount) {
        console.error(`Payment amount mismatch: expected ${expectedAmount}, got ${amount} for product ${resolvedProductType}`);
        return res.status(400).json({
          message: `결제 금액이 일치하지 않습니다. 예상: ${expectedAmount}원, 실제: ${amount}원`
        });
      }

      // merchant_uid에서 product_type 추출하여 이중 검증
      const merchantProductType = merchant_uid.split("_")[0];
      if (merchantProductType !== resolvedProductType) {
        return res.status(400).json({ message: "주문 정보가 일치하지 않습니다." });
      }

      let creditsToAdd = 0;
      if (resolvedProductType === "pro") {
        await storage.updateUserTier(userId, "pro");
        creditsToAdd = 0;
      } else {
        // 크레딧: 4900원 = 50크레딧
        creditsToAdd = 50;
        if (creditsToAdd > 0) {
          await storage.addCredits(userId, creditsToAdd);
        }
      }

      await storage.createPayment({
        userId,
        impUid: imp_uid,
        merchantUid: merchant_uid,
        amount,
        status: "paid",
        productType: resolvedProductType,
        creditsAdded: creditsToAdd,
      });

      res.json({
        success: true,
        amount,
        creditsAdded: creditsToAdd,
        productType: resolvedProductType,
      });
    } catch (error: any) {
      console.error("Payment verification error:", error);
      res.status(500).json({ message: error.message || "결제 검증에 실패했습니다." });
    }
  });

  app.get("/api/payments", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const payments = await storage.getPaymentsByUser(userId);
      res.json(payments);
    } catch (error: any) {
      console.error("Get payments error:", error);
      res.status(500).json({ message: "결제 내역 조회에 실패했습니다." });
    }
  });

  app.post("/api/cancel-pro", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const credits = await storage.getUserCredits(userId);
      if (credits.tier !== "pro") {
        return res.status(400).json({ message: "현재 Pro 멤버십이 아닙니다." });
      }
      const updated = await storage.cancelPro(userId);
      res.json({ success: true, tier: updated.tier, credits: updated.credits });
    } catch (error: any) {
      console.error("Cancel pro error:", error);
      res.status(500).json({ message: "멤버십 해지에 실패했습니다." });
    }
  });

  // PortOne 웹훅 엔드포인트 (결제 상태 변경 알림)
  // 인증 없이 접근 가능하지만, imp_uid로 검증하여 중복 처리 방지
  app.post("/api/payment/webhook", async (req, res) => {
    try {
      const { imp_uid, status, merchant_uid } = req.body;

      if (!imp_uid) {
        return res.status(400).json({ message: "imp_uid가 필요합니다." });
      }

      // 이미 처리된 결제인지 확인
      const existingPayment = await storage.getPaymentByImpUid(imp_uid);
      if (existingPayment) {
        // 이미 처리된 경우 상태만 업데이트 (중복 처리 방지)
        if (existingPayment.status !== status) {
          await storage.updatePaymentStatus(existingPayment.id, status);
        }
        return res.json({ success: true, message: "이미 처리된 결제입니다." });
      }

      // 웹훅은 알림용이므로, 실제 결제 처리는 /api/payment/complete에서 처리
      // 여기서는 로깅만 수행
      console.log(`[PortOne Webhook] Payment status update: imp_uid=${imp_uid}, status=${status}, merchant_uid=${merchant_uid}`);

      res.json({ success: true, message: "웹훅 수신 완료" });
    } catch (error: any) {
      console.error("PortOne webhook error:", error);
      // 웹훅 실패 시에도 200을 반환하여 PortOne이 재시도하지 않도록 함
      res.status(200).json({ success: false, message: error.message });
    }
  });

  app.post("/api/story-scripts", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const parsed = storyScriptSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });
      }

      const canUseStory = await storage.deductCredit(userId);
      if (!canUseStory) {
        return res.status(403).json({ message: "크레딧이 부족합니다. 크레딧을 충전해주세요." });
      }

      const result = await generateStoryScripts(parsed.data);
      await storage.incrementTotalGenerations(userId);
      res.json(result);
    } catch (error: any) {
      console.error("Story script generation error:", error);
      res.status(500).json({ message: error.message || "스크립트 생성에 실패했습니다" });
    }
  });

  app.post("/api/story-topic-suggest", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const parsed = topicSuggestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });
      }

      const topics = await suggestStoryTopics(parsed.data.genre);
      res.json({ topics });
    } catch (error: any) {
      console.error("Topic suggestion error:", error);
      res.status(500).json({ message: error.message || "주제 추천에 실패했습니다" });
    }
  });

  // 자동화툰 - 스토리 → 장면 분해
  app.post("/api/auto-webtoon/breakdown", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { storyPrompt, canvasCount, cutsPerCanvas, characterDescriptions } = req.body;

      if (!storyPrompt || typeof storyPrompt !== "string" || storyPrompt.length < 5) {
        return res.status(400).json({ message: "스토리를 5자 이상 입력해주세요." });
      }
      const cc = Number(canvasCount);
      const cpc = Number(cutsPerCanvas);
      if (!cc || cc < 1 || cc > 14 || !cpc || cpc < 1 || cpc > 4) {
        return res.status(400).json({ message: "캔버스 수(1~14), 컷/캔버스(1~4)를 올바르게 입력해주세요." });
      }

      // 1 크레딧 차감
      const ok = await storage.deductCredit(userId);
      if (!ok) {
        return res.status(403).json({ message: "크레딧이 부족합니다. 충전 후 다시 시도해주세요." });
      }

      const totalCuts = cc * cpc;
      const result = await generateWebtoonSceneBreakdown({
        storyPrompt,
        totalCuts,
        characterDescriptions: characterDescriptions || [],
      });

      res.json(result);
    } catch (error: any) {
      console.error("Auto-webtoon breakdown error:", error);
      res.status(500).json({ message: error.message || "장면 분해에 실패했습니다." });
    }
  });

  // 자동 웹툰 전용 장면 이미지 생성 (주제 컨텍스트 포함)
  app.post("/api/auto-webtoon/generate-scene", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { sceneDescription, storyContext, sourceImageDataList } = req.body;

      if (!sceneDescription || typeof sceneDescription !== "string") {
        return res.status(400).json({ message: "sceneDescription is required" });
      }

      const canGenerate = await storage.deductCredit(userId);
      if (!canGenerate) {
        return res.status(403).json({ message: "크레딧이 부족합니다. 충전 후 다시 시도해주세요." });
      }

      const imageDataUrl = await generateWebtoonScene(
        sceneDescription,
        storyContext || "",
        sourceImageDataList,
      );

      // DB 저장 (비차단)
      try {
        const thumbnailUrl = await generateThumbnail(imageDataUrl);
        await storage.createGeneration({
          userId,
          characterId: null,
          type: "background",
          prompt: `Scene: ${sceneDescription}`,
          referenceImageUrl: null,
          resultImageUrl: imageDataUrl,
          thumbnailUrl: thumbnailUrl || null,
          creditsUsed: 1,
        });
        await storage.incrementTotalGenerations(userId);
      } catch (dbError: any) {
        console.error("Scene generation DB save failed:", dbError?.message);
      }

      res.json({ imageUrl: imageDataUrl });
    } catch (error: any) {
      console.error("Auto-webtoon scene generation error:", error);
      res.status(500).json({ message: error.message || "장면 이미지 생성에 실패했습니다." });
    }
  });

  app.post("/api/bubble-projects", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const canUseBubble = await storage.deductBubbleUse(userId);
      if (!canUseBubble) {
        return res.status(403).json({ message: "이번 달의 말풍선 편집기 무료 사용 횟수(3회)를 모두 사용했습니다." });
      }
      const { name, thumbnailUrl, canvasData, editorType } = req.body;
      if (!name || !canvasData) {
        return res.status(400).json({ message: "이름과 캔버스 데이터가 필요합니다." });
      }
      const project = await storage.createBubbleProject({
        userId,
        name,
        thumbnailUrl: thumbnailUrl || null,
        canvasData,
        editorType: editorType || "bubble",
      });
      res.json(project);
    } catch (error: any) {
      console.error("Create bubble project error:", error);
      res.status(500).json({ message: error.message || "프로젝트 저장에 실패했습니다." });
    }
  });

  app.get("/api/bubble-projects", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const projects = await storage.getBubbleProjectsByUser(userId);
      res.json(projects);
    } catch (error: any) {
      console.error("List bubble projects error:", error);
      res.status(500).json({ message: error.message || "프로젝트 목록 조회에 실패했습니다." });
    }
  });

  app.get("/api/bubble-projects/:id", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) return res.status(400).json({ message: "잘못된 프로젝트 ID입니다." });
      const project = await storage.getBubbleProject(id, userId);
      if (!project) return res.status(404).json({ message: "프로젝트를 찾을 수 없습니다." });
      res.json(project);
    } catch (error: any) {
      console.error("Get bubble project error:", error);
      res.status(500).json({ message: error.message || "프로젝트 조회에 실패했습니다." });
    }
  });

  app.patch("/api/bubble-projects/:id", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) return res.status(400).json({ message: "잘못된 프로젝트 ID입니다." });
      const parsed = updateBubbleProjectSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0]?.message || "잘못된 입력입니다." });
      }
      const updated = await storage.updateBubbleProject(id, userId, parsed.data);
      if (!updated) return res.status(404).json({ message: "프로젝트를 찾을 수 없습니다." });
      res.json(updated);
    } catch (error: any) {
      console.error("Update bubble project error:", error);
      res.status(500).json({ message: error.message || "프로젝트 업데이트에 실패했습니다." });
    }
  });

  // Bulk delete selected gallery items
  app.post("/api/gallery/bulk-delete", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "삭제할 항목을 선택해주세요." });
      }
      const numIds = ids.map((id: any) => parseInt(String(id))).filter((id: number) => !isNaN(id));
      const count = await storage.deleteGenerationsBulk(numIds, userId);
      res.json({ success: true, deleted: count });
    } catch (error: any) {
      console.error("Bulk delete gallery error:", error);
      res.status(500).json({ message: error.message || "삭제에 실패했습니다." });
    }
  });

  // Delete all gallery items for user
  app.delete("/api/gallery", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const count = await storage.deleteAllGenerations(userId);
      res.json({ success: true, deleted: count });
    } catch (error: any) {
      console.error("Delete all gallery error:", error);
      res.status(500).json({ message: error.message || "삭제에 실패했습니다." });
    }
  });

  app.delete("/api/gallery/:id", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) return res.status(400).json({ message: "잘못된 ID입니다." });
      const deleted = await storage.deleteGeneration(id, userId);
      if (!deleted) {
        console.warn(`Gallery delete failed: id=${id}, userId=${userId} — not found or not owned`);
        return res.status(404).json({ message: "항목을 찾을 수 없습니다." });
      }
      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete gallery item error:", error);
      res.status(500).json({ message: error.message || "삭제에 실패했습니다." });
    }
  });

  app.delete("/api/bubble-projects/:id", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) return res.status(400).json({ message: "잘못된 프로젝트 ID입니다." });
      const deleted = await storage.deleteBubbleProject(id, userId);
      if (!deleted) return res.status(404).json({ message: "프로젝트를 찾을 수 없습니다." });
      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete bubble project error:", error);
      res.status(500).json({ message: error.message || "프로젝트 삭제에 실패했습니다." });
    }
  });

  // ── Instagram Graph API routes ──

  // 1. OAuth URL 생성
  app.get("/api/instagram/connect", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      if (!config.metaAppId || !config.metaAppSecret) {
        return res.status(503).json({ message: "Instagram 연동이 아직 설정되지 않았습니다." });
      }
      const url = getOAuthUrl(req.userId!);
      res.json({ url });
    } catch (error: any) {
      console.error("Instagram connect error:", error);
      res.status(500).json({ message: error.message || "Instagram 연결 URL 생성에 실패했습니다." });
    }
  });

  // 2. OAuth 콜백
  app.get("/api/instagram/callback", async (req, res) => {
    try {
      const { code, state, error: oauthError } = req.query;
      if (oauthError) {
        return res.redirect("/?instagram_error=denied");
      }
      if (!code || !state) {
        return res.redirect("/?instagram_error=invalid");
      }

      const stateData = JSON.parse(Buffer.from(String(state), "base64url").toString());
      const userId = stateData.userId;
      if (!userId) return res.redirect("/?instagram_error=invalid_state");

      const { accessToken, expiresAt } = await exchangeCodeForToken(String(code));
      const { igUserId, igUsername, fbPageId } = await getInstagramBusinessAccount(accessToken);

      const encryptedToken = encryptToken(accessToken);

      await storage.upsertInstagramConnection({
        userId,
        igUserId,
        igUsername,
        fbPageId,
        accessToken: encryptedToken,
        tokenExpiresAt: expiresAt,
      });

      res.redirect("/dashboard?instagram_connected=true");
    } catch (error: any) {
      console.error("Instagram callback error:", error);
      res.redirect(`/dashboard?instagram_error=${encodeURIComponent(error.message || "연결 실패")}`);
    }
  });

  // 3. 연결 상태 조회
  app.get("/api/instagram/status", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const conn = await storage.getInstagramConnection(req.userId!);
      if (!conn) return res.json({ connected: false });

      // Auto-refresh if expiring within 7 days
      const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      let tokenWarning = false;
      if (conn.tokenExpiresAt < sevenDaysFromNow) {
        try {
          const plainToken = decryptToken(conn.accessToken);
          const refreshed = await refreshLongLivedToken(plainToken);
          const newEncrypted = encryptToken(refreshed.accessToken);
          await storage.updateInstagramToken(req.userId!, newEncrypted, refreshed.expiresAt);
        } catch {
          tokenWarning = true;
        }
      }

      res.json({
        connected: true,
        igUsername: conn.igUsername,
        igUserId: conn.igUserId,
        tokenExpiresAt: conn.tokenExpiresAt,
        tokenWarning,
        connectedAt: conn.connectedAt,
      });
    } catch (error: any) {
      console.error("Instagram status error:", error);
      res.status(500).json({ message: "Instagram 상태 조회에 실패했습니다." });
    }
  });

  // 4. 연결 해제
  app.delete("/api/instagram/disconnect", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      await storage.deleteInstagramConnection(req.userId!);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Instagram disconnect error:", error);
      res.status(500).json({ message: "Instagram 연결 해제에 실패했습니다." });
    }
  });

  // 5. 토큰 수동 갱신
  app.post("/api/instagram/refresh-token", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const conn = await storage.getInstagramConnection(req.userId!);
      if (!conn) return res.status(404).json({ message: "Instagram 계정이 연결되어 있지 않습니다." });

      const plainToken = decryptToken(conn.accessToken);
      const refreshed = await refreshLongLivedToken(plainToken);
      const newEncrypted = encryptToken(refreshed.accessToken);
      await storage.updateInstagramToken(req.userId!, newEncrypted, refreshed.expiresAt);

      res.json({ success: true, tokenExpiresAt: refreshed.expiresAt });
    } catch (error: any) {
      console.error("Instagram refresh token error:", error);
      res.status(500).json({ message: error.message || "토큰 갱신에 실패했습니다." });
    }
  });

  // 6. 게시 실행
  app.post("/api/instagram/publish", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const parsed = instagramPublishSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0]?.message || "잘못된 입력입니다." });
      }

      const { publishType, images, caption } = parsed.data;

      // Validate image count by type
      if (publishType === "feed" && images.length !== 1) {
        return res.status(400).json({ message: "피드 게시는 이미지 1장만 가능합니다." });
      }
      if (publishType === "story" && images.length !== 1) {
        return res.status(400).json({ message: "스토리 게시는 이미지 1장만 가능합니다." });
      }
      if (publishType === "carousel" && (images.length < 2 || images.length > 10)) {
        return res.status(400).json({ message: "캐러셀은 2~10장의 이미지가 필요합니다." });
      }

      // Check connection
      const conn = await storage.getInstagramConnection(userId);
      if (!conn) return res.status(400).json({ message: "Instagram 계정이 연결되어 있지 않습니다." });

      // Rate limit: 50 posts per 24h
      const recentCount = await storage.getPublishCountLast24h(userId);
      if (recentCount >= 50) {
        return res.status(429).json({ message: "24시간 내 게시 횟수(50회)를 초과했습니다. 잠시 후 다시 시도해주세요." });
      }

      // Create log entry
      const log = await storage.createInstagramPublishLog({
        userId,
        publishType,
        imageCount: images.length,
        caption: caption || null,
        status: "pending",
      });

      try {
        const plainToken = decryptToken(conn.accessToken);

        // Auto-refresh token if expiring soon
        let token = plainToken;
        const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        if (conn.tokenExpiresAt < sevenDays) {
          try {
            const refreshed = await refreshLongLivedToken(plainToken);
            token = refreshed.accessToken;
            await storage.updateInstagramToken(userId, encryptToken(token), refreshed.expiresAt);
          } catch {
            // Continue with existing token
          }
        }

        // Upload images to Supabase Storage
        const imageUrls: string[] = [];
        for (let i = 0; i < images.length; i++) {
          const url = await uploadImageToStorage(userId, images[i], `panel-${i + 1}.png`);
          imageUrls.push(url);
        }

        // Publish based on type
        let mediaId: string;
        if (publishType === "carousel") {
          mediaId = await publishCarousel(conn.igUserId, token, imageUrls, caption);
        } else if (publishType === "story") {
          mediaId = await publishStory(conn.igUserId, token, imageUrls[0]);
        } else {
          mediaId = await publishSingleImage(conn.igUserId, token, imageUrls[0], caption);
        }

        await storage.updateInstagramPublishLog(log.id, {
          igMediaId: mediaId,
          status: "published",
        });

        res.json({ success: true, mediaId, publishType });
      } catch (publishError: any) {
        await storage.updateInstagramPublishLog(log.id, {
          status: "failed",
          errorMessage: publishError.message || "게시 실패",
        });
        throw publishError;
      }
    } catch (error: any) {
      console.error("Instagram publish error:", error);
      const msg = error.response?.data?.error?.message || error.message || "게시에 실패했습니다.";
      res.status(500).json({ message: msg });
    }
  });

  // 7. 게시 이력 조회
  app.get("/api/instagram/publish-history", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const limit = Math.min(Math.max(parseInt(String(req.query.limit)) || 20, 1), 100);
      const logs = await storage.getInstagramPublishLogs(req.userId!, limit);
      res.json(logs);
    } catch (error: any) {
      console.error("Instagram publish history error:", error);
      res.status(500).json({ message: "게시 이력 조회에 실패했습니다." });
    }
  });

  return httpServer;
}
