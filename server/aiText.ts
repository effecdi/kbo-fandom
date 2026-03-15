import { GoogleGenAI } from "@google/genai";
import { logger } from "./logger";

// 개발 모드에서 API 키가 없으면 더미 클라이언트 생성
let ai: GoogleGenAI;
try {
  if (!process.env.AI_INTEGRATIONS_GEMINI_API_KEY) {
    if (process.env.NODE_ENV === "development") {
      logger.warn("Gemini API 키 미설정 — AI 텍스트 생성 비활성화");
      // 더미 클라이언트 생성 (실제 사용 시 에러 발생)
      ai = new GoogleGenAI({
        apiKey: "dummy-key",
        httpOptions: {
          apiVersion: "",
          baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL || "https://dummy.api",
        },
      });
    } else {
      throw new Error("AI_INTEGRATIONS_GEMINI_API_KEY must be set");
    }
  } else {
    ai = new GoogleGenAI({
      apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
      httpOptions: {
        apiVersion: "",
        baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
      },
    });
  }
} catch (error) {
  if (process.env.NODE_ENV === "development") {
    logger.warn("Gemini 클라이언트 생성 실패", error);
    ai = new GoogleGenAI({
      apiKey: "dummy-key",
      httpOptions: {
        apiVersion: "",
        baseUrl: "https://dummy.api",
      },
    });
  } else {
    throw error;
  }
}

export async function analyzeCharacterImage(imageUrl: string): Promise<string[]> {
  // base64 data URL에서 mimeType과 data 추출
  const match = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid image data URL");
  }

  const parts: any[] = [
    {
      inlineData: {
        mimeType: match[1],
        data: match[2],
      },
    },
    {
      text: `이 이미지에 있는 캐릭터를 분석하여 각 캐릭터에 짧은 한국어 이름/설명을 붙여주세요.
예시: "안경 쓴 여자", "고양이", "남자아이", "로봇"
캐릭터가 하나면 1개, 여러 명이면 각각 따로 이름을 붙여주세요.
다음 JSON 배열만 출력 (설명 없이):
["이름1", "이름2"]`,
    },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts }],
    config: { temperature: 0.3 },
  });

  const candidate = response.candidates?.[0];
  const textPart = candidate?.content?.parts?.find((part: any) => part.text);

  if (!textPart?.text) {
    throw new Error("Failed to analyze character image");
  }

  const cleanedText = textPart.text.replace(/```json|```/g, "").trim();
  const names = JSON.parse(cleanedText);

  if (!Array.isArray(names) || names.length === 0) {
    return ["캐릭터"];
  }

  return names.map((n: any) => String(n).slice(0, 30));
}

