import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated, type AuthRequest } from "./authMiddleware";
import { supabase } from "./supabaseClient";
import { generateCharacterImage, generateLogoImage, generatePoseImage, generateWithBackground, generateWebtoonScene, removeWhiteBackground, removeBackgroundAI, generateThumbnail, applyWatermark, generativeFillImage, generativeExpandImage, generativeUpscaleImage, segmentObjects, selectObjectAtPoint, generateWithInstantID } from "./imageGen";
import { generateAIPrompt, enhanceBio, generateStoryScripts, suggestStoryTopics, generateWebtoonSceneBreakdown, analyzeCharacterImage } from "./aiText";
import { generateCharacterSchema, generatePoseSchema, generateBackgroundSchema, removeBackgroundSchema, creatorProfileSchema, storyScriptSchema, topicSuggestSchema, updateBubbleProjectSchema, updateProjectFolderSchema, instagramPublishSchema, publishToFeedSchema } from "@shared/schema";
import axios from "axios";
import { config } from "./config";
import { logger } from "./logger";
import {
  SUBSCRIPTION_PLANS, getSubscriptionPlan, getMonthlyCreditsForPlan,
  getBillingKeyInfo, payWithBillingKey, schedulePayment, cancelScheduledPayment,
  getPaymentInfo, calculateFirstPeriod, calculateNextPeriod, generatePaymentId,
} from "./subscription";
import {
  getOAuthUrl, exchangeCodeForToken, getInstagramBusinessAccount,
  refreshLongLivedToken, encryptToken, decryptToken,
  uploadImageToStorage, publishSingleImage, publishCarousel, publishStory,
} from "./instagramService";

// 상품 정보 — 가격 + 크레딧 지급량을 서버 단일 소스로 관리
const PRODUCT_PRICES = {
  pro: 29900,
  credits: 4900,
} as const;

const PRODUCT_CREDITS: Record<keyof typeof PRODUCT_PRICES, number> = {
  pro: 0,       // Pro는 무제한이므로 크레딧 지급 없음
  credits: 50,  // 4,900원 = 50크레딧
};

const VALID_PRODUCT_TYPES = Object.keys(PRODUCT_PRICES) as Array<keyof typeof PRODUCT_PRICES>;

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

  // 공개: 가격 정보를 서버에서 제공 (클라이언트 하드코딩 방지)
  app.get("/api/pricing", (_req, res) => {
    res.json({
      products: {
        pro: { amount: PRODUCT_PRICES.pro, name: "OLLI Pro 멤버십 (월간)" },
        credits: { amount: PRODUCT_PRICES.credits, name: "OLLI 크레딧 50개" },
      },
      // 구독 플랜 정보 (3티어)
      plans: {
        free: {
          monthlyCredits: 30,
          dailyBonus: 5,
          priceUSD: { monthly: 0, yearly: 0 },
          priceKRW: { monthly: 0, yearly: 0 },
        },
        pro: {
          monthlyCredits: 3000,
          dailyBonus: 0,
          priceUSD: { monthly: 25, yearly: 255 },
          priceKRW: { monthly: SUBSCRIPTION_PLANS.pro_monthly.amountKRW, yearly: SUBSCRIPTION_PLANS.pro_yearly.amountKRW },
        },
        premium: {
          monthlyCredits: 20000,
          dailyBonus: 0,
          priceUSD: { monthly: 100, yearly: 1020 },
          priceKRW: { monthly: SUBSCRIPTION_PLANS.premium_monthly.amountKRW, yearly: SUBSCRIPTION_PLANS.premium_yearly.amountKRW },
        },
      },
      portoneV2StoreId: config.portoneV2StoreId,
      portoneV2ChannelKeyInicis: config.portoneV2ChannelKeyInicis,
      portoneV2ChannelKeyToss: config.portoneV2ChannelKeyToss,
    });
  });

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
      logger.error("User sync error", error);
      res.status(500).json({ message: "사용자 정보 조회에 실패했습니다." });
    }
  });

  app.post("/api/generate-character", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      if (!process.env.AI_INTEGRATIONS_GEMINI_API_KEY) {
        return res.status(503).json({ message: "이미지 생성 기능이 비활성화되어 있습니다. (API 키 미설정)" });
      }
      const userId = req.userId!;
      const parsed = generateCharacterSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "입력값이 올바르지 않습니다." });
      }
      const { prompt, style, sourceImageData } = parsed.data;
      // Optional: allow callers to specify generation type (e.g. "mascot") and source role
      const genType: string = (req.body as any).genType || "character";
      const validTypes = ["character", "mascot"];
      const finalType = validTypes.includes(genType) ? genType : "character";
      const finalSource = "creator";

      const FREE_STYLES = ["simple-line", "minimal", "doodle"];
      const credits = await storage.getUserCredits(userId);
      if (credits.tier === "free" && !FREE_STYLES.includes(style)) {
        return res.status(403).json({ message: "이 스타일은 유료 멤버십 전용입니다. 심플 라인, 미니멀, 낙서풍 스타일은 무료로 사용 가능합니다." });
      }

      const canGenerate = await storage.deductCredit(userId, 10);
      if (!canGenerate) {
        return res.status(403).json({ message: "크레딧이 부족합니다. 크레딧을 충전해주세요." });
      }

      let imageDataUrl = await generateCharacterImage(prompt, style, sourceImageData);
      if (credits.tier === "free") {
        imageDataUrl = await applyWatermark(imageDataUrl);
      }

      const character = await storage.createCharacter({
        userId,
        prompt,
        style,
        imageUrl: imageDataUrl,
      });

      let thumbnailUrl: string | null = null;
      try {
        thumbnailUrl = await generateThumbnail(imageDataUrl) || null;
      } catch { /* thumbnail is optional */ }

      let generation: any = null;
      try {
        generation = await storage.createGeneration({
          userId,
          characterId: character.id,
          type: finalType,
          source: finalSource,
          prompt: finalType === "mascot" ? `[MASCOT] ${prompt}` : prompt,
          resultImageUrl: imageDataUrl,
          thumbnailUrl,
          creditsUsed: 10,
        });
        await storage.incrementTotalGenerations(userId);
      } catch (dbError: any) {
        logger.error("Character generation DB save failed", dbError);
      }

      // Fire-and-forget: detect character name from prompt and save
      if (generation?.id && prompt) {
        (async () => {
          try {
            // Simple name extraction from prompt: use first meaningful segment
            const name = prompt.length <= 30 ? prompt : prompt.slice(0, 30);
            await storage.updateGenerationName(generation.id, userId, name);
          } catch { /* ignore */ }
        })();
      }

      res.json({ characterId: character.id, imageUrl: imageDataUrl });
    } catch (error: any) {
      logger.error("Character generation error", error);
      res.status(500).json({ message: "캐릭터 생성에 실패했습니다." });
    }
  });

  // ─── InstantID Test (Replicate) ───────────────────────────────────────────
  app.post("/api/test-instantid", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      if (!process.env.REPLICATE_API_TOKEN) {
        return res.status(503).json({ message: "REPLICATE_API_TOKEN이 설정되지 않았습니다." });
      }
      const { faceImageData, prompt } = req.body as { faceImageData?: string; prompt?: string };
      if (!faceImageData?.startsWith("data:")) {
        return res.status(400).json({ message: "faceImageData(base64 data URL)가 필요합니다." });
      }
      const imageUrl = await generateWithInstantID(faceImageData, prompt || "");
      res.json({ imageUrl });
    } catch (error: any) {
      logger.error("InstantID generation error", error);
      res.status(500).json({ message: error.message || "InstantID 생성 실패" });
    }
  });

  // ─── Logo Generation ──────────────────────────────────────────────────────
  app.post("/api/generate-logo", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      if (!process.env.AI_INTEGRATIONS_GEMINI_API_KEY) {
        return res.status(503).json({ message: "이미지 생성 기능이 비활성화되어 있습니다. (API 키 미설정)" });
      }
      const userId = req.userId!;
      const { prompt, style, sourceImageData, source: reqSource } = req.body as {
        prompt?: string;
        style?: string;
        sourceImageData?: string;
        source?: string;
      };

      if (!prompt && !sourceImageData) {
        return res.status(400).json({ message: "프롬프트 또는 스케치 이미지가 필요합니다." });
      }

      const finalSource = "creator";

      const credits = await storage.getUserCredits(userId);
      const canGenerate = await storage.deductCredit(userId, 10);
      if (!canGenerate) {
        return res.status(403).json({ message: "크레딧이 부족합니다." });
      }

      let imageDataUrl = await generateLogoImage(
        prompt || "",
        style || "minimal",
        sourceImageData
      );

      if (credits.tier === "free") {
        imageDataUrl = await applyWatermark(imageDataUrl);
      }

      // Save as generation for gallery tracking
      try {
        await storage.createGeneration({
          userId,
          characterId: null as any,
          type: "logo",
          source: finalSource,
          prompt: `[LOGO] ${prompt || "sketch-based logo"}`,
          resultImageUrl: imageDataUrl,
          thumbnailUrl: null,
          creditsUsed: 10,
        });
        await storage.incrementTotalGenerations(userId);
      } catch { /* DB save optional */ }

      res.json({ imageUrl: imageDataUrl });
    } catch (error: any) {
      logger.error("Logo generation error", error);
      res.status(500).json({ message: "로고 생성에 실패했습니다." });
    }
  });

  app.post("/api/generate-pose", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      if (!process.env.AI_INTEGRATIONS_GEMINI_API_KEY) {
        return res.status(503).json({ message: "이미지 생성 기능이 비활성화되어 있습니다. (API 키 미설정)" });
      }
      const userId = req.userId!;
      const parsed = generatePoseSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "입력값이 올바르지 않습니다." });
      }
      const { characterIds, prompt, referenceImageData } = parsed.data;

      // 모든 캐릭터 조회 및 소유권 검증
      const characters = [];
      for (const cid of characterIds) {
        const character = await storage.getCharacter(cid);
        if (!character) {
          return res.status(404).json({ message: "캐릭터를 찾을 수 없습니다." });
        }
        if (character.userId !== userId) {
          return res.status(403).json({ message: "접근 권한이 없습니다." });
        }
        characters.push(character);
      }

      const credits = await storage.getUserCredits(userId);
      const canGenerate = await storage.deductCredit(userId, 25);
      if (!canGenerate) {
        return res.status(403).json({ message: "크레딧이 부족합니다. 크레딧을 충전해주세요." });
      }

      let imageDataUrl = await generatePoseImage(characters, prompt, referenceImageData);
      if (credits.tier === "free") {
        imageDataUrl = await applyWatermark(imageDataUrl);
      }

      let poseThumbUrl: string | null = null;
      try {
        poseThumbUrl = await generateThumbnail(imageDataUrl) || null;
      } catch { /* thumbnail is optional */ }

      const poseSource = "creator";
      try {
        await storage.createGeneration({
          userId,
          characterId: characterIds[0],
          type: "pose",
          source: poseSource,
          prompt,
          referenceImageUrl: referenceImageData || null,
          resultImageUrl: imageDataUrl,
          thumbnailUrl: poseThumbUrl,
          creditsUsed: 25,
        });
        await storage.incrementTotalGenerations(userId);
      } catch (dbError: any) {
        logger.error("Pose generation DB save failed", dbError);
      }

      res.json({ imageUrl: imageDataUrl });
    } catch (error: any) {
      logger.error("Pose generation error", error);
      res.status(500).json({ message: "포즈 생성에 실패했습니다." });
    }
  });

  app.post("/api/generate-background", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      // Gemini API 키 없으면 503 반환
      if (!process.env.AI_INTEGRATIONS_GEMINI_API_KEY) {
        return res.status(503).json({ message: "이미지 생성 기능이 비활성화되어 있습니다. (API 키 미설정)" });
      }
      const userId = req.userId!;
      const parsed = generateBackgroundSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "입력값이 올바르지 않습니다." });
      }
      const { sourceImageDataList, backgroundPrompt, itemsPrompt, characterIds, noBackground, aspectRatio } = parsed.data;
      const characterNames: string[] | undefined = Array.isArray(req.body.characterNames) ? req.body.characterNames : undefined;
      const skipGallery = req.body.skipGallery === true;

      // 모든 캐릭터 소유권 검증
      if (characterIds && characterIds.length > 0) {
        for (const cid of characterIds) {
          const character = await storage.getCharacter(cid);
          if (!character) {
            return res.status(404).json({ message: "캐릭터를 찾을 수 없습니다." });
          }
          if (character.userId !== userId) {
            return res.status(403).json({ message: "접근 권한이 없습니다." });
          }
        }
      }

      const credits = await storage.getUserCredits(userId);
      const canGenerate = await storage.deductCredit(userId, 25);
      if (!canGenerate) {
        return res.status(403).json({ message: "크레딧이 부족합니다. 크레딧을 충전해주세요." });
      }

      let imageDataUrl = await generateWithBackground(sourceImageDataList, backgroundPrompt, itemsPrompt, noBackground, aspectRatio, characterNames);
      if (credits.tier === "free") {
        imageDataUrl = await applyWatermark(imageDataUrl);
      }

      if (!skipGallery) {
        const fullPrompt = itemsPrompt
          ? `Background: ${backgroundPrompt}, Items: ${itemsPrompt}`
          : `Background: ${backgroundPrompt}`;

        let bgThumbUrl: string | null = null;
        try {
          bgThumbUrl = await generateThumbnail(imageDataUrl) || null;
        } catch { /* thumbnail is optional */ }

        const bgSource = "creator";
        try {
          await storage.createGeneration({
            userId,
            characterId: characterIds?.[0] || null,
            type: "background",
            source: bgSource,
            prompt: fullPrompt,
            referenceImageUrl: null,
            resultImageUrl: imageDataUrl,
            thumbnailUrl: bgThumbUrl,
            creditsUsed: 25,
          });
        } catch (dbError: any) {
          logger.error("Background generation DB save failed", dbError);
        }
      }
      await storage.incrementTotalGenerations(userId);

      res.json({ imageUrl: imageDataUrl });
    } catch (error: any) {
      logger.error("Background generation error", error);
      res.status(500).json({ message: "배경 생성에 실패했습니다." });
    }
  });

  app.post("/api/remove-background", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const parsed = removeBackgroundSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "입력값이 올바르지 않습니다." });
      }
      const { sourceImageData } = parsed.data;

      if (!sourceImageData.startsWith("data:")) {
        return res.status(400).json({ message: "유효하지 않은 이미지 형식입니다." });
      }

      const credits = await storage.getUserCredits(userId);
      if (credits.tier === "free") {
        return res.status(403).json({ message: "배경 제거는 유료 멤버십 전용 기능입니다." });
      }

      // AI 기반 배경 제거 사용 (모든 배경색 지원)
      const imageDataUrl = await removeBackgroundAI(sourceImageData);

      res.json({ imageUrl: imageDataUrl });
    } catch (error: any) {
      logger.error("Remove background error", error);
      res.status(500).json({ message: "배경 제거에 실패했습니다." });
    }
  });

  // ─── Generative Fill ─────────────────────────────────────────────────────
  app.post("/api/generative-fill", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { imageData, maskData, prompt } = req.body;
      if (!imageData || !maskData || !prompt) {
        return res.status(400).json({ message: "이미지, 마스크, 프롬프트가 필요합니다." });
      }

      const credits = await storage.getUserCredits(userId);
      const canGenerate = await storage.deductCredit(userId, 25);
      if (!canGenerate) {
        return res.status(403).json({ message: "크레딧이 부족합니다. 크레딧을 충전해주세요." });
      }

      let resultUrl = await generativeFillImage(imageData, maskData, prompt);
      if (credits.tier === "free") {
        resultUrl = await applyWatermark(resultUrl);
      }

      let thumbUrl: string | null = null;
      try { thumbUrl = await generateThumbnail(resultUrl) || null; } catch { /* optional */ }

      const fillSource = "creator";
      try {
        await storage.createGeneration({
          userId,
          characterId: null,
          type: "background",
          source: fillSource,
          prompt: `[Generative Fill] ${prompt}`,
          resultImageUrl: resultUrl,
          thumbnailUrl: thumbUrl,
          creditsUsed: 25,
        });
        await storage.incrementTotalGenerations(userId);
      } catch (dbError: any) {
        logger.error("Generative fill DB save failed", dbError);
      }

      res.json({ imageUrl: resultUrl });
    } catch (error: any) {
      logger.error("Generative fill error", error);
      res.status(500).json({ message: "생성형 채우기에 실패했습니다." });
    }
  });

  // ─── Generative Expand ──────────────────────────────────────────────────
  app.post("/api/generative-expand", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { imageData, top, right, bottom, left, prompt } = req.body;
      if (!imageData) {
        return res.status(400).json({ message: "이미지가 필요합니다." });
      }

      const credits = await storage.getUserCredits(userId);
      const canGenerate = await storage.deductCredit(userId, 25);
      if (!canGenerate) {
        return res.status(403).json({ message: "크레딧이 부족합니다. 크레딧을 충전해주세요." });
      }

      let resultUrl = await generativeExpandImage(
        imageData,
        top || 0, right || 0, bottom || 0, left || 0,
        prompt || ""
      );
      if (credits.tier === "free") {
        resultUrl = await applyWatermark(resultUrl);
      }

      let thumbUrl: string | null = null;
      try { thumbUrl = await generateThumbnail(resultUrl) || null; } catch { /* optional */ }

      const expandSource = "creator";
      try {
        await storage.createGeneration({
          userId,
          characterId: null,
          type: "background",
          source: expandSource,
          prompt: `[Generative Expand] ${prompt || "auto"}`,
          resultImageUrl: resultUrl,
          thumbnailUrl: thumbUrl,
          creditsUsed: 25,
        });
        await storage.incrementTotalGenerations(userId);
      } catch (dbError: any) {
        logger.error("Generative expand DB save failed", dbError);
      }

      res.json({ imageUrl: resultUrl });
    } catch (error: any) {
      logger.error("Generative expand error", error);
      res.status(500).json({ message: "생성형 확장에 실패했습니다." });
    }
  });

  // ─── Generative Upscale ─────────────────────────────────────────────────
  app.post("/api/generative-upscale", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { imageData, scale } = req.body;
      if (!imageData) {
        return res.status(400).json({ message: "이미지가 필요합니다." });
      }

      const credits = await storage.getUserCredits(userId);
      const canGenerate = await storage.deductCredit(userId, 15);
      if (!canGenerate) {
        return res.status(403).json({ message: "크레딧이 부족합니다. 크레딧을 충전해주세요." });
      }

      let resultUrl = await generativeUpscaleImage(imageData, scale || 2);
      if (credits.tier === "free") {
        resultUrl = await applyWatermark(resultUrl);
      }

      let thumbUrl: string | null = null;
      try { thumbUrl = await generateThumbnail(resultUrl) || null; } catch { /* optional */ }

      const upscaleSource = "creator";
      try {
        await storage.createGeneration({
          userId,
          characterId: null,
          type: "background",
          source: upscaleSource,
          prompt: `[Generative Upscale] ${scale || 2}x`,
          resultImageUrl: resultUrl,
          thumbnailUrl: thumbUrl,
          creditsUsed: 15,
        });
        await storage.incrementTotalGenerations(userId);
      } catch (dbError: any) {
        logger.error("Generative upscale DB save failed", dbError);
      }

      res.json({ imageUrl: resultUrl });
    } catch (error: any) {
      logger.error("Generative upscale error", error);
      res.status(500).json({ message: "업스케일에 실패했습니다." });
    }
  });

  // ─── Object Segmentation ────────────────────────────────────────────────
  app.post("/api/object-segment", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { imageData } = req.body;
      if (!imageData) {
        return res.status(400).json({ message: "이미지가 필요합니다." });
      }

      const credits = await storage.getUserCredits(userId);
      const canGenerate = await storage.deductCredit(userId, 15);
      if (!canGenerate) {
        return res.status(403).json({ message: "크레딧이 부족합니다. 크레딧을 충전해주세요." });
      }

      const segments = await segmentObjects(imageData);
      res.json({ segments });
    } catch (error: any) {
      logger.error("Object segmentation error", error);
      res.status(500).json({ message: "개체 감지에 실패했습니다." });
    }
  });

  app.post("/api/object-select-at-point", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { imageData, clickX, clickY, imageWidth, imageHeight } = req.body;
      if (!imageData || clickX === undefined || clickY === undefined) {
        return res.status(400).json({ message: "이미지와 클릭 좌표가 필요합니다." });
      }

      const credits = await storage.getUserCredits(userId);
      const canGenerate = await storage.deductCredit(userId, 5);
      if (!canGenerate) {
        return res.status(403).json({ message: "크레딧이 부족합니다." });
      }

      const maskDataUrl = await selectObjectAtPoint(imageData, clickX, clickY, imageWidth || 540, imageHeight || 675);
      res.json({ maskDataUrl });
    } catch (error: any) {
      logger.error("Object selection at point error", error);
      res.status(500).json({ message: "개체 선택에 실패했습니다." });
    }
  });

  app.post("/api/analyze-character", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const { imageUrl } = req.body;
      if (!imageUrl || typeof imageUrl !== "string") {
        return res.status(400).json({ message: "imageUrl이 필요합니다." });
      }

      let dataUrl = imageUrl;

      // https URL인 경우 fetch해서 base64 변환
      if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
        const resp = await axios.get(imageUrl, { responseType: "arraybuffer", timeout: 10000 });
        const contentType = resp.headers["content-type"] || "image/png";
        const base64 = Buffer.from(resp.data).toString("base64");
        dataUrl = `data:${contentType};base64,${base64}`;
      }

      const names = await analyzeCharacterImage(dataUrl);
      res.json({ names });
    } catch (error: any) {
      logger.error("Character analysis error", error);
      res.status(500).json({ message: "캐릭터 분석에 실패했습니다.", names: ["캐릭터"] });
    }
  });

  app.post("/api/ai-prompt", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { type, context, referenceImageUrl } = req.body;
      if (!type || !["character", "pose", "background", "style-detect"].includes(type)) {
        return res.status(400).json({ message: "잘못된 타입입니다." });
      }
      // style-detect is a free utility call (no credit deduction)
      if (type !== "style-detect") {
        const canUse = await storage.deductCredit(userId, 5);
        if (!canUse) {
          return res.status(403).json({ message: "크레딧이 부족합니다." });
        }
      }
      const result = await generateAIPrompt(type, context, referenceImageUrl);
      res.json({ prompt: result });
    } catch (error: any) {
      res.status(500).json({ message: "AI 프롬프트 생성에 실패했습니다." });
    }
  });

  app.post("/api/enhance-bio", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { bio, profileName, category, followers, engagement } = req.body;
      if (!bio || typeof bio !== "string" || bio.trim().length < 3) {
        return res.status(400).json({ message: "소개글을 3자 이상 입력해주세요." });
      }
      const canUse = await storage.deductCredit(userId, 5);
      if (!canUse) {
        return res.status(403).json({ message: "크레딧이 부족합니다." });
      }
      const enhanced = await enhanceBio({ bio, profileName, category, followers, engagement });
      res.json({ enhancedBio: enhanced });
    } catch (error: any) {
      logger.error("Bio enhance error", error);
      res.status(500).json({ message: "소개글 개선에 실패했습니다." });
    }
  });

  app.get("/api/characters", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const chars = await storage.getCharactersByUser(userId);
      res.json(chars);
    } catch (error) {
      res.status(500).json({ message: "캐릭터 목록 조회에 실패했습니다." });
    }
  });

  app.get("/api/characters/:id", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) {
        return res.status(400).json({ message: "잘못된 캐릭터 ID입니다." });
      }
      const character = await storage.getCharacter(id);
      if (!character) {
        return res.status(404).json({ message: "캐릭터를 찾을 수 없습니다." });
      }
      if (character.userId !== userId) {
        return res.status(403).json({ message: "접근 권한이 없습니다." });
      }
      res.json(character);
    } catch (error) {
      res.status(500).json({ message: "캐릭터 조회에 실패했습니다." });
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
        const source = (req.query.source as string) || "all";
        const folderId = req.query.folderId ? parseInt(String(req.query.folderId)) : undefined;

        let items: any[];
        let total: number;

        if (folderId && !isNaN(folderId)) {
          [items, total] = await Promise.all([
            storage.getGenerationsByFolder(folderId, userId, limit, offset),
            storage.getGenerationsByFolderCount(folderId, userId),
          ]);
        } else {
          [items, total] = await Promise.all([
            storage.getGenerationsLight(userId, limit, offset, type, source),
            storage.getGalleryCount(userId, type, source),
          ]);
        }

        // Filter out misclassified items (backward compat for old data)
        if (type === "character") {
          items = items.filter((item: any) => {
            const prompt = item.prompt || "";
            if (prompt.startsWith("[LOGO]")) return false;
            if (prompt.startsWith("[MASCOT]")) return false;
            return true;
          });
        }

        res.json({
          items,
          total,
          hasMore: offset + items.length < total,
        });
      } else {
        // Legacy format: plain array (used by pose, background, bubble, etc.)
        const type = (req.query.type as string) || "all";
        let items = await storage.getGenerationsByUser(userId);
        // Filter by type if specified
        if (type && type !== "all") {
          items = items.filter((item: any) => item.type === type);
        }
        // Always filter out logo items from character queries
        if (type === "character") {
          items = items.filter((item: any) => !(item.prompt || "").startsWith("[LOGO]"));
        }
        res.json(items);
      }
    } catch (error) {
      res.status(500).json({ message: "갤러리 조회에 실패했습니다." });
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
      res.status(500).json({ message: "갤러리 항목 조회에 실패했습니다." });
    }
  });

  app.get("/api/usage", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const credits = await storage.getUserCredits(userId);
      const isPaid = credits.tier === "pro" || credits.tier === "premium";
      const creatorTier = isPaid ? 3 : 0;
      const tierPanelLimits = [3, 5, 8, 14];

      // 구독 정보 조회
      let subscription: any = null;
      try {
        subscription = await storage.getSubscription(userId);
      } catch { /* subscriptions table may not exist yet */ }

      res.json({
        credits: credits.credits,
        dailyBonusCredits: credits.dailyBonusCredits ?? 0,
        tier: credits.tier,
        authorName: credits.authorName,
        genre: credits.genre,
        totalGenerations: credits.totalGenerations,
        monthlyCreditsQuota: (credits as any).monthlyCreditsQuota ?? (isPaid ? 3000 : 30),
        dailyFreeCredits: isPaid ? -1 : 30,
        bubbleUsesToday: credits.bubbleUsesToday,
        storyUsesToday: credits.storyUsesToday,
        maxBubbleUses: isPaid ? -1 : 3,
        maxStoryUses: isPaid ? -1 : 3,
        maxStoryPanels: tierPanelLimits[creatorTier] ?? 3,
        creatorTier,
        subscription: subscription ? {
          plan: subscription.plan,
          billingCycle: subscription.billingCycle,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
          nextPaymentAt: subscription.nextPaymentAt,
          cancelledAt: subscription.cancelledAt,
        } : null,
      });
    } catch (error) {
      res.status(500).json({ message: "사용량 조회에 실패했습니다." });
    }
  });

  app.post("/api/creator-profile", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const parsed = creatorProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "입력값이 올바르지 않습니다." });
      }
      const updated = await storage.updateCreatorProfile(userId, parsed.data);
      res.json({ authorName: updated.authorName, genre: updated.genre });
    } catch (error) {
      res.status(500).json({ message: "프로필 업데이트에 실패했습니다." });
    }
  });

  app.get("/api/trending", async (_req, res) => {
    try {
      const data = await storage.getAllTrending();
      res.json(data);
    } catch (error: any) {
      logger.error("Trending fetch error", error);
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
      const { paymentId, product_type } = req.body;

      // 1. 필수 필드 검증
      if (!paymentId || typeof paymentId !== "string") {
        return res.status(400).json({ message: "잘못된 결제 요청입니다." });
      }

      // 2. product_type 화이트리스트 검증
      const resolvedProductType = (product_type || "credits") as string;
      if (!VALID_PRODUCT_TYPES.includes(resolvedProductType as keyof typeof PRODUCT_PRICES)) {
        return res.status(400).json({ message: "유효하지 않은 상품 타입입니다." });
      }
      const productKey = resolvedProductType as keyof typeof PRODUCT_PRICES;

      // 3. 멱등성: 이미 처리된 결제인지 확인
      const existingPayment = await storage.getPaymentByImpUid(paymentId);
      if (existingPayment) {
        return res.status(409).json({ message: "이미 처리된 결제입니다." });
      }

      // 4. PortOne V2 API로 실제 결제 데이터 검증 (서버 ↔ 서버)
      const paymentResponse = await axios.get(
        `https://api.portone.io/payments/${encodeURIComponent(paymentId)}`,
        { headers: { Authorization: `PortOne ${config.portoneV2ApiSecret}` } },
      );

      const paymentData = paymentResponse.data;
      if (!paymentData || paymentData.status !== "PAID") {
        return res.status(400).json({ message: "결제가 완료되지 않았습니다." });
      }

      // 5. 금액 검증: PortOne 실결제 금액 vs 서버 상품 가격
      const amount = paymentData.amount?.total;
      const expectedAmount = PRODUCT_PRICES[productKey];
      if (amount !== expectedAmount) {
        return res.status(400).json({ message: "결제 금액이 일치하지 않습니다. 관리자에게 문의하세요." });
      }

      // 6. paymentId에서 product_type 추출하여 이중 검증
      const merchantProductType = paymentId.split("_")[0];
      if (merchantProductType !== productKey) {
        return res.status(400).json({ message: "주문 정보가 일치하지 않습니다." });
      }

      // 7. 상품 처리 (서버 상수 기반)
      const creditsToAdd = PRODUCT_CREDITS[productKey];
      if (productKey === "pro") {
        await storage.updateUserTier(userId, "pro");
      } else if (creditsToAdd > 0) {
        await storage.addCredits(userId, creditsToAdd);
      }

      // 8. 결제 기록 저장
      await storage.createPayment({
        userId,
        impUid: paymentId,
        merchantUid: paymentId,
        amount,
        status: "paid",
        productType: productKey,
        creditsAdded: creditsToAdd,
      });

      res.json({
        success: true,
        amount,
        creditsAdded: creditsToAdd,
        productType: productKey,
      });
    } catch (error: any) {
      logger.error("Payment verification error", error);
      res.status(500).json({ message: "결제 검증에 실패했습니다." });
    }
  });

  app.get("/api/payments", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const payments = await storage.getPaymentsByUser(userId);
      // 클라이언트에 불필요한 내부 필드(impUid, merchantUid, userId) 제거
      const sanitized = payments.map(({ impUid, merchantUid, userId: _uid, ...safe }) => safe);
      res.json(sanitized);
    } catch (error: any) {
      logger.error("Get payments error", error);
      res.status(500).json({ message: "결제 내역 조회에 실패했습니다." });
    }
  });

  app.post("/api/cancel-pro", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const credits = await storage.getUserCredits(userId);
      if (credits.tier !== "pro" && credits.tier !== "premium") {
        return res.status(400).json({ message: "현재 유료 멤버십이 아닙니다." });
      }
      const updated = await storage.cancelPro(userId);
      res.json({
        success: true,
        tier: updated.tier,
        credits: updated.credits,
        proExpiresAt: updated.proExpiresAt,
      });
    } catch (error: any) {
      logger.error("Cancel pro error", error);
      res.status(500).json({ message: "멤버십 해지에 실패했습니다." });
    }
  });

  // ── 구독 관리 (PortOne V2 빌링키) ──

  // 빌링키 등록 → 첫 결제 → 구독 생성 → 다음 결제 예약
  app.post("/api/subscription/billing-key", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { billingKey, plan, billingCycle } = req.body;

      if (!billingKey || !plan || !billingCycle) {
        return res.status(400).json({ message: "빌링키, 플랜, 결제 주기가 필요합니다." });
      }

      const planInfo = getSubscriptionPlan(plan, billingCycle);
      if (!planInfo) {
        return res.status(400).json({ message: "유효하지 않은 플랜입니다." });
      }

      // 기존 구독 확인
      const existing = await storage.getSubscription(userId);
      if (existing && existing.status === "active") {
        return res.status(409).json({ message: "이미 활성 구독이 있습니다. 플랜 변경을 이용해주세요." });
      }

      // 빌링키 검증
      try {
        await getBillingKeyInfo(billingKey);
      } catch (err: any) {
        logger.error("Billing key verification failed", err);
        return res.status(400).json({ message: "유효하지 않은 빌링키입니다." });
      }

      // 첫 결제 실행
      const paymentId = generatePaymentId(plan, billingCycle, userId);
      try {
        await payWithBillingKey({
          paymentId,
          billingKey,
          amount: planInfo.amountKRW,
          currency: "KRW",
          orderName: planInfo.label,
          customerId: userId,
        });
      } catch (err: any) {
        logger.error("First subscription payment failed", err);
        return res.status(402).json({ message: "첫 결제에 실패했습니다. 카드 정보를 확인해주세요." });
      }

      // 기간 계산
      const { start, end } = calculateFirstPeriod(billingCycle);

      // 구독 생성
      if (existing) {
        await storage.updateSubscription(userId, {
          plan,
          billingCycle,
          billingKey,
          status: "active",
          currentPeriodStart: start,
          currentPeriodEnd: end,
          nextPaymentAt: end,
          cancelledAt: null,
          cancelReason: null,
          retryCount: 0,
          lastRetryAt: null,
        });
      } else {
        await storage.createSubscription({
          userId,
          plan,
          billingCycle,
          billingKey,
          pgProvider: "tosspayments",
          status: "active",
          currentPeriodStart: start,
          currentPeriodEnd: end,
          nextPaymentAt: end,
        });
      }

      // 유저 티어 업데이트 + 크레딧 지급
      await storage.updateUserTier(userId, plan);

      // 결제 기록 저장
      await storage.createPayment({
        userId,
        impUid: paymentId,
        merchantUid: paymentId,
        amount: planInfo.amountKRW,
        status: "paid",
        productType: `${plan}_subscription`,
        creditsAdded: planInfo.monthlyCredits,
        subscriptionId: null,
        billingCycle,
        currency: "KRW",
      });

      // 다음 결제 예약
      const nextPaymentId = generatePaymentId(plan, billingCycle, userId);
      try {
        await schedulePayment({
          paymentId: nextPaymentId,
          billingKey,
          amount: planInfo.amountKRW,
          currency: "KRW",
          orderName: planInfo.label,
          timeToPay: end,
          customerId: userId,
        });
        await storage.updateSubscription(userId, { portoneScheduleId: nextPaymentId });
      } catch (err: any) {
        logger.warn("Failed to schedule next payment (subscription is still active)", err);
      }

      res.json({
        success: true,
        plan,
        billingCycle,
        currentPeriodEnd: end,
        credits: planInfo.monthlyCredits,
      });
    } catch (error: any) {
      logger.error("Subscription billing-key error", error);
      res.status(500).json({ message: "구독 생성에 실패했습니다." });
    }
  });

  // 현재 구독 상태 조회
  app.get("/api/subscription", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const sub = await storage.getSubscription(userId);
      if (!sub) {
        return res.json({ subscription: null });
      }
      res.json({
        subscription: {
          plan: sub.plan,
          billingCycle: sub.billingCycle,
          status: sub.status,
          currentPeriodStart: sub.currentPeriodStart,
          currentPeriodEnd: sub.currentPeriodEnd,
          nextPaymentAt: sub.nextPaymentAt,
          cancelledAt: sub.cancelledAt,
          cancelReason: sub.cancelReason,
        },
      });
    } catch (error: any) {
      logger.error("Get subscription error", error);
      res.status(500).json({ message: "구독 조회에 실패했습니다." });
    }
  });

  // 구독 취소 (기간 끝까지 유지)
  app.post("/api/subscription/cancel", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { reason } = req.body;

      const sub = await storage.getSubscription(userId);
      if (!sub || sub.status !== "active") {
        return res.status(400).json({ message: "활성 구독이 없습니다." });
      }

      // 예약된 다음 결제 취소
      if (sub.portoneScheduleId) {
        try {
          await cancelScheduledPayment(sub.portoneScheduleId);
        } catch (err: any) {
          logger.warn("Failed to cancel scheduled payment", err);
        }
      }

      // 구독 상태 업데이트 (기간 끝까지 유지)
      await storage.updateSubscription(userId, {
        status: "cancelled",
        cancelledAt: new Date(),
        cancelReason: reason || null,
        portoneScheduleId: null,
        nextPaymentAt: null,
      });

      // proExpiresAt 설정 (기간 만료 시 free로 전환)
      const db = (storage as any).getDb();
      const { userCredits } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      await db.update(userCredits)
        .set({ proExpiresAt: sub.currentPeriodEnd })
        .where(eq(userCredits.userId, userId));

      res.json({
        success: true,
        currentPeriodEnd: sub.currentPeriodEnd,
        message: `${new Date(sub.currentPeriodEnd).toLocaleDateString("ko-KR")}까지 구독 혜택이 유지됩니다.`,
      });
    } catch (error: any) {
      logger.error("Subscription cancel error", error);
      res.status(500).json({ message: "구독 취소에 실패했습니다." });
    }
  });

  // 플랜 변경 (업/다운그레이드)
  app.post("/api/subscription/change-plan", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { plan, billingCycle } = req.body;

      const sub = await storage.getSubscription(userId);
      if (!sub || (sub.status !== "active" && sub.status !== "cancelled")) {
        return res.status(400).json({ message: "활성 구독이 없습니다." });
      }

      const newPlan = getSubscriptionPlan(plan, billingCycle);
      if (!newPlan) {
        return res.status(400).json({ message: "유효하지 않은 플랜입니다." });
      }

      // 같은 플랜이면 무시
      if (sub.plan === plan && sub.billingCycle === billingCycle && sub.status === "active") {
        return res.status(400).json({ message: "현재와 동일한 플랜입니다." });
      }

      // 기존 예약 결제 취소
      if (sub.portoneScheduleId) {
        try {
          await cancelScheduledPayment(sub.portoneScheduleId);
        } catch { /* ignore */ }
      }

      // 즉시 새 플랜으로 결제
      const paymentId = generatePaymentId(plan, billingCycle, userId);
      try {
        await payWithBillingKey({
          paymentId,
          billingKey: sub.billingKey,
          amount: newPlan.amountKRW,
          currency: "KRW",
          orderName: `${newPlan.label} (플랜 변경)`,
          customerId: userId,
        });
      } catch (err: any) {
        logger.error("Plan change payment failed", err);
        return res.status(402).json({ message: "결제에 실패했습니다." });
      }

      const { start, end } = calculateFirstPeriod(billingCycle);

      // 구독 업데이트
      await storage.updateSubscription(userId, {
        plan,
        billingCycle,
        status: "active",
        currentPeriodStart: start,
        currentPeriodEnd: end,
        nextPaymentAt: end,
        cancelledAt: null,
        cancelReason: null,
        retryCount: 0,
      });

      // 티어 + 크레딧 업데이트
      await storage.updateUserTier(userId, plan);

      // 결제 기록
      await storage.createPayment({
        userId,
        impUid: paymentId,
        merchantUid: paymentId,
        amount: newPlan.amountKRW,
        status: "paid",
        productType: `${plan}_subscription`,
        creditsAdded: newPlan.monthlyCredits,
        billingCycle,
        currency: "KRW",
      });

      // 다음 결제 예약
      const nextPaymentId = generatePaymentId(plan, billingCycle, userId);
      try {
        await schedulePayment({
          paymentId: nextPaymentId,
          billingKey: sub.billingKey,
          amount: newPlan.amountKRW,
          currency: "KRW",
          orderName: newPlan.label,
          timeToPay: end,
          customerId: userId,
        });
        await storage.updateSubscription(userId, { portoneScheduleId: nextPaymentId });
      } catch { /* ignore */ }

      res.json({ success: true, plan, billingCycle, credits: newPlan.monthlyCredits });
    } catch (error: any) {
      logger.error("Subscription change-plan error", error);
      res.status(500).json({ message: "플랜 변경에 실패했습니다." });
    }
  });

  // PortOne V2 웹훅 (정기결제 결과)
  app.post("/api/subscription/webhook", async (req, res) => {
    try {
      const { type, data } = req.body;
      const paymentId = data?.paymentId;

      if (!paymentId) {
        return res.status(200).json({ success: true });
      }

      logger.info(`Subscription webhook received: ${type} for ${paymentId}`);

      // paymentId에서 userId 추출: sub_plan_cycle_userId8_ts
      const parts = paymentId.split("_");
      if (parts.length < 5 || parts[0] !== "sub") {
        return res.status(200).json({ success: true }); // 일반 결제 웹훅은 무시
      }

      // PortOne V2로 결제 상태 확인
      let paymentInfo: any;
      try {
        paymentInfo = await getPaymentInfo(paymentId);
      } catch (err: any) {
        logger.error("Webhook: failed to verify payment", err);
        return res.status(200).json({ success: false });
      }

      const status = paymentInfo?.status;

      if (status === "PAID" && type === "Transaction.Paid") {
        // 결제 성공 → 구독 갱신, 크레딧 리셋
        // customerId 에서 userId 가져오기
        const customerId = paymentInfo?.customer?.id;
        if (!customerId) {
          logger.error("Webhook: no customerId in payment");
          return res.status(200).json({ success: false });
        }

        const sub = await storage.getSubscription(customerId);
        if (!sub) {
          return res.status(200).json({ success: true });
        }

        const planInfo = getSubscriptionPlan(sub.plan, sub.billingCycle);
        if (!planInfo) {
          return res.status(200).json({ success: true });
        }

        // 기간 갱신
        const { start, end } = calculateNextPeriod(sub.currentPeriodEnd, sub.billingCycle);
        await storage.updateSubscription(customerId, {
          status: "active",
          currentPeriodStart: start,
          currentPeriodEnd: end,
          nextPaymentAt: end,
          retryCount: 0,
          lastRetryAt: null,
        });

        // 크레딧 리셋
        await storage.updateUserTier(customerId, sub.plan);

        // 결제 기록
        await storage.createPayment({
          userId: customerId,
          impUid: paymentId,
          merchantUid: paymentId,
          amount: planInfo.amountKRW,
          status: "paid",
          productType: `${sub.plan}_subscription`,
          creditsAdded: planInfo.monthlyCredits,
          billingCycle: sub.billingCycle,
          currency: "KRW",
        });

        // 다음 결제 예약
        const nextId = generatePaymentId(sub.plan, sub.billingCycle, customerId);
        try {
          await schedulePayment({
            paymentId: nextId,
            billingKey: sub.billingKey,
            amount: planInfo.amountKRW,
            currency: "KRW",
            orderName: planInfo.label,
            timeToPay: end,
            customerId,
          });
          await storage.updateSubscription(customerId, { portoneScheduleId: nextId });
        } catch { /* ignore */ }

      } else if (status === "FAILED" && type === "Transaction.Failed") {
        // 결제 실패 → 재시도 또는 past_due
        const customerId = paymentInfo?.customer?.id;
        if (!customerId) return res.status(200).json({ success: false });

        const sub = await storage.getSubscription(customerId);
        if (!sub) return res.status(200).json({ success: true });

        const maxRetries = 3;
        const retryIntervalDays = 3;

        if (sub.retryCount < maxRetries) {
          // 재시도 예약 (3일 후)
          const retryDate = new Date();
          retryDate.setDate(retryDate.getDate() + retryIntervalDays);

          const planInfo = getSubscriptionPlan(sub.plan, sub.billingCycle);
          if (planInfo) {
            const retryPaymentId = generatePaymentId(sub.plan, sub.billingCycle, customerId);
            try {
              await schedulePayment({
                paymentId: retryPaymentId,
                billingKey: sub.billingKey,
                amount: planInfo.amountKRW,
                currency: "KRW",
                orderName: `${planInfo.label} (재시도 ${sub.retryCount + 1}/${maxRetries})`,
                timeToPay: retryDate,
                customerId,
              });
            } catch { /* ignore */ }
          }

          await storage.updateSubscription(customerId, {
            status: "past_due",
            retryCount: sub.retryCount + 1,
            lastRetryAt: new Date(),
            portoneScheduleId: null,
          });
        } else {
          // 최대 재시도 초과 → 만료
          await storage.updateSubscription(customerId, {
            status: "expired",
            retryCount: sub.retryCount + 1,
            lastRetryAt: new Date(),
          });
          // free로 전환
          await storage.updateUserTier(customerId, "free");
        }
      }

      res.status(200).json({ success: true });
    } catch (error: any) {
      logger.error("Subscription webhook error", error);
      res.status(200).json({ success: false });
    }
  });

  // ── 회원 탈퇴 ──
  app.post("/api/delete-account", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      await storage.deleteAccount(userId);

      // Supabase Auth 에서도 사용자 삭제 (재로그인 방지)
      try {
        await supabase.auth.admin.deleteUser(userId);
      } catch (e) {
        // service_role 키가 없는 환경에서는 실패할 수 있음 — 데이터 삭제는 이미 완료
        logger.warn("Supabase auth user deletion failed (data already deleted)", e);
      }

      logger.info(`Account deleted: ${userId}`);
      res.json({ success: true, message: "회원 탈퇴가 완료되었습니다." });
    } catch (error: any) {
      logger.error("Delete account error", error);
      res.status(500).json({ message: "회원 탈퇴에 실패했습니다. 고객센터로 문의해주세요." });
    }
  });

  // PortOne 웹훅 엔드포인트 (결제 상태 변경 알림)
  // 인증 없이 접근 가능 — PortOne API로 imp_uid를 서버 간 검증하여 위조 방지
  app.post("/api/payment/webhook", async (req, res) => {
    try {
      const { imp_uid, status: webhookStatus, merchant_uid } = req.body;

      if (!imp_uid || typeof imp_uid !== "string") {
        return res.status(400).json({ message: "잘못된 요청입니다." });
      }

      // 이미 처리된 결제인지 확인
      const existingPayment = await storage.getPaymentByImpUid(imp_uid);
      if (existingPayment) {
        if (existingPayment.status !== webhookStatus) {
          // PortOne API로 실제 상태를 검증한 후에만 업데이트
          try {
            const accessToken = await getPortoneAccessToken();
            const verifyRes = await axios.get(
              `https://api.iamport.kr/payments/${imp_uid}`,
              { headers: { Authorization: `Bearer ${accessToken}` } },
            );
            const verified = verifyRes.data.response;
            if (verified && verified.status !== existingPayment.status) {
              await storage.updatePaymentStatus(existingPayment.id, verified.status);
            }
          } catch {
            // 검증 실패 시 웹훅 데이터만으로는 업데이트하지 않음
          }
        }
        return res.json({ success: true });
      }

      res.json({ success: true });
    } catch (error: any) {
      logger.error("PortOne webhook error", error);
      // 웹훅 실패 시에도 200을 반환하여 PortOne이 재시도하지 않도록 함
      res.status(200).json({ success: false });
    }
  });

  app.post("/api/story-scripts", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const parsed = storyScriptSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "입력값이 올바르지 않습니다." });
      }

      const canUseStory = await storage.deductCredit(userId, 50);
      if (!canUseStory) {
        return res.status(403).json({ message: "크레딧이 부족합니다. 자동화 생성에는 50 크레딧이 필요합니다." });
      }

      const result = await generateStoryScripts(parsed.data);
      await storage.incrementTotalGenerations(userId);
      res.json(result);
    } catch (error: any) {
      logger.error("Story script generation error", error);
      res.status(500).json({ message: "스크립트 생성에 실패했습니다." });
    }
  });

  app.post("/api/story-topic-suggest", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const parsed = topicSuggestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "입력값이 올바르지 않습니다." });
      }
      const canUse = await storage.deductCredit(userId, 5);
      if (!canUse) {
        return res.status(403).json({ message: "크레딧이 부족합니다." });
      }
      const topics = await suggestStoryTopics(parsed.data.genre);
      res.json({ topics });
    } catch (error: any) {
      logger.error("Topic suggestion error", error);
      res.status(500).json({ message: "주제 추천에 실패했습니다." });
    }
  });

  // 자동화툰 - 스토리 → 장면 분해
  app.post("/api/auto-webtoon/breakdown", isAuthenticated, async (req: AuthRequest, res) => {
    if (!process.env.AI_INTEGRATIONS_GEMINI_API_KEY) {
      return res.status(503).json({ message: "AI 기능이 비활성화되어 있습니다. (API 키 미설정)" });
    }
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

      // 50 크레딧 차감
      const ok = await storage.deductCredit(userId, 50);
      if (!ok) {
        return res.status(403).json({ message: "크레딧이 부족합니다. 프롬프트 작성에는 50 크레딧이 필요합니다." });
      }

      const totalCuts = cc * cpc;
      const result = await generateWebtoonSceneBreakdown({
        storyPrompt,
        totalCuts,
        characterDescriptions: characterDescriptions || [],
      });

      res.json(result);
    } catch (error: any) {
      logger.error("Auto-webtoon breakdown error", error);
      const detail = error.message?.includes("invalid JSON") ? " (AI 응답 파싱 오류)" : error.message?.includes("API error") ? " (AI API 오류)" : "";
      res.status(500).json({ message: `장면 분해에 실패했습니다.${detail}` });
    }
  });

  // 자동 웹툰 전용 장면 이미지 생성 (주제 컨텍스트 포함)
  app.post("/api/auto-webtoon/generate-scene", isAuthenticated, async (req: AuthRequest, res) => {
    if (!process.env.AI_INTEGRATIONS_GEMINI_API_KEY) {
      return res.status(503).json({ message: "AI 기능이 비활성화되어 있습니다. (API 키 미설정)" });
    }
    try {
      const userId = req.userId!;
      const { sceneDescription, storyContext, sourceImageDataList, aspectRatio, sceneIndex, totalScenes, previousSceneDescription, characterNames, teamIdentity, templateType, teamLogoImage, capLogoImage } = req.body;

      if (!sceneDescription || typeof sceneDescription !== "string") {
        return res.status(400).json({ message: "장면 설명이 필요합니다." });
      }

      // ── 디버그 로그: 실제로 선수 사진/로고가 전달되는지 확인
      const imgCount = Array.isArray(sourceImageDataList) ? sourceImageDataList.length : 0;
      const imgSizes = Array.isArray(sourceImageDataList)
        ? sourceImageDataList.map((d: string, i: number) => `#${i + 1}: ${d ? `${Math.round(d.length / 1024)}KB` : 'null'}`)
        : [];
      logger.info(`[generate-scene] 선수사진=${imgCount}장 [${imgSizes.join(', ')}], 로고=${teamLogoImage ? `${Math.round(teamLogoImage.length / 1024)}KB` : 'NONE'}, 팀=${teamIdentity ? 'YES' : 'NONE'}, 캐릭터=${characterNames || 'NONE'}, 템플릿=${templateType || 'default'}`);

      const credits = await storage.getUserCredits(userId);
      const canGenerate = await storage.deductCredit(userId, 5);
      if (!canGenerate) {
        return res.status(403).json({ message: "크레딧이 부족합니다. 충전 후 다시 시도해주세요." });
      }

      const imageDataUrl = await generateWebtoonScene(
        sceneDescription,
        storyContext || "",
        sourceImageDataList,
        aspectRatio,
        sceneIndex,
        totalScenes,
        previousSceneDescription,
        characterNames,
        teamIdentity,
        templateType,
        teamLogoImage,
        capLogoImage,
      );

      // story에서 생성된 이미지는 갤러리에 저장하지 않음
      await storage.incrementTotalGenerations(userId);

      res.json({ imageUrl: imageDataUrl });
    } catch (error: any) {
      logger.error("Auto-webtoon scene generation error", error);
      const detail = error.message?.includes("blocked") ? " (콘텐츠 정책 차단)" : error.message?.includes("API") ? " (AI API 오류)" : "";
      res.status(500).json({ message: `장면 이미지 생성에 실패했습니다.${detail}` });
    }
  });

  // ── Project Folders ──

  app.post("/api/project-folders", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { name } = req.body;
      if (!name || typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ message: "폴더 이름을 입력해주세요." });
      }
      const folder = await storage.createProjectFolder({ userId, name: name.trim() });
      res.json(folder);
    } catch (error: any) {
      logger.error("Create project folder error", error);
      res.status(500).json({ message: "폴더 생성에 실패했습니다." });
    }
  });

  app.get("/api/project-folders", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const folders = await storage.getProjectFoldersByUser(userId);
      res.json(folders);
    } catch (error: any) {
      logger.error("List project folders error", error);
      res.status(500).json({ message: "폴더 목록 조회에 실패했습니다." });
    }
  });

  app.patch("/api/project-folders/:id", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) return res.status(400).json({ message: "잘못된 폴더 ID입니다." });
      const parsed = updateProjectFolderSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0]?.message || "잘못된 입력입니다." });
      }
      const updated = await storage.updateProjectFolder(id, userId, parsed.data);
      if (!updated) return res.status(404).json({ message: "폴더를 찾을 수 없습니다." });
      res.json(updated);
    } catch (error: any) {
      logger.error("Update project folder error", error);
      res.status(500).json({ message: "폴더 업데이트에 실패했습니다." });
    }
  });

  app.delete("/api/project-folders/:id", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) return res.status(400).json({ message: "잘못된 폴더 ID입니다." });
      const deleted = await storage.deleteProjectFolder(id, userId);
      if (!deleted) return res.status(404).json({ message: "폴더를 찾을 수 없습니다." });
      res.json({ success: true });
    } catch (error: any) {
      logger.error("Delete project folder error", error);
      res.status(500).json({ message: "폴더 삭제에 실패했습니다." });
    }
  });

  app.get("/api/project-folders/:id/projects", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) return res.status(400).json({ message: "잘못된 폴더 ID입니다." });
      const projects = await storage.getBubbleProjectsByFolder(id, userId);
      res.json(projects);
    } catch (error: any) {
      logger.error("Get folder projects error", error);
      res.status(500).json({ message: "폴더 프로젝트 조회에 실패했습니다." });
    }
  });

  app.post("/api/bubble-projects", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const canUseBubble = await storage.deductBubbleUse(userId);
      if (!canUseBubble) {
        return res.status(403).json({ message: "이번 달의 말풍선 편집기 무료 사용 횟수(3회)를 모두 사용했습니다." });
      }
      const { name, thumbnailUrl, canvasData, editorType, folderId } = req.body;
      if (!name || !canvasData) {
        return res.status(400).json({ message: "이름과 캔버스 데이터가 필요합니다." });
      }
      const project = await storage.createBubbleProject({
        userId,
        name,
        thumbnailUrl: thumbnailUrl || null,
        canvasData,
        editorType: editorType || "bubble",
        folderId: folderId || null,
      });
      res.json(project);
    } catch (error: any) {
      logger.error("Create bubble project error", error);
      res.status(500).json({ message: "프로젝트 저장에 실패했습니다." });
    }
  });

  app.get("/api/bubble-projects", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const projects = await storage.getBubbleProjectsByUser(userId);
      res.json(projects);
    } catch (error: any) {
      logger.error("List bubble projects error", error);
      res.status(500).json({ message: "프로젝트 목록 조회에 실패했습니다." });
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
      logger.error("Get bubble project error", error);
      res.status(500).json({ message: "프로젝트 조회에 실패했습니다." });
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
      logger.error("Update bubble project error", error);
      res.status(500).json({ message: "프로젝트 업데이트에 실패했습니다." });
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
      logger.error("Bulk delete gallery error", error);
      res.status(500).json({ message: "삭제에 실패했습니다." });
    }
  });

  // Delete all gallery items for user
  app.delete("/api/gallery", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const count = await storage.deleteAllGenerations(userId);
      res.json({ success: true, deleted: count });
    } catch (error: any) {
      logger.error("Delete all gallery error", error);
      res.status(500).json({ message: "삭제에 실패했습니다." });
    }
  });

  app.delete("/api/gallery/:id", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) return res.status(400).json({ message: "잘못된 ID입니다." });
      const deleted = await storage.deleteGeneration(id, userId);
      if (!deleted) {
        logger.warn("Gallery delete failed: item not found or not owned");
        return res.status(404).json({ message: "항목을 찾을 수 없습니다." });
      }
      res.json({ success: true });
    } catch (error: any) {
      logger.error("Delete gallery item error", error);
      res.status(500).json({ message: "삭제에 실패했습니다." });
    }
  });

  // ── Character Name ──
  app.patch("/api/gallery/:id/name", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) return res.status(400).json({ message: "잘못된 ID입니다." });
      const { name } = req.body;
      if (typeof name !== "string" || name.length > 100) {
        return res.status(400).json({ message: "이름은 100자 이하여야 합니다." });
      }
      const updated = await storage.updateGenerationName(id, userId, name);
      if (!updated) return res.status(404).json({ message: "항목을 찾을 수 없습니다." });
      res.json({ success: true });
    } catch (error: any) {
      logger.error("Update generation name error", error);
      res.status(500).json({ message: "이름 변경에 실패했습니다." });
    }
  });

  // ── Regenerate gallery character ──
  app.post("/api/gallery/:id/regenerate", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) return res.status(400).json({ message: "잘못된 ID입니다." });

      const gen = await storage.getGenerationById(id, userId);
      if (!gen) return res.status(404).json({ message: "항목을 찾을 수 없습니다." });

      const { prompt } = req.body;
      if (prompt && (typeof prompt !== "string" || prompt.length > 500)) {
        return res.status(400).json({ message: "프롬프트는 500자 이하여야 합니다." });
      }

      // Determine style from linked character or default
      let style = "simple-line";
      if (gen.characterId) {
        const char = await storage.getCharacter(gen.characterId);
        if (char) style = char.style;
      }

      const credits = await storage.getUserCredits(userId);
      const canGenerate = await storage.deductCredit(userId, 10);
      if (!canGenerate) {
        return res.status(403).json({ message: "크레딧이 부족합니다." });
      }

      // Use existing image as reference + optional prompt for modifications
      const regenPrompt = prompt?.trim() || gen.prompt || "same character in a different pose and expression";
      let imageDataUrl = await generateCharacterImage(regenPrompt, style, gen.resultImageUrl);
      if (credits.tier === "free") {
        imageDataUrl = await applyWatermark(imageDataUrl);
      }

      let thumbnailUrl: string | null = null;
      try {
        thumbnailUrl = await generateThumbnail(imageDataUrl) || null;
      } catch { /* optional */ }

      await storage.updateGenerationImage(id, userId, imageDataUrl, thumbnailUrl);
      await storage.incrementTotalGenerations(userId);

      res.json({ imageUrl: imageDataUrl, thumbnailUrl });
    } catch (error: any) {
      logger.error("Gallery regenerate error", error);
      res.status(500).json({ message: "캐릭터 재생성에 실패했습니다." });
    }
  });

  // ── Character Folders ──
  app.post("/api/character-folders", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { name } = req.body;
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ message: "폴더 이름을 입력해주세요." });
      }
      const folder = await storage.createCharacterFolder({ userId, name: name.trim() });
      res.json(folder);
    } catch (error: any) {
      logger.error("Create character folder error", error);
      res.status(500).json({ message: "폴더 생성에 실패했습니다." });
    }
  });

  app.get("/api/character-folders", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const folders = await storage.getCharacterFoldersByUser(userId);
      res.json(folders);
    } catch (error: any) {
      logger.error("Get character folders error", error);
      res.status(500).json({ message: "폴더 목록 조회에 실패했습니다." });
    }
  });

  app.patch("/api/character-folders/:id", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) return res.status(400).json({ message: "잘못된 ID입니다." });
      const { name } = req.body;
      if (!name || typeof name !== "string") {
        return res.status(400).json({ message: "폴더 이름을 입력해주세요." });
      }
      const updated = await storage.updateCharacterFolder(id, userId, { name: name.trim() });
      if (!updated) return res.status(404).json({ message: "폴더를 찾을 수 없습니다." });
      res.json(updated);
    } catch (error: any) {
      logger.error("Update character folder error", error);
      res.status(500).json({ message: "폴더 수정에 실패했습니다." });
    }
  });

  app.delete("/api/character-folders/:id", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) return res.status(400).json({ message: "잘못된 ID입니다." });
      const deleted = await storage.deleteCharacterFolder(id, userId);
      if (!deleted) return res.status(404).json({ message: "폴더를 찾을 수 없습니다." });
      res.json({ success: true });
    } catch (error: any) {
      logger.error("Delete character folder error", error);
      res.status(500).json({ message: "폴더 삭제에 실패했습니다." });
    }
  });

  app.post("/api/character-folders/:id/items", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const folderId = parseInt(String(req.params.id));
      if (isNaN(folderId)) return res.status(400).json({ message: "잘못된 ID입니다." });
      const { generationIds } = req.body;
      if (!Array.isArray(generationIds) || generationIds.length === 0) {
        return res.status(400).json({ message: "추가할 항목을 선택해주세요." });
      }
      const numIds = generationIds.map((id: any) => parseInt(String(id))).filter((id: number) => !isNaN(id));
      const added = await storage.addCharacterFolderItems(folderId, userId, numIds);
      res.json({ success: true, added });
    } catch (error: any) {
      logger.error("Add character folder items error", error);
      res.status(500).json({ message: "폴더에 추가하는데 실패했습니다." });
    }
  });

  app.delete("/api/character-folders/:id/items/:generationId", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const folderId = parseInt(String(req.params.id));
      const generationId = parseInt(String(req.params.generationId));
      if (isNaN(folderId) || isNaN(generationId)) return res.status(400).json({ message: "잘못된 ID입니다." });
      const removed = await storage.removeCharacterFolderItem(folderId, userId, generationId);
      if (!removed) return res.status(404).json({ message: "항목을 찾을 수 없습니다." });
      res.json({ success: true });
    } catch (error: any) {
      logger.error("Remove character folder item error", error);
      res.status(500).json({ message: "폴더에서 제거하는데 실패했습니다." });
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
      logger.error("Delete bubble project error", error);
      res.status(500).json({ message: "프로젝트 삭제에 실패했습니다." });
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
      logger.error("Instagram connect error", error);
      res.status(500).json({ message: "Instagram 연결에 실패했습니다." });
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
      logger.error("Instagram callback error", error);
      res.redirect("/dashboard?instagram_error=연결에 실패했습니다");
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
      logger.error("Instagram status error", error);
      res.status(500).json({ message: "Instagram 상태 조회에 실패했습니다." });
    }
  });

  // 4. 연결 해제
  app.delete("/api/instagram/disconnect", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      await storage.deleteInstagramConnection(req.userId!);
      res.json({ success: true });
    } catch (error: any) {
      logger.error("Instagram disconnect error", error);
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
      logger.error("Instagram refresh token error", error);
      res.status(500).json({ message: "토큰 갱신에 실패했습니다." });
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
      logger.error("Instagram publish error", error);
      res.status(500).json({ message: "Instagram 게시에 실패했습니다." });
    }
  });

  // 7. 게시 이력 조회
  app.get("/api/instagram/publish-history", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const limit = Math.min(Math.max(parseInt(String(req.query.limit)) || 20, 1), 100);
      const logs = await storage.getInstagramPublishLogs(req.userId!, limit);
      res.json(logs);
    } catch (error: any) {
      logger.error("Instagram publish history error", error);
      res.status(500).json({ message: "게시 이력 조회에 실패했습니다." });
    }
  });

  // ── Social Feed System ──

  // Helper: optional auth (extracts userId if token present, but doesn't require it)
  async function optionalAuth(req: AuthRequest): Promise<string | undefined> {
    if (process.env.AUTH_BYPASS === "true") return "dev-bypass-user-0001";
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) return undefined;
    try {
      const token = authHeader.split(" ")[1];
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data.user) return undefined;
      return data.user.id;
    } catch {
      return undefined;
    }
  }

  // GET /api/feed - Feed list
  app.get("/api/feed", async (req: AuthRequest, res) => {
    try {
      const viewerId = await optionalAuth(req);
      const limit = Math.min(Math.max(parseInt(String(req.query.limit)) || 20, 1), 50);
      const offset = Math.max(parseInt(String(req.query.offset)) || 0, 0);
      const sort = req.query.sort === "popular" ? "popular" : "recent";
      const followingOnly = req.query.filter === "following" && !!viewerId;

      const result = await storage.getFeedPosts({ limit, offset, sort, viewerId, followingOnly });
      res.json(result);
    } catch (error: any) {
      logger.error("Feed list error", error);
      res.status(500).json({ message: "피드를 불러오는데 실패했습니다." });
    }
  });

  // POST /api/feed - Publish to feed
  app.post("/api/feed", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const parsed = publishToFeedSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0]?.message || "잘못된 입력입니다." });
      }

      const { type, title, description, sourceId } = parsed.data;

      // Get the source image
      let imageUrl: string;
      let thumbnailUrl: string | undefined;

      if (type === "image") {
        const gen = await storage.getGenerationById(sourceId, userId);
        if (!gen) return res.status(404).json({ message: "갤러리 이미지를 찾을 수 없습니다." });
        imageUrl = gen.resultImageUrl;
        thumbnailUrl = gen.thumbnailUrl || undefined;
      } else {
        const project = await storage.getBubbleProject(sourceId, userId);
        if (!project) return res.status(404).json({ message: "프로젝트를 찾을 수 없습니다." });
        imageUrl = project.thumbnailUrl || "";
        if (!imageUrl) return res.status(400).json({ message: "프로젝트에 썸네일이 없습니다." });
      }

      const post = await storage.createFeedPost({
        userId,
        type,
        title,
        description,
        imageUrl,
        thumbnailUrl,
        sourceId,
      });

      res.json(post);
    } catch (error: any) {
      logger.error("Feed publish error", error);
      res.status(500).json({ message: "게시에 실패했습니다." });
    }
  });

  // GET /api/feed/:id - Post detail
  app.get("/api/feed/:id", async (req: AuthRequest, res) => {
    try {
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) return res.status(400).json({ message: "잘못된 ID입니다." });
      const viewerId = await optionalAuth(req);
      const post = await storage.getFeedPost(id, viewerId);
      if (!post) return res.status(404).json({ message: "게시물을 찾을 수 없습니다." });
      res.json(post);
    } catch (error: any) {
      logger.error("Feed post detail error", error);
      res.status(500).json({ message: "게시물을 불러오는데 실패했습니다." });
    }
  });

  // DELETE /api/feed/:id - Delete own post
  app.delete("/api/feed/:id", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) return res.status(400).json({ message: "잘못된 ID입니다." });
      const deleted = await storage.deleteFeedPost(id, req.userId!);
      if (!deleted) return res.status(404).json({ message: "게시물을 찾을 수 없습니다." });
      res.json({ success: true });
    } catch (error: any) {
      logger.error("Feed delete error", error);
      res.status(500).json({ message: "삭제에 실패했습니다." });
    }
  });

  // POST /api/feed/:id/like - Like post
  app.post("/api/feed/:id/like", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const postId = parseInt(String(req.params.id));
      if (isNaN(postId)) return res.status(400).json({ message: "잘못된 ID입니다." });
      await storage.likePost(req.userId!, postId);
      res.json({ success: true });
    } catch (error: any) {
      logger.error("Like error", error);
      res.status(500).json({ message: "좋아요에 실패했습니다." });
    }
  });

  // DELETE /api/feed/:id/like - Unlike post
  app.delete("/api/feed/:id/like", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const postId = parseInt(String(req.params.id));
      if (isNaN(postId)) return res.status(400).json({ message: "잘못된 ID입니다." });
      await storage.unlikePost(req.userId!, postId);
      res.json({ success: true });
    } catch (error: any) {
      logger.error("Unlike error", error);
      res.status(500).json({ message: "좋아요 취소에 실패했습니다." });
    }
  });

  // POST /api/users/:id/follow - Follow user
  app.post("/api/users/:id/follow", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const followingId = String(req.params.id);
      if (followingId === req.userId) return res.status(400).json({ message: "자신을 팔로우할 수 없습니다." });
      await storage.followUser(req.userId!, followingId);
      res.json({ success: true });
    } catch (error: any) {
      logger.error("Follow error", error);
      res.status(500).json({ message: "팔로우에 실패했습니다." });
    }
  });

  // DELETE /api/users/:id/follow - Unfollow user
  app.delete("/api/users/:id/follow", isAuthenticated, async (req: AuthRequest, res) => {
    try {
      const followingId = String(req.params.id);
      await storage.unfollowUser(req.userId!, followingId);
      res.json({ success: true });
    } catch (error: any) {
      logger.error("Unfollow error", error);
      res.status(500).json({ message: "언팔로우에 실패했습니다." });
    }
  });

  // GET /api/users/:id/profile - Public profile
  app.get("/api/users/:id/profile", async (req: AuthRequest, res) => {
    try {
      const userId = String(req.params.id);
      const viewerId = await optionalAuth(req);
      const profile = await storage.getUserPublicProfile(userId, viewerId);
      if (!profile) return res.status(404).json({ message: "유저를 찾을 수 없습니다." });
      res.json(profile);
    } catch (error: any) {
      logger.error("User profile error", error);
      res.status(500).json({ message: "프로필을 불러오는데 실패했습니다." });
    }
  });

  // GET /api/users/:id/posts - User's posts
  app.get("/api/users/:id/posts", async (req: AuthRequest, res) => {
    try {
      const userId = String(req.params.id);
      const limit = Math.min(Math.max(parseInt(String(req.query.limit)) || 20, 1), 50);
      const offset = Math.max(parseInt(String(req.query.offset)) || 0, 0);
      const result = await storage.getUserFeedPosts(userId, limit, offset);
      res.json(result);
    } catch (error: any) {
      logger.error("User posts error", error);
      res.status(500).json({ message: "게시물을 불러오는데 실패했습니다." });
    }
  });

  // GET /api/popular-creators - Popular creators ranking
  app.get("/api/popular-creators", async (_req, res) => {
    try {
      const creators = await storage.getPopularCreators(10);
      res.json(creators);
    } catch (error: any) {
      logger.error("Popular creators error", error);
      res.json([]);
    }
  });

  // ── KBO Live Scores (Naver Sports API Proxy) ──────────────────────────────
  const NAVER_TEAM_CODE_MAP: Record<string, string> = {
    LG: "team-lg", KT: "team-kt", SK: "team-ssg", HT: "team-kia",
    OB: "team-doo", NC: "team-nc", LT: "team-lot", SS: "team-sam",
    HH: "team-han", WO: "team-kiw",
  };
  const NAVER_TEAM_NAME_MAP: Record<string, string> = {
    LG: "LG 트윈스", KT: "KT 위즈", SK: "SSG 랜더스", SSG: "SSG 랜더스",
    HT: "KIA 타이거즈", KIA: "KIA 타이거즈", OB: "두산 베어스",
    NC: "NC 다이노스", LT: "롯데 자이언츠", SS: "삼성 라이온즈",
    HH: "한화 이글스", WO: "키움 히어로즈",
  };
  const STADIUM_NAME_MAP: Record<string, string> = {
    잠실: "잠실야구장", 문학: "인천 SSG랜더스필드", 수원: "수원 KT위즈파크",
    대전: "대전 한화생명이글스파크", 대구: "대구 삼성라이온즈파크",
    광주: "광주 기아챔피언스필드", 창원: "창원 NC파크",
    사직: "사직야구장", 고척: "고척스카이돔",
  };

  let kboScoresCache: { data: any; timestamp: number } | null = null;
  const KBO_CACHE_TTL = 10000; // 10 seconds

  app.get("/api/kbo/scores", async (req, res) => {
    try {
      const date = (req.query.date as string) || new Date().toISOString().split("T")[0];

      // Return cached data if fresh
      const cacheKey = date;
      if (kboScoresCache && kboScoresCache.timestamp > Date.now() - KBO_CACHE_TTL) {
        return res.json(kboScoresCache.data);
      }

      const naverUrl = `https://api-gw.sports.naver.com/schedule/games?fields=basic,superCategoryId,categoryName,stadium,statusNum,gameOnAir&upperCategoryId=kbaseball&category=kbo&date=${date}`;
      const response = await axios.get(naverUrl, {
        timeout: 8000,
        headers: { "User-Agent": "Mozilla/5.0" },
      });

      if (!response.data?.result?.games) {
        return res.json({ games: [], date });
      }

      const kboGames = response.data.result.games
        .filter((g: any) => g.categoryId === "kbo")
        .map((g: any) => {
          const homeCode = g.homeTeamCode;
          const awayCode = g.awayTeamCode;
          let status: string = "scheduled";
          if (g.cancel) status = "postponed";
          else if (g.statusCode === "STARTED" || g.statusNum === 2) status = "live";
          else if (g.statusCode === "RESULT" || g.statusNum === 4) status = "finished";

          return {
            gameId: g.gameId,
            homeTeamId: NAVER_TEAM_CODE_MAP[homeCode] || homeCode,
            awayTeamId: NAVER_TEAM_CODE_MAP[awayCode] || awayCode,
            homeTeamName: NAVER_TEAM_NAME_MAP[g.homeTeamName] || NAVER_TEAM_NAME_MAP[homeCode] || g.homeTeamName,
            awayTeamName: NAVER_TEAM_NAME_MAP[g.awayTeamName] || NAVER_TEAM_NAME_MAP[awayCode] || g.awayTeamName,
            homeScore: g.homeTeamScore,
            awayScore: g.awayTeamScore,
            status,
            inning: g.statusInfo || null,
            stadium: STADIUM_NAME_MAP[g.stadium] || g.stadium,
            date: g.gameDate,
            time: g.gameDateTime ? g.gameDateTime.split("T")[1]?.slice(0, 5) : "14:00",
            homeEmblemUrl: g.homeTeamEmblemUrl,
            awayEmblemUrl: g.awayTeamEmblemUrl,
            gameOnAir: g.gameOnAir,
          };
        });

      const result = { games: kboGames, date };
      kboScoresCache = { data: result, timestamp: Date.now() };
      res.json(result);
    } catch (error: any) {
      logger.error("KBO scores fetch error", error?.message);
      res.status(500).json({ games: [], error: "KBO 점수 조회에 실패했습니다." });
    }
  });

  // ── KBO Monthly Schedule (Naver Sports API — date-by-date fetch) ──────────
  const kboMonthCache: Record<string, { data: any; ts: number }> = {};
  const MONTH_CACHE_TTL = 3600_000; // 1 hour

  function mapNaverGameToSchedule(g: any) {
    const homeCode = g.homeTeamCode;
    const awayCode = g.awayTeamCode;
    let status = "scheduled";
    if (g.cancel) status = "postponed";
    else if (g.statusCode === "STARTED" || g.statusNum === 2) status = "live";
    else if (g.statusCode === "RESULT" || g.statusNum === 4) status = "finished";

    return {
      id: g.gameId || `${g.gameDate}-${homeCode}-${awayCode}`,
      gameId: g.gameId,
      homeTeamId: NAVER_TEAM_CODE_MAP[homeCode] || homeCode,
      awayTeamId: NAVER_TEAM_CODE_MAP[awayCode] || awayCode,
      homeTeamName: NAVER_TEAM_NAME_MAP[g.homeTeamName] || NAVER_TEAM_NAME_MAP[homeCode] || g.homeTeamName,
      awayTeamName: NAVER_TEAM_NAME_MAP[g.awayTeamName] || NAVER_TEAM_NAME_MAP[awayCode] || g.awayTeamName,
      homeScore: g.homeTeamScore ?? null,
      awayScore: g.awayTeamScore ?? null,
      status,
      stadium: STADIUM_NAME_MAP[g.stadium] || g.stadium || "",
      date: g.gameDate,
      time: g.gameDateTime ? g.gameDateTime.split("T")[1]?.slice(0, 5) : "14:00",
    };
  }

  app.get("/api/kbo/schedule", async (req, res) => {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const month = parseInt(req.query.month as string) || (new Date().getMonth() + 1);
      const key = `${year}-${String(month).padStart(2, "0")}`;

      // Cache hit
      if (kboMonthCache[key]?.ts > Date.now() - MONTH_CACHE_TTL) {
        return res.json(kboMonthCache[key].data);
      }

      // Build date list for the month
      const daysInMonth = new Date(year, month, 0).getDate();
      const dates: string[] = [];
      for (let d = 1; d <= daysInMonth; d++) {
        dates.push(`${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
      }

      // Fetch in parallel batches of 7
      const allGames: any[] = [];
      const NAVER_SCHEDULE_URL = "https://api-gw.sports.naver.com/schedule/games";
      const NAVER_FIELDS = "fields=basic,superCategoryId,categoryName,stadium,statusNum,gameOnAir";

      for (let i = 0; i < dates.length; i += 7) {
        const batch = dates.slice(i, i + 7);
        const results = await Promise.allSettled(
          batch.map((d) =>
            axios.get(
              `${NAVER_SCHEDULE_URL}?${NAVER_FIELDS}&upperCategoryId=kbaseball&category=kbo&date=${d}`,
              { timeout: 8000, headers: { "User-Agent": "Mozilla/5.0" } },
            ),
          ),
        );

        for (const r of results) {
          if (r.status === "fulfilled" && r.value.data?.result?.games) {
            const kboGames = r.value.data.result.games
              .filter((g: any) => g.categoryId === "kbo")
              .map(mapNaverGameToSchedule);
            allGames.push(...kboGames);
          }
        }
      }

      // Deduplicate by gameId and filter to only games within the requested month
      const monthPrefix = `${year}-${String(month).padStart(2, "0")}`;
      const seen = new Set<string>();
      const deduped = allGames.filter((g: any) => {
        if (!g.gameId || seen.has(g.gameId)) return false;
        seen.add(g.gameId);
        // Only include games whose date falls within the requested month
        return typeof g.date === "string" && g.date.startsWith(monthPrefix);
      });

      const data = { games: deduped, year, month };
      kboMonthCache[key] = { data, ts: Date.now() };
      res.json(data);
    } catch (error: any) {
      logger.error("KBO schedule fetch error", error?.message);
      res.status(500).json({ games: [], error: "일정 조회에 실패했습니다." });
    }
  });

  // ── KBO Game Relay (real-time lineup & game state) ─────────────────────────
  const kboRelayCache: Record<string, { data: any; timestamp: number }> = {};
  const RELAY_CACHE_TTL = 15000; // 15 seconds

  app.get("/api/kbo/relay/:gameId", async (req, res) => {
    try {
      const { gameId } = req.params;
      if (!gameId) return res.status(400).json({ error: "gameId required" });

      // Cache check
      if (kboRelayCache[gameId] && kboRelayCache[gameId].timestamp > Date.now() - RELAY_CACHE_TTL) {
        return res.json(kboRelayCache[gameId].data);
      }

      const naverUrl = `https://api-gw.sports.naver.com/schedule/games/${gameId}/relay`;
      const response = await axios.get(naverUrl, {
        timeout: 8000,
        headers: { "User-Agent": "Mozilla/5.0" },
      });

      const relay = response.data?.result?.textRelayData;
      if (!relay) {
        return res.json({ lineup: null });
      }

      const gs = relay.currentGameState || {};
      const isTopInning = relay.homeOrAway === "0"; // 0=초(top), 1=말(bottom)

      // Position name mapping (full + abbreviated variants from Naver API)
      const POS_MAP: Record<string, string> = {
        "투수": "pitcher", "포수": "catcher",
        "1루수": "first", "2루수": "second", "3루수": "third",
        "유격수": "shortstop",
        "좌익수": "left", "중견수": "center", "우익수": "right",
        "지명타자": "dh",
        "1루": "first", "2루": "second", "3루": "third",
        "유격": "shortstop",
        "좌익": "left", "중견": "center", "우익": "right",
        "좌전": "left", "중전": "center", "우전": "right",
        "지타": "dh", "DH": "dh",
        // English abbreviations (Naver entry data sometimes uses these)
        "P": "pitcher", "C": "catcher",
        "1B": "first", "2B": "second", "3B": "third",
        "SS": "shortstop",
        "LF": "left", "CF": "center", "RF": "right",
      };

      // Build pcode → player map from LINEUP (full 9-man) + ENTRY (substitutions)
      const pcodeMap: Record<string, { name: string; pos: string; style?: string }> = {};

      // 1) Lineup data (full starting lineup - most reliable for positions)
      for (const b of (relay.homeLineup?.batter || [])) {
        pcodeMap[b.pcode] = { name: b.name, pos: b.posName || b.pos };
      }
      for (const b of (relay.awayLineup?.batter || [])) {
        pcodeMap[b.pcode] = { name: b.name, pos: b.posName || b.pos };
      }
      for (const p of (relay.homeLineup?.pitcher || [])) {
        pcodeMap[p.pcode] = { name: p.name, pos: "투수", style: p.hitType };
      }
      for (const p of (relay.awayLineup?.pitcher || [])) {
        pcodeMap[p.pcode] = { name: p.name, pos: "투수", style: p.hitType };
      }

      // 2) Entry data (includes substitutions that may override lineup)
      for (const p of (relay.homeEntry?.pitcher || [])) {
        pcodeMap[p.pcode] = { name: p.name, pos: "투수", style: p.pitchingStyle };
      }
      for (const p of (relay.awayEntry?.pitcher || [])) {
        pcodeMap[p.pcode] = { name: p.name, pos: "투수", style: p.pitchingStyle };
      }
      for (const b of (relay.homeEntry?.batter || [])) {
        pcodeMap[b.pcode] = { name: b.name, pos: b.pos };
      }
      for (const b of (relay.awayEntry?.batter || [])) {
        pcodeMap[b.pcode] = { name: b.name, pos: b.pos };
      }

      // 3) Extract from textRelays (catches mid-game substitutions)
      const textRelays = relay.textRelays || [];
      const pitcherPcodeMap: Record<string, string> = {};
      for (const tr of textRelays) {
        const title = tr.title || "";
        const batterMatch = title.match(/(\d+)번타자\s+(.+)/);
        for (const opt of (tr.textOptions || [])) {
          const trGs = opt.currentGameState || {};
          const text = opt.text || "";
          if (batterMatch && trGs.batter && !pcodeMap[trGs.batter]) {
            pcodeMap[trGs.batter] = { name: batterMatch[2].trim(), pos: "타자" };
          }
          const pitcherChangeMatch = text.match(/투수\s+(.+?)\s*:\s*투수\s+(.+?)\s*\(?으?\)?로\s*교체/);
          if (pitcherChangeMatch && trGs.pitcher) {
            pitcherPcodeMap[trGs.pitcher] = pitcherChangeMatch[2].trim();
          }
        }
      }
      for (const [pcode, name] of Object.entries(pitcherPcodeMap)) {
        pcodeMap[pcode] = { name, pos: "투수", style: "" };
      }

      // Find current pitcher and batter
      const pitcherInfo = pcodeMap[gs.pitcher];
      const batterInfo = pcodeMap[gs.batter];

      // Defensive team: use LINEUP (full 9-man) as primary, ENTRY as fallback
      const defLineup = isTopInning ? relay.homeLineup : relay.awayLineup;
      const offLineup = isTopInning ? relay.awayLineup : relay.homeLineup;
      const defEntry = isTopInning ? relay.homeEntry : relay.awayEntry;
      const offEntry = isTopInning ? relay.awayEntry : relay.homeEntry;

      // Build defense from lineup (full 9-man, posName field)
      const defense: Record<string, { name: string; pcode: string }> = {};
      for (const b of (defLineup?.batter || [])) {
        const posKey = POS_MAP[b.posName] || POS_MAP[b.pos];
        if (posKey && posKey !== "dh") {
          defense[posKey] = { name: b.name, pcode: b.pcode };
        }
      }
      // Override with entry data (substitutions update positions)
      for (const b of (defEntry?.batter || [])) {
        const posKey = POS_MAP[b.posName] || POS_MAP[b.pos];
        if (posKey && posKey !== "dh") {
          defense[posKey] = { name: b.name, pcode: b.pcode };
        }
      }
      // Current pitcher overrides
      if (pitcherInfo) {
        defense["pitcher"] = { name: pitcherInfo.name, pcode: gs.pitcher };
      }

      // Batting order: prefer lineup (full 9-man), fallback to entry
      // Entry data may contain duplicates (original + substitutes for same batting order),
      // so deduplicate by batOrder keeping the LAST entry (most recent substitute)
      const offBatters = (offLineup?.batter?.length >= 9) ? offLineup.batter : (offEntry?.batter || []);
      const batOrderMap = new Map<number, { order: number; name: string; pos: string; pcode: string }>();
      for (const b of offBatters) {
        const order = parseInt(b.batOrder) || 0;
        batOrderMap.set(order, {
          order,
          name: b.name,
          pos: b.posName || b.pos,
          pcode: b.pcode,
        });
      }
      const battingOrder = Array.from(batOrderMap.values()).sort((a, b) => a.order - b.order);

      const result = {
        gameId,
        inning: relay.inn,
        isTopInning,
        currentPitcher: pitcherInfo ? { name: pitcherInfo.name, pcode: gs.pitcher, style: pitcherInfo.style || "" } : null,
        currentBatter: batterInfo ? { name: batterInfo.name, pcode: gs.batter, pos: batterInfo.pos, hittype: "" } : null,
        count: {
          ball: parseInt(gs.ball) || 0,
          strike: parseInt(gs.strike) || 0,
          out: parseInt(gs.out) || 0,
        },
        bases: {
          first: parseInt(gs.base1) > 0,
          second: parseInt(gs.base2) > 0,
          third: parseInt(gs.base3) > 0,
        },
        defense,
        battingOrder,
        inningScore: relay.inningScore || null,
        matchup: relay.pitcherVsBatterCareerStats || null,
      };

      kboRelayCache[gameId] = { data: result, timestamp: Date.now() };
      res.json(result);
    } catch (error: any) {
      logger.error("KBO relay fetch error", error?.message);
      res.status(500).json({ lineup: null, error: "중계 데이터 조회에 실패했습니다." });
    }
  });

  // ── KBO Live Standings from Naver Sports API ─────────────────────────────
  let kboStandingsCache: { data: any; timestamp: number } | null = null;
  const STANDINGS_CACHE_TTL = 60000; // 1 minute

  // Team code → our internal team ID mapping
  const NAVER_TEAM_MAP: Record<string, string> = {
    "LG": "team-lg", "KT": "team-kt", "SSG": "team-ssg", "SK": "team-ssg",
    "NC": "team-nc", "OB": "team-doo", "두산": "team-doo",
    "HT": "team-kia", "KIA": "team-kia",
    "LT": "team-lot", "롯데": "team-lot",
    "SS": "team-sam", "삼성": "team-sam",
    "HH": "team-han", "한화": "team-han",
    "WO": "team-kiw", "키움": "team-kiw",
  };

  app.get("/api/kbo/standings", async (req, res) => {
    try {
      // Return cached if fresh
      if (kboStandingsCache && kboStandingsCache.timestamp > Date.now() - STANDINGS_CACHE_TTL) {
        return res.json(kboStandingsCache.data);
      }

      const year = new Date().getFullYear();
      const naverUrl = `https://api-gw.sports.naver.com/statistics/categories/kbo/seasons/${year}/teams?gameType=REGULAR_SEASON`;
      const response = await axios.get(naverUrl, {
        timeout: 8000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Referer": "https://m.sports.naver.com/",
          "X-Sports-Backend": "kotlin",
          "Accept": "application/json",
        },
      });

      if (!response.data?.result?.seasonTeamStats) {
        return res.json({ standings: [], year });
      }

      const standings = response.data.result.seasonTeamStats.map((t: any) => ({
        teamId: NAVER_TEAM_MAP[t.teamId] || NAVER_TEAM_MAP[t.teamName] || t.teamId,
        teamName: t.keyword || t.teamName,
        teamCode: t.teamId,
        teamImageUrl: t.teamImageUrl,
        rank: t.ranking,
        wins: t.winGameCount || 0,
        losses: t.loseGameCount || 0,
        draws: t.drawnGameCount || 0,
        games: t.gameCount || 0,
        winRate: t.wra != null ? t.wra.toFixed(3) : ".000",
        gamesBack: t.gameBehind != null ? (t.gameBehind === 0 ? "-" : t.gameBehind.toFixed(1)) : "-",
        streak: t.continuousGameResult || "-",
        last5: t.lastFiveGames || "-",
        era: t.defenseEra != null ? t.defenseEra.toFixed(2) : "-",
        battingAvg: t.offenseHra != null ? t.offenseHra.toFixed(3) : "-",
        runs: t.offenseRun || 0,
        homeRuns: t.offenseHr || 0,
      }));

      const result = { standings, year, gameType: response.data.result.gameType };
      kboStandingsCache = { data: result, timestamp: Date.now() };
      res.json(result);
    } catch (error: any) {
      logger.error("KBO standings fetch error", error?.message);
      res.status(500).json({ standings: [], error: "순위 데이터 조회에 실패했습니다." });
    }
  });

  // ─── KBO Player Photo Proxy ───────────────────────────────────────────────
  // Proxies player photos from Naver Sports CDN to avoid CORS issues
  const playerPhotoCache = new Map<string, { data: Buffer; timestamp: number }>();
  const PHOTO_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  app.get("/api/kbo/player-photo/:pcode", async (req, res) => {
    const { pcode } = req.params;
    if (!/^\d+$/.test(pcode)) {
      return res.status(400).json({ error: "Invalid pcode" });
    }

    try {
      // Return cached if fresh
      const cached = playerPhotoCache.get(pcode);
      if (cached && cached.timestamp > Date.now() - PHOTO_CACHE_TTL) {
        res.set("Content-Type", "image/png");
        res.set("Cache-Control", "public, max-age=86400");
        return res.send(cached.data);
      }

      // 고해상도(500x500) 선수 사진을 Naver search proxy에서 가져옴
      // 기존 default 이미지는 210x262로 너무 작아서 AI가 얼굴 인식 못함
      const originalUrl = `https://sports-phinf.pstatic.net/player/kbo/default/${pcode}.png`;
      const hiResUrl = `https://search.pstatic.net/common?type=f&size=500x500&quality=100&direct=true&src=${encodeURIComponent(originalUrl)}`;

      let buf: Buffer;
      try {
        // 먼저 고해상도 시도
        const hiRes = await axios.get(hiResUrl, {
          responseType: "arraybuffer",
          timeout: 8000,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": "https://m.sports.naver.com/",
          },
        });
        buf = Buffer.from(hiRes.data);
        // 유효한 이미지인지 확인 (최소 1KB)
        if (buf.length < 1024) throw new Error("Too small, likely error image");
        logger.info(`[player-photo] ${pcode}: hi-res 500x500 (${Math.round(buf.length / 1024)}KB)`);
      } catch {
        // fallback: 원본 이미지
        const response = await axios.get(originalUrl, {
          responseType: "arraybuffer",
          timeout: 8000,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": "https://m.sports.naver.com/",
          },
        });
        buf = Buffer.from(response.data);
        logger.info(`[player-photo] ${pcode}: default size (${Math.round(buf.length / 1024)}KB)`);
      }

      playerPhotoCache.set(pcode, { data: buf, timestamp: Date.now() });

      res.set("Content-Type", "image/png");
      res.set("Cache-Control", "public, max-age=86400");
      res.send(buf);
    } catch (error: any) {
      logger.error("Player photo fetch error", error?.message);
      res.status(404).json({ error: "Photo not found" });
    }
  });

  // ─── KBO Team Logo Proxy ────────────────────────────────────────────────
  // Proxies team emblem images from Naver CDN to avoid CORS issues
  const teamLogoCache = new Map<string, { data: Buffer; timestamp: number }>();

  app.get("/api/kbo/team-logo", async (req, res) => {
    const logoUrl = req.query.url as string;
    if (!logoUrl) {
      return res.status(400).json({ error: "Missing url parameter" });
    }

    // Security: only allow whitelisted domains
    try {
      const parsed = new URL(logoUrl);
      const allowed = ["6ptotvmi5753.edge.naverncp.com", "sports-phinf.pstatic.net"];
      if (!allowed.includes(parsed.hostname)) {
        return res.status(403).json({ error: "Domain not allowed" });
      }
    } catch {
      return res.status(400).json({ error: "Invalid URL" });
    }

    try {
      const cached = teamLogoCache.get(logoUrl);
      if (cached && cached.timestamp > Date.now() - PHOTO_CACHE_TTL) {
        res.set("Content-Type", "image/png");
        res.set("Cache-Control", "public, max-age=86400");
        return res.send(cached.data);
      }

      const response = await axios.get(logoUrl, {
        responseType: "arraybuffer",
        timeout: 8000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Referer": "https://m.sports.naver.com/",
        },
      });

      let buf = Buffer.from(response.data);

      // 로고가 너무 작으면(200px 미만) sharp으로 업스케일
      // KBO CDN 로고는 64x41px으로 AI가 인식하기에 너무 작음
      try {
        const { default: sharpFn } = await import("sharp");
        const meta = await sharpFn(buf).metadata();
        if (meta.width && meta.width < 200) {
          buf = await sharpFn(buf)
            .resize(300, 300, { fit: "inside", kernel: "lanczos3" as any })
            .png()
            .toBuffer();
          logger.info(`[team-logo] Upscaled ${meta.width}x${meta.height} → 300px`);
        }
      } catch (upErr) {
        logger.warn("[team-logo] Upscale failed, using original", upErr);
      }

      teamLogoCache.set(logoUrl, { data: buf, timestamp: Date.now() });

      res.set("Content-Type", "image/png");
      res.set("Cache-Control", "public, max-age=86400");
      res.send(buf);
    } catch (error: any) {
      logger.error("Team logo fetch error", error?.message);
      res.status(404).json({ error: "Logo not found" });
    }
  });

  // ─── Weather API (Open-Meteo — free, no key, KMA data source) ─────────────
  const weatherCache = new Map<string, { data: any; ts: number }>();
  const WEATHER_CACHE_TTL = 10 * 60 * 1000; // 10분

  function getKoreanWeather(code: number): { condition: string; icon: string } {
    if (code === 0) return { condition: "맑음", icon: "☀️" };
    if (code === 1) return { condition: "대체로 맑음", icon: "🌤️" };
    if (code === 2) return { condition: "구름 조금", icon: "⛅" };
    if (code === 3) return { condition: "흐림", icon: "☁️" };
    if (code <= 48) return { condition: "안개", icon: "🌫️" };
    if (code <= 55) return { condition: "이슬비", icon: "🌦️" };
    if (code <= 67) return { condition: "비", icon: "🌧️" };
    if (code <= 77) return { condition: "눈", icon: "❄️" };
    if (code <= 82) return { condition: "소나기", icon: "🌦️" };
    if (code <= 86) return { condition: "눈소나기", icon: "🌨️" };
    return { condition: "뇌우", icon: "⛈️" };
  }

  app.get("/api/weather", async (req, res) => {
    const lat = parseFloat(req.query.lat as string) || 37.5665;
    const lon = parseFloat(req.query.lon as string) || 126.978;
    const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;

    const cached = weatherCache.get(cacheKey);
    if (cached && cached.ts > Date.now() - WEATHER_CACHE_TTL) {
      return res.json(cached.data);
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=Asia%2FSeoul&forecast_days=1`;
      const response = await axios.get(url, { timeout: 8000 });
      const c = response.data.current;
      const { condition, icon } = getKoreanWeather(c.weather_code);

      const result = {
        temp: Math.round(c.temperature_2m),
        feelsLike: Math.round(c.apparent_temperature),
        humidity: c.relative_humidity_2m,
        windSpeed: Math.round(c.wind_speed_10m * 10) / 10,
        condition,
        icon,
      };

      weatherCache.set(cacheKey, { data: result, ts: Date.now() });
      res.json(result);
    } catch (error: any) {
      logger.error("Weather fetch error", error?.message);
      res.status(500).json({ error: "날씨 정보를 가져올 수 없습니다" });
    }
  });

  return httpServer;
}