export async function generateAIPrompt(type: "character" | "pose" | "background" | "style-detect", context?: string, referenceImageUrl?: string): Promise<string> {
  // Handle style-detect with image analysis
  if (type === "style-detect" && referenceImageUrl) {
    const styleKeys = context || "";
    const parts: any[] = [];

    // Add image if it's a base64 data URL
    if (referenceImageUrl.startsWith("data:image")) {
      const base64Match = referenceImageUrl.match(/^data:image\/(png|jpeg|jpg|gif|webp);base64,(.+)$/);
      if (base64Match) {
        parts.push({
          inlineData: {
            mimeType: `image/${base64Match[1] === "jpg" ? "jpeg" : base64Match[1]}`,
            data: base64Match[2],
          },
        });
      }
    }

    parts.push({
      text: `이 이미지의 그림 스타일을 분석해서 다음 스타일 키 중 가장 가까운 것을 하나만 골라주세요.
스타일 키 목록: ${styleKeys}
반드시 위 목록에 있는 키 중 하나만 그대로 출력해주세요. 다른 설명 없이 키 이름만 출력:`,
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts }],
      config: { temperature: 0.2 },
    });
    const candidate = response.candidates?.[0];
    const textPart = candidate?.content?.parts?.find((part: any) => part.text);
    return textPart?.text?.trim() || "auto";
  }

  const prompts: Record<string, string> = {
    character: `인스타툰 캐릭터 설명을 10~20자로 아주 짧게 1개 생성해줘.
예시: "큰 안경 쓴 뚱뚱한 고양이", "베레모 쓴 곱슬머리 소녀", "망토 입은 아기 용"
텍스트만 출력 (따옴표, 설명 없이):`,

    pose: `당신은 인스타툰(인스타그램 웹툰) 포즈/표정 전문가입니다.
${context ? `캐릭터 정보: ${context}\n` : ""}
캐릭터의 재미있고 매력적인 포즈나 표정을 묘사하는 프롬프트를 한국어로 1개 생성해주세요.

가이드:
- 구체적인 포즈와 표정을 함께 묘사
- 인스타툰에서 자주 쓰이는 감정 표현 포함
- 20~40자 정도의 간결한 설명
- 다양한 상황: 일상, 감정 표현, 리액션 등

프롬프트만 작성해주세요 (따옴표나 추가 설명 없이 순수 텍스트만):`,

    background: (() => {
      // 장소 카테고리를 매번 랜덤 순서로 섞어 LLM 편향 방지
      const places = [
        "공원", "방/침실", "거리/골목", "계절 풍경", "학교/교실",
        "편의점", "지하철/버스", "옥상", "놀이공원", "도서관",
        "해변", "숲/산", "야시장", "카페", "운동장", "영화관",
        "미술관", "꽃밭", "비 오는 거리", "눈 오는 마을",
      ];
      for (let j = places.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [places[j], places[k]] = [places[k], places[j]];
      }
      const placeHint = places.slice(0, 6).join(", ");
      return `당신은 인스타툰(인스타그램 웹툰) 배경/아이템 전문가입니다.
${context ? `주제/스토리: ${context}\n위 주제에 어울리는 배경과 소품을 묘사하는 프롬프트를 한국어로 생성해주세요.` : "인스타툰 캐릭터에 어울리는 배경과 소품을 묘사하는 프롬프트를 한국어로 생성해주세요."}

다음 JSON 형식으로만 응답해주세요 (다른 설명 없이 순수 JSON만):
{
  "background": "배경 설명 (20~40자)",
  "items": "소품/아이템 설명 (10~30자)"
}

가이드:
${context ? `- 반드시 주제/스토리에 맞는 배경과 소품을 추천\n- 주제의 분위기와 상황에 적합한 장소 선택` : `- 인스타툰에 적합한 귀엽고 아기자기한 배경`}
- 배경과 어울리는 소품을 함께 추천
- 매번 완전히 다른 장소를 추천 (이전과 절대 중복하지 마세요)
- MZ세대 감성의 트렌디한 장소
${context ? "" : `- 이번에 참고할 장소 힌트 (이 중에서 창의적으로 선택): ${placeHint}`}`;
    })(),
  };

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompts[type] }] }],
    config: {
      temperature: type === "background" ? 1.5 : 1.0,
    },
  });

  const candidate = response.candidates?.[0];
  const textPart = candidate?.content?.parts?.find((part: any) => part.text);

  if (!textPart?.text) {
    throw new Error("Failed to generate AI prompt");
  }

  const raw = textPart.text.trim().replace(/^["']|["']$/g, "");
  const cleaned = raw.replace(/```json|```/g, "").trim();
  return cleaned;
}

export async function analyzeAdMatch(data: {
  genre: string;
  followers: string;
  ageGroup: string;
  contentStyle: string;
  postFrequency: string;
  engagement: string;
}): Promise<{
  recommendations: Array<{
    category: string;
    brands: string[];
    matchScore: number;
    reason: string;
    expectedCPM: string;
  }>;
  insights: string;
}> {
  const prompt = `당신은 인스타툰 크리에이터와 광고주를 매칭하는 전문가입니다. 다음 인스타툰 정보를 분석하여 적합한 광고주 3개를 추천해주세요.

인스타툰 정보:
- 장르: ${data.genre}
- 팔로워 수: ${data.followers}명
- 주요 연령층: ${data.ageGroup}
- 콘텐츠 스타일: ${data.contentStyle}
- 포스팅 빈도: 주 ${data.postFrequency}회
- 평균 참여율: ${data.engagement}%

다음 JSON 형식으로만 응답해주세요 (다른 설명 없이 순수 JSON만):
{
  "recommendations": [
    {
      "category": "광고주 카테고리",
      "brands": ["브랜드1", "브랜드2", "브랜드3"],
      "matchScore": 95,
      "reason": "추천 이유 (1-2문장)",
      "expectedCPM": "예상 CPM 범위"
    }
  ],
  "insights": "전체적인 인사이트 (2-3문장)"
}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const candidate = response.candidates?.[0];
  const textPart = candidate?.content?.parts?.find((part: any) => part.text);

  if (!textPart?.text) {
    throw new Error("Failed to generate ad match analysis");
  }

  const cleanedText = textPart.text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleanedText);
  return parsed;
}

export async function enhanceBio(data: {
  bio: string;
  profileName: string;
  category: string;
  followers?: string;
  engagement?: string;
}): Promise<string> {
  const prompt = `당신은 인스타그램 인스타툰 크리에이터의 미디어킷 전문 작성가입니다. 
크리에이터가 간단히 작성한 자기소개를 기반으로, 광고주에게 매력적으로 어필할 수 있는 전문적이고 세련된 소개문을 한국어로 작성해주세요.

크리에이터 정보:
- 이름: ${data.profileName || "미입력"}
- 카테고리: ${data.category || "미입력"}
- 팔로워: ${data.followers ? data.followers + "명" : "미입력"}
- 참여율: ${data.engagement ? data.engagement + "%" : "미입력"}

크리에이터가 작성한 간단한 소개:
"${data.bio}"

작성 가이드:
1. 크리에이터의 강점과 콘텐츠 특징을 부각시켜주세요
2. 광고주 관점에서 매력적인 협업 포인트를 강조해주세요
3. 전문적이면서도 친근한 톤을 유지해주세요
4. 3~5문장 정도로 작성해주세요
5. 숫자나 통계가 있다면 자연스럽게 포함해주세요

소개문만 작성해주세요 (따옴표나 추가 설명 없이 순수 텍스트만):`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const candidate = response.candidates?.[0];
  const textPart = candidate?.content?.parts?.find((part: any) => part.text);

  if (!textPart?.text) {
    throw new Error("Failed to enhance bio");
  }

  return textPart.text.trim().replace(/^["']|["']$/g, '');
}

export async function generateStoryScripts(data: {
  topic: string;
  panelCount: number;
  posePrompt?: string;
  expressionPrompt?: string;
  itemPrompt?: string;
  backgroundPrompt?: string;
  characterNames?: string[];
}): Promise<{
  panels: Array<{ top: string; bottom: string; bubbles: Array<{ text: string; style?: string; position?: string }> }>;
}> {
  // 유저가 입력한 포즈/표정/배경/아이템 프롬프트를 AI에게 전달
  const contextLines: string[] = [];
  if (data.characterNames?.length) contextLines.push(`등장 캐릭터 이름: ${data.characterNames.join(", ")}`);
  if (data.posePrompt) contextLines.push(`캐릭터 포즈: ${data.posePrompt}`);
  if (data.expressionPrompt) contextLines.push(`캐릭터 표정: ${data.expressionPrompt}`);
  if (data.backgroundPrompt) contextLines.push(`배경 설정: ${data.backgroundPrompt}`);
  if (data.itemPrompt) contextLines.push(`등장 소품/아이템: ${data.itemPrompt}`);
  const contextBlock = contextLines.length > 0
    ? `\n■ 유저가 지정한 장면 힌트 (반드시 자막/대사에 반영하세요):\n${contextLines.join("\n")}\n`
    : "";

  const prompt = `당신은 한국 팔로워 50만 인기 인스타툰 작가입니다. 실제 인스타그램에 올라가는 인스타툰 자막과 대사를 작성합니다.

■ 주제 분석 (가장 중요!):
주제: "${data.topic}"
→ 이 주제의 핵심 키워드와 감정을 먼저 파악하세요.
→ 모든 패널의 자막과 대사는 반드시 이 주제에서 벗어나면 안 됩니다.
→ 주제와 무관한 뜬금없는 내용, 억지 반전은 절대 금지.

컷 수: ${data.panelCount}
${contextBlock}
■ 진짜 사람이 쓴 것 같은 한국어 (핵심 중의 핵심):
인스타툰은 독자가 "아 이거 나야ㅋㅋ" 하고 공감하거나, "ㅋㅋㅋㅋ" 웃거나, "아... 맞는 말이네" 찔리거나, "와 이게 뭐야" 빠져드는 콘텐츠입니다.
- 감정을 과장하고 솔직하게: "하... 또야", "아니 진짜ㅋㅋ", "어... 이게 아닌데", "(동공 지진)"
- 독백과 내면의 목소리: "나... 똥손이었네...", "괜찮아 괜찮아 (안 괜찮음)"
- 실제 대화체: 줄임말, 감탄사, 말 끊김, 의성어, 이모티콘 느낌 OK
- 문장 끝에 "(두근두근)", "(멘붕)", "(현실 부정)" 같은 감정 태그도 좋음
- 서술체/설명체 절대 금지: "~하였다", "~입니다", "~해요" 금지
- 광고체 금지: "함께하면 즐거워요", "행복한 하루가 되세요"

■ 구조 규칙:
- top: 상단 나레이션/상황 자막. 시간, 장소, 상황 설명, 독백. 5~40자. 없으면 "".
- bottom: 하단 부연/감정/반전 자막. 5~40자. 없으면 "".
- top과 bottom 둘 다 쓸 필요 없으면 하나만 쓰고 다른 건 "". 여백이 중요.
- bubbles: 말풍선 배열.
  ★ 대부분 패널은 말풍선 0~1개. 대화 장면만 최대 2개. 3개 이상 절대 금지.
  ★ ${data.panelCount}컷 전체에서 말풍선 총 개수는 ${Math.max(data.panelCount, Math.ceil(data.panelCount * 0.7))}개 이하.
  ★ 나레이션만으로 충분한 컷은 bubbles를 빈 배열 [].
  ★ 말풍선 대사는 5~40자. 캐릭터의 성격과 감정이 묻어나야 함.
- bubble style: "handwritten"(감성/독백/혼잣말), "linedrawing"(일반 대화), "wobbly"(놀람/강조/충격)
- position: "top-left", "top-right", "bottom-left", "bottom-right", "center" 중 택1.

■ 스토리 구조 (${data.panelCount}컷):
${data.panelCount <= 4 ? `1컷: 상황 설정 — 캐릭터 소개, 배경 설명, 공감 포인트
2컷: 기대감 또는 행동 시작 — 동기 부여, "이거 해볼까?" 순간
${data.panelCount >= 3 ? `3컷: 현실의 벽 또는 예상 밖 전개 — 갈등, 멘붕, 반전` : ""}
${data.panelCount >= 4 ? `4컷: 펀치라인 — 웃음/공감/찔림/감동 중 하나로 마무리` : `마지막 컷: 펀치라인`}` : `도입(1~2컷) → 전개(중간) → 위기/갈등 → 반전/펀치라인(마지막 컷)
각 컷마다 감정의 온도가 달라야 합니다. 단조로운 진행 금지.
마지막 컷이 가장 중요. 독자가 스크린샷 찍고 싶은 컷이어야 합니다.`}

■ 참고 예시 (주제: "답답해서 직접 만든 9년 차 디자이너의 AI 인스타툰 생존기", 7컷):
{"panels":[
{"top":"","bottom":"","bubbles":[{"text":"디자인? 코딩? 훗, 까이꺼 다 할 수 있지!","style":"linedrawing","position":"top-right"}]},
{"top":"작년 12월 프로젝트 종료!","bottom":"결혼 3개월 차 새댁에게 찾아온 달콤한 잉여 시간.","bubbles":[{"text":"좋아, 남는 시간에 나도 요즘 대세라는 인스타툰이나 그려볼까? (두근두근)","style":"handwritten","position":"bottom-right"}]},
{"top":"...는 무슨.","bottom":"","bubbles":[{"text":"잠깐, 팔이 어떻게 꺾이는 거지? 우는 표정은 어떻게 그려?! (동공 지진)","style":"wobbly","position":"top-right"}]},
{"top":"","bottom":"웹디자인 9년 짬바가 무색하게, 일러스트 앞에서는 한없이 작아지는 나.","bubbles":[{"text":"나... 디자인만 할 줄 아는 똥손이었네...","style":"handwritten","position":"center"}]},
{"top":"포기하려던 찰나, 퍼블리셔의 직업병이 도졌다.","bottom":"","bubbles":[{"text":"아니, 그리기 어려우면... 그냥 알아서 그려지게 만들면 되는 거 아냐?!","style":"wobbly","position":"center"}]},
{"top":"","bottom":"그래서 답답해서 직접 만들었습니다. 인스타툰 자동화 메이커!","bubbles":[{"text":"내가 못 그리면 AI가 그리게 하겠어! 가자, 올리!","style":"linedrawing","position":"top-right"}]},
{"top":"9년 차 디자이너의 험난한 인스타툰 도전기!","bottom":"","bubbles":[{"text":"AI 멱살 잡고 연재하는 썰, 앞으로 기대해 주세요! (팔로우 꾸욱-)","style":"handwritten","position":"center"}]}
]}

■ 참고 예시 (주제: "다이어트 중 야식의 유혹", 4컷):
{"panels":[
{"top":"다이어트 3일 차. 의지 충만.","bottom":"","bubbles":[{"text":"이번엔 진짜야. 여름까지 -5kg 간다!","style":"linedrawing","position":"top-right"}]},
{"top":"밤 11시. 배에서 꼬르륵.","bottom":"","bubbles":[{"text":"...참아. 물 마시면 돼. 물이면 충분해.","style":"handwritten","position":"center"}]},
{"top":"","bottom":"","bubbles":[{"text":"치킨은 단백질이니까 다이어트 식품 아닌가? (합리화 시작)","style":"wobbly","position":"center"}]},
{"top":"","bottom":"결국 양념 반 후라이드 반. 콜라는 제로니까 괜찮아. (안 괜찮음)","bubbles":[]}
]}

${data.panelCount !== 4 && data.panelCount !== 7 ? `위 예시를 참고하되, ${data.panelCount}컷에 맞게 조절하세요.\n` : ""}다음 JSON만 출력 (설명 없이):
{"panels":[{"top":"","bottom":"","bubbles":[{"text":"","style":"handwritten","position":"top-right"}]}]}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      temperature: 0.95,
    },
  });

  const candidate = response.candidates?.[0];
  const textPart = candidate?.content?.parts?.find((part: any) => part.text);

  if (!textPart?.text) {
    throw new Error("Failed to generate story scripts");
  }

  const cleanedText = textPart.text.replace(/```json|```/g, '').trim();
  const result = JSON.parse(cleanedText);

  // Post-process: enforce max 2 bubbles per panel
  if (result.panels) {
    for (const panel of result.panels) {
      if (panel.bubbles && panel.bubbles.length > 2) {
        panel.bubbles = panel.bubbles.slice(0, 2);
      }
    }
  }

  return result;
}

export async function suggestStoryTopics(genre?: string): Promise<string[]> {
  const genreHint = genre ? `장르 힌트: ${genre}\n` : "";
  const prompt = `당신은 팔로워 50만 인스타툰 작가입니다. 실제 인기 인스타툰에서 다루는 주제를 추천하세요.
${genreHint}
■ 조건:
- MZ세대(20~30대)가 "아 이거 나야ㅋㅋ" 하고 공감할 구체적 상황
- 추상적이지 않고 구체적인 상황이어야 함
- 좋은 예: "새벽 2시 치킨 시킬까 말까 고민", "면접 끝나고 기억나는 실수들"
- 나쁜 예: "일상의 소소한 행복" (너무 추상적), "사랑의 의미" (너무 모호)
- 5개 모두 서로 다른 카테고리 (일상/직장/연애/음식/계절 등)

다음 JSON만 출력:
["주제1", "주제2", "주제3", "주제4", "주제5"]`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const candidate = response.candidates?.[0];
  const textPart = candidate?.content?.parts?.find((part: any) => part.text);

  if (!textPart?.text) {
    throw new Error("Failed to suggest topics");
  }

  const cleanedText = textPart.text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleanedText);
}

export interface WebtoonScene {
  sceneDescription: string;   // 영어 - 이미지 생성용
  narrativeText: string;      // 한국어 - 나레이션 자막
  bubbleText: string;         // 한국어 - 레거시 호환 (빈 문자열)
  bubbles: Array<{ text: string; style?: string; position?: string }>;
}

export async function generateWebtoonSceneBreakdown(data: {
  storyPrompt: string;
  totalCuts: number;
  characterDescriptions?: string[];
}): Promise<{ scenes: WebtoonScene[] }> {
  const charInfo = data.characterDescriptions?.length
    ? `\n등장 캐릭터 이름 (※ 이것은 캐릭터 고유 이름이며, 스토리 제목이 아닙니다): ${data.characterDescriptions.join(", ")}\n→ sceneDescription에서 캐릭터를 지칭할 때 반드시 위 이름을 사용하세요. 스토리 제목과 캐릭터 이름을 혼동하지 마세요.`
    : "";

  // 8컷 이하: 한 번에 생성, 9컷 이상: 청크 분할 생성 (주제 정확도 유지)
  const CHUNK_THRESHOLD = 8;

  if (data.totalCuts <= CHUNK_THRESHOLD) {
    return generateSceneChunk(data.storyPrompt, charInfo, data.totalCuts, data.totalCuts, "full");
  }

  // 대량 컷: 스토리 구조를 분할하여 각 청크마다 AI 호출
  const chunks: { cuts: number; role: "full" | "intro" | "middle" | "outro"; prevSummary: string }[] = [];
  const introCount = Math.min(2, Math.ceil(data.totalCuts * 0.2));
  const outroCount = Math.min(2, Math.ceil(data.totalCuts * 0.15));
  const middleCount = data.totalCuts - introCount - outroCount;

  chunks.push({ cuts: introCount, role: "intro", prevSummary: "" });

  // 중간부를 최대 6컷씩 분할
  const midChunkSize = 6;
  let remaining = middleCount;
  while (remaining > 0) {
    const c = Math.min(remaining, midChunkSize);
    chunks.push({ cuts: c, role: "middle", prevSummary: "" });
    remaining -= c;
  }

  chunks.push({ cuts: outroCount, role: "outro", prevSummary: "" });

  const allScenes: WebtoonScene[] = [];
  for (const chunk of chunks) {
    // 이전 장면 요약을 다음 청크에 전달 → 일관성 유지
    const prevSummary = allScenes.length > 0
      ? allScenes.slice(-2).map((s, i) => `컷${allScenes.length - 1 + i}: ${s.sceneDescription.slice(0, 200)}`).join("; ")
      : "";

    const result = await generateSceneChunk(
      data.storyPrompt, charInfo, chunk.cuts, data.totalCuts, chunk.role, prevSummary
    );
    allScenes.push(...result.scenes);
  }

  // 최종 보정
  while (allScenes.length > data.totalCuts) allScenes.pop();
  while (allScenes.length < data.totalCuts) {
    allScenes.push({
      sceneDescription: `scene related to "${data.storyPrompt}", character in relevant setting, simple line art, webtoon style`,
      narrativeText: "",
      bubbleText: "",
      bubbles: [],
    });
  }

  return { scenes: allScenes };
}

async function generateSceneChunk(
  storyPrompt: string,
  charInfo: string,
  chunkCuts: number,
  totalCuts: number,
  role: "full" | "intro" | "middle" | "outro",
  prevSummary?: string,
): Promise<{ scenes: WebtoonScene[] }> {

  const roleInstruction = {
    full: `전체 ${totalCuts}컷을 기승전결 구조로 작성하세요.`,
    intro: `전체 ${totalCuts}컷 중 도입부 ${chunkCuts}컷을 작성하세요. 상황 설정과 공감 포인트를 잡아주세요.`,
    middle: `전체 ${totalCuts}컷 중 전개부 ${chunkCuts}컷을 작성하세요. 이야기를 발전시키고 긴장감이나 재미를 더하세요.`,
    outro: `전체 ${totalCuts}컷 중 결말부 ${chunkCuts}컷을 작성하세요. 반드시 웃기거나 공감되는 펀치라인으로 마무리!`,
  }[role];

  const prevContext = prevSummary
    ? `\n■ 이전 장면 요약 (이어서 작성하세요):\n${prevSummary}\n→ 각 장면은 이전 장면에서 자연스럽게 이어져야 합니다. 캐릭터의 행동과 감정이 연속적으로 전환되도록 하세요.\n`
    : "";

  const prompt = `당신은 한국 팔로워 50만 인기 인스타툰 작가이자 스토리보드 전문가입니다.

■ 주제/스토리 (가장 중요! 모든 컷이 이 주제와 직접 연결되어야 함):
스토리: "${storyPrompt}"
${charInfo}

■ 작성 범위:
${roleInstruction}
이번에 작성할 컷 수: ${chunkCuts}
${prevContext}
★★★ 최우선 규칙 ★★★
→ 모든 장면이 "${storyPrompt}" 주제에서 벗어나면 절대 안 됩니다.
→ 주제와 무관한 내용, 뜬금없는 전개 금지.
→ 각 컷의 sceneDescription, narrativeText, bubbleText 모두 "${storyPrompt}" 주제와 직접 관련되어야 합니다.
→ 주제의 핵심 키워드가 각 컷에 반드시 반영되어야 합니다.
→ ★ 스토리 제목("${storyPrompt}")과 캐릭터 이름은 전혀 다른 것입니다! 절대 혼동하지 마세요.${charInfo ? `\n→ ${charInfo.trim()}` : ""}

■ 장면 묘사 (sceneDescription) — 한국어:
- 캐릭터의 행동, 표정, 포즈만 구체적으로 묘사
- 배경/환경/장소/가구/방 묘사를 절대 포함하지 마세요 (배경은 별도 처리됨)
- ★★★ 캐릭터 외형(머리색, 머리 스타일, 옷, 안경 등)을 sceneDescription에 절대 쓰지 마세요! 외형은 레퍼런스 이미지에서 가져옵니다. 행동/표정/포즈/구도만 쓰세요.
- ★★★ 캐릭터를 지칭할 때는 "캐릭터" 또는 등장인물의 고유 이름만 사용하세요. "30대 여성", "여자", "갈색 머리 캐릭터" 등 외형 기반 지칭 금지!
- 좋은 예: "캐릭터, 그래픽 태블릿 펜을 들고 땀을 뻘뻘 흘리며 눈이 휘둥그레진 표정"
- 나쁜 예: "30대 여성, 갈색 웨이브 머리에 둥근 안경을 쓴 캐릭터" (외형 묘사 포함 — 금지!)
- 나쁜 예: "캐릭터가 모던한 사무실에 서있다" (배경 묘사 포함 — 금지)
- 감정이 눈에 보이게: "땀을 뻘뻘 흘리며 눈이 휘둥그레진 표정" / "자신감 넘치는 미소로 안경을 밀어 올리며"
- 구도 지정: "클로즈업", "전신", "뒷모습" 등
- 각 컷이 주제 "${storyPrompt}"와 어떻게 연결되는지 명확해야 합니다

■ 핸드폰/SNS 장면 연출 (매우 중요!):
주제에 카카오톡, 인스타그램, 문자, DM, SNS, 메신저, 핸드폰 사용 등이 포함되면:
- 해당 컷의 sceneDescription에 반드시 "핸드폰 화면이 크게 보이는 구도" 또는 "핸드폰을 들고 화면을 보여주는 구도"를 포함
- 핵심 메시지/대화 내용이 중요한 컷은: "핸드폰 화면 클로즈업, 채팅창에 메시지가 보이는 구도" 처럼 화면만 보여주기
- 캐릭터가 핸드폰을 보는 장면은: "캐릭터가 핸드폰을 들고 화면을 보며 [표정] 표정, 핸드폰 화면이 함께 보이는 구도"
- 예시: "여성 캐릭터, 침대에 엎드려 핸드폰을 들고 채팅창을 보며 설레는 미소, 핸드폰 화면에 하트 이모지 채팅이 보임"
- 예시: "핸드폰 화면 클로즈업, 인스타그램 DM 알림이 떠있는 화면, 하트 반응과 메시지가 보임"
- 예시: "캐릭터 옆에 핸드폰 화면이 크게 떠있는 구도, 카카오톡 채팅방에 읽씹당한 메시지가 보임"

■ 한국어 텍스트 — 진짜 사람이 쓴 것처럼:
- narrativeText: 상황 설명, 시간, 독백, 감정 부연 (5~40자). 없으면 "".
  좋은 예: "프리랜서 디자이너 겸 퍼블리셔 9년 차.", "포기하려던 찰나, 퍼블리셔의 직업병이 도졌다.", "...는 무슨."
- bubbles: 말풍선 배열. 각 말풍선은 {text, style, position} 객체.
  ★ 대부분 컷은 말풍선 0~1개. 대화 장면만 최대 2개. 3개 이상 절대 금지.
  ★ ${totalCuts}컷 전체에서 말풍선 총 개수는 ${Math.max(totalCuts, Math.ceil(totalCuts * 0.7))}개 이하.
  ★ 나레이션만으로 충분한 컷은 bubbles를 빈 배열 [].
  ★ 말풍선 대사(text)는 5~40자. 캐릭터의 성격과 감정이 묻어나야 함.
  ★ 말풍선 대사는 narrativeText와 반드시 다른 내용이어야 합니다. 같은 내용 복사 금지!
  ★ 말풍선 대사는 "${storyPrompt}" 주제와 직접 관련된 대사여야 합니다.
- bubble style: "handwritten"(감성/독백/혼잣말), "linedrawing"(일반 대화), "wobbly"(놀람/강조/충격)
- position: "top-left", "top-right", "bottom-left", "bottom-right", "center" 중 택1.
- 괄호 감정 태그 절대 금지: "(두근두근)", "(동공 지진)", "(멘붕)", "(흐믓)" 같은 괄호 표현을 대사에 넣지 마세요
- 서술체/광고체 절대 금지. SNS에 올릴 법한 말투로.
- AI가 쓴 티 나면 실패.

★ 중요: 이미지에는 말풍선이 그려지지 않습니다. bubbles와 narrativeText는 이미지 위에 별도로 오버레이됩니다. 따라서 반드시 텍스트를 충실하게 작성해주세요!

■ 참고 예시 (주제: "답답해서 직접 만든 9년 차 디자이너의 AI 인스타툰 생존기", 7컷):
★ 아래 예시에서 캐릭터 외형(머리색, 안경, 옷 등)이 없고, 행동/표정/포즈만 있는 점에 주목하세요!
{"scenes":[
{"sceneDescription":"캐릭터, 모니터 여러 대 앞에서 자신감 넘치는 미소로 빠르게 타이핑하는 모습","narrativeText":"프리랜서 디자이너 겸 퍼블리셔 9년 차.","bubbles":[{"text":"디자인? 코딩? 훗, 까이꺼 다 할 수 있지!","style":"linedrawing","position":"top-right"}]},
{"sceneDescription":"캐릭터, 소파에 편하게 누워 귤을 먹으며 행복한 표정, 몽글몽글한 눈빛","narrativeText":"작년 12월 프로젝트 종료! 결혼 3개월 차 새댁에게 찾아온 달콤한 잉여 시간.","bubbles":[{"text":"좋아, 남는 시간에 나도 요즘 대세라는 인스타툰이나 그려볼까?","style":"handwritten","position":"bottom-right"}]},
{"sceneDescription":"캐릭터, 책상에 앉아 그래픽 태블릿 펜을 들고 땀을 뻘뻘 흘리며 눈이 휘둥그레진 당황한 표정","narrativeText":"...는 무슨.","bubbles":[{"text":"잠깐, 팔이 어떻게 꺾이는 거지? 우는 표정은 어떻게 그려?!","style":"wobbly","position":"top-right"}]},
{"sceneDescription":"캐릭터 클로즈업, 반쯤 감긴 눈, 머리를 감싸 쥐고 축 처진 자세, 절망적인 표정","narrativeText":"웹디자인 9년 짬바가 무색하게, 일러스트 앞에서는 한없이 작아지는 나.","bubbles":[{"text":"나... 디자인만 할 줄 아는 똥손이었네...","style":"handwritten","position":"center"}]},
{"sceneDescription":"캐릭터 클로즈업, 날카롭게 빛나는 눈, 강렬한 집중력, 머리 위에 빛나는 전구","narrativeText":"포기하려던 찰나, 퍼블리셔의 직업병이 도졌다.","bubbles":[{"text":"아니, 그리기 어려우면... 그냥 알아서 그려지게 만들면 되는 거 아냐?!","style":"wobbly","position":"center"}]},
{"sceneDescription":"캐릭터, 키보드를 미친 듯이 타이핑, 매드 사이언티스트 같은 활짝 웃는 표정, 옆에 귀여운 로봇 곰 마스코트가 튀어나옴","narrativeText":"그래서 답답해서 직접 만들었습니다. 인스타툰 자동화 메이커!","bubbles":[{"text":"내가 못 그리면 AI가 그리게 하겠어! 가자, 올리!","style":"linedrawing","position":"top-right"}]},
{"sceneDescription":"캐릭터, 자신감 넘치게 서서 손을 흔드는 모습, 옆에 귀여운 로봇 곰 마스코트가 함께 손 흔듦","narrativeText":"9년 차 디자이너의 험난한 인스타툰 도전기!","bubbles":[{"text":"AI 멱살 잡고 연재하는 썰, 앞으로 기대해 주세요!","style":"handwritten","position":"center"}]}
]}

■ 참고 예시 (주제: "짝사랑 상대한테 카톡 답장 기다리는 중", 4컷):
{"scenes":[
{"sceneDescription":"캐릭터, 핸드폰을 양손으로 꽉 쥐고 화면을 노려보는 모습, 눈이 초롱초롱, 기대감 가득한 표정","narrativeText":"용기 내서 보낸 카톡, 3분 전.","bubbles":[{"text":"읽었으려나...?","style":"handwritten","position":"top-right"}]},
{"sceneDescription":"핸드폰 화면 클로즈업, 카카오톡 채팅방 화면, '읽음 1' 표시가 보이는 내 메시지, 상대방 답장은 아직 없음","narrativeText":"읽음 1... 근데 답장은?","bubbles":[{"text":"제발 답장 좀...!","style":"linedrawing","position":"center"}]},
{"sceneDescription":"캐릭터, 핸드폰을 들고 화면을 보며 멘붕 표정, 눈이 하얗게 비어있음, 입이 벌어진 충격 표정, 옆에 핸드폰 화면이 크게 보이며 '읽씹' 상태","narrativeText":"읽고 20분째 답장 없음.","bubbles":[{"text":"아 읽씹이야 이거...?!","style":"wobbly","position":"center"}]},
{"sceneDescription":"캐릭터, 이불 속에 파묻혀 핸드폰을 꼭 안고 눈만 빼꼼 내밀고 있는 모습, 핸드폰 화면에 알림 하나 떠있음","narrativeText":"","bubbles":[{"text":"그냥 바쁜 거겠지... 응 바쁜 거야 분명...","style":"handwritten","position":"bottom-right"}]}
]}

"${storyPrompt}" 주제에 맞는 ${chunkCuts}컷을 JSON으로만 출력:
{"scenes":[{"sceneDescription":"...","narrativeText":"...","bubbles":[{"text":"...","style":"handwritten","position":"top-right"}]}]}`;

  let response: any;
  try {
    response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 0.75,
      },
    });
  } catch (apiErr: any) {
    logger.error(`Gemini API call failed — ${apiErr.message || apiErr}`);
    throw new Error(`Failed to generate webtoon scene breakdown (API error: ${apiErr.message})`);
  }

  const candidate = response.candidates?.[0];
  const textPart = candidate?.content?.parts?.find((part: any) => part.text);

  if (!textPart?.text) {
    const blockReason = candidate?.finishReason || "unknown";
    const safetyRatings = JSON.stringify(candidate?.safetyRatings || []);
    logger.error(`Gemini empty response — finishReason: ${blockReason}, safety: ${safetyRatings}, candidates: ${response.candidates?.length || 0}`);
    throw new Error(`Failed to generate webtoon scene breakdown (reason: ${blockReason})`);
  }

  const cleanedText = textPart.text.replace(/```json|```/g, '').trim();
  const result = JSON.parse(cleanedText);

  // 장면 수 보정 + 괄호 감정 태그 제거 + bubbles 배열 정규화
  if (result.scenes) {
    for (const scene of result.scenes) {
      if (scene.narrativeText) {
        scene.narrativeText = scene.narrativeText.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
      }
      // bubbles 배열 정규화 (레거시 bubbleText → bubbles 변환)
      if (!Array.isArray(scene.bubbles)) {
        if (scene.bubbleText) {
          scene.bubbles = [{ text: scene.bubbleText.replace(/\s*\([^)]*\)\s*/g, ' ').trim(), style: "linedrawing", position: "center" }];
        } else {
          scene.bubbles = [];
        }
      }
      // 괄호 감정 태그 제거 + max 2 bubbles 제한
      scene.bubbles = scene.bubbles.slice(0, 2).map((b: any) => ({
        text: (b.text || "").replace(/\s*\([^)]*\)\s*/g, ' ').trim(),
        style: b.style || "linedrawing",
        position: b.position || "center",
      })).filter((b: any) => b.text);
      // 레거시 호환: bubbleText는 첫 번째 bubble text
      scene.bubbleText = scene.bubbles[0]?.text || "";
    }
    while (result.scenes.length > chunkCuts) {
      result.scenes.pop();
    }
    while (result.scenes.length < chunkCuts) {
      result.scenes.push({
        sceneDescription: `"${storyPrompt}" 주제와 관련된 캐릭터 장면`,
        narrativeText: "",
        bubbleText: "",
        bubbles: [],
      });
    }
  }

  return result;
}
