import { GoogleGenAI } from "@google/genai";

// 개발 모드에서 API 키가 없으면 더미 클라이언트 생성
let ai: GoogleGenAI;
try {
  if (!process.env.AI_INTEGRATIONS_GEMINI_API_KEY) {
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️  Gemini API 키가 설정되지 않았습니다. AI 텍스트 생성 기능이 동작하지 않습니다.");
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
    console.warn("⚠️  Gemini 클라이언트 생성 실패:", error);
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

export async function generateAIPrompt(type: "character" | "pose" | "background", context?: string): Promise<string> {
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
}): Promise<{
  panels: Array<{ top: string; bottom: string; bubbles: Array<{ text: string; style?: string; position?: string }> }>;
}> {
  // 유저가 입력한 포즈/표정/배경/아이템 프롬프트를 AI에게 전달
  const contextLines: string[] = [];
  if (data.posePrompt) contextLines.push(`캐릭터 포즈: ${data.posePrompt}`);
  if (data.expressionPrompt) contextLines.push(`캐릭터 표정: ${data.expressionPrompt}`);
  if (data.backgroundPrompt) contextLines.push(`배경 설정: ${data.backgroundPrompt}`);
  if (data.itemPrompt) contextLines.push(`등장 소품/아이템: ${data.itemPrompt}`);
  const contextBlock = contextLines.length > 0
    ? `\n■ 유저가 지정한 장면 힌트 (반드시 자막/대사에 반영하세요):\n${contextLines.join("\n")}\n`
    : "";

  const prompt = `당신은 한국에서 팔로워 50만 이상의 인기 인스타툰 작가입니다. 실제 인스타그램에 올라가는 인스타툰 자막과 대사를 작성합니다.

■ 주제 분석 (가장 중요!):
주제: "${data.topic}"
→ 이 주제의 핵심 키워드와 감정을 먼저 파악하세요.
→ 모든 패널의 자막과 대사는 반드시 이 주제에서 벗어나면 안 됩니다.
→ 주제와 무관한 뜬금없는 내용, 억지 반전은 절대 금지.

컷 수: ${data.panelCount}
${contextBlock}
■ 자연스러운 한국어 작법 (핵심):
- 실제 사람이 SNS에 올릴 법한 말투로 쓰세요. AI가 쓴 티가 나면 안 됩니다.
- 설명적이거나 딱딱한 문체 금지. "~하였다", "~입니다" 같은 서술체 금지.
- 실제 대화처럼: 줄임말, 감탄사, 말 끊김, 반복, 물음표 남발 OK.
- 좋은 예: "아니 이게 왜...", "하... 또야", "엥?", "이거 실화?", "나만 그런 거 아니지?"
- 나쁜 예: "오늘도 즐거운 하루입니다", "그래서 행복해졌습니다", "이것은 참으로 놀라운 일이었다"
- 자막은 독자가 '아 맞아 나도ㅋㅋ' 하고 공감할 수 있어야 합니다.

■ 구조 규칙:
- top: 상단 나레이션/상황 자막 (3~12자, 짧을수록 좋음). 없으면 "".
- bottom: 하단 독백/감정/부연 자막 (3~12자). 없으면 "".
- top과 bottom 둘 다 쓸 필요 없으면 하나만 쓰고 다른 건 "". 여백이 중요.
- bubbles: 말풍선 배열.
  ★ 대부분 패널은 말풍선 0~1개. 대화 장면만 최대 2개. 3개 이상 절대 금지.
  ★ ${data.panelCount}컷 전체에서 말풍선 총 개수는 ${Math.max(data.panelCount, Math.ceil(data.panelCount * 0.7))}개 이하.
  ★ 나레이션만으로 충분한 컷은 bubbles를 빈 배열 [].
- bubble style: "handwritten"(감성/독백), "linedrawing"(일반 대화), "wobbly"(놀람/강조)
- position: "top-left", "top-right", "bottom-left", "bottom-right", "center" 중 택1.

■ 스토리 구조 (${data.panelCount}컷):
${data.panelCount <= 4 ? `1컷: 일상적 상황 설정 (공감 포인트)
2컷: 사건 발생 또는 기대감
${data.panelCount >= 3 ? `3컷: 갈등 심화 또는 예상 밖 전개` : ""}
${data.panelCount >= 4 ? `4컷: 펀치라인 (웃음/공감/찔림 중 하나)` : `마지막 컷: 펀치라인`}` : `도입(1~2컷) → 전개(중간) → 반전/펀치라인(마지막 컷)
마지막 컷이 가장 중요. "ㅋㅋㅋ" 나올 만한 반전 or "아 맞아..." 공감.`}

■ 참고 예시 (주제: "월요일 아침"):
{"panels":[{"top":"월요병 시작","bottom":"","bubbles":[]},{"top":"","bottom":"","bubbles":[{"text":"5분만...","style":"handwritten","position":"center"}]},{"top":"알람 7번째","bottom":"","bubbles":[{"text":"아 진짜!!","style":"wobbly","position":"top-right"}]},{"top":"","bottom":"결국 지각","bubbles":[]}]}

■ 참고 예시 (주제: "다이어트 중 야식"):
{"panels":[{"top":"다이어트 3일차","bottom":"의지 충만","bubbles":[]},{"top":"밤 11시","bottom":"","bubbles":[{"text":"배고프다...","style":"handwritten","position":"center"}]},{"top":"","bottom":"","bubbles":[{"text":"치킨 한 조각만","style":"linedrawing","position":"top-left"}]},{"top":"","bottom":"한 마리 완식","bubbles":[]}]}

${data.panelCount !== 4 ? `위 예시는 4컷 기준이니, ${data.panelCount}컷에 맞게 조절하세요.\n` : ""}다음 JSON만 출력 (설명 없이):
{"panels":[{"top":"","bottom":"","bubbles":[{"text":"","style":"handwritten","position":"top-right"}]}]}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      temperature: 0.85,
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
  bubbleText: string;         // 한국어 - 말풍선 대사 (없으면 빈 문자열)
}

export async function generateWebtoonSceneBreakdown(data: {
  storyPrompt: string;
  totalCuts: number;
  characterDescriptions?: string[];
}): Promise<{ scenes: WebtoonScene[] }> {
  const charInfo = data.characterDescriptions?.length
    ? `\n등장 캐릭터: ${data.characterDescriptions.join(", ")}`
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
      ? allScenes.slice(-2).map((s, i) => `컷${allScenes.length - 1 + i}: ${s.sceneDescription.slice(0, 60)}`).join("; ")
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
    ? `\n■ 이전 장면 요약 (이어서 작성하세요):\n${prevSummary}\n`
    : "";

  const prompt = `당신은 한국에서 팔로워 50만 이상의 인기 인스타툰 작가이자 스토리보드 전문가입니다.

■ 주제/스토리 (가장 중요! 모든 컷이 이 주제와 직접 연결되어야 함):
스토리: "${storyPrompt}"
${charInfo}

■ 작성 범위:
${roleInstruction}
이번에 작성할 컷 수: ${chunkCuts}
${prevContext}
→ 모든 장면이 "${storyPrompt}" 주제에서 벗어나면 절대 안 됩니다.
→ 주제와 무관한 내용, 뜬금없는 전개 금지.

■ 장면 묘사 (sceneDescription):
- 반드시 영어로 작성 (이미지 AI용)
- 배경, 캐릭터 행동, 구도, 표정을 구체적으로 ("${storyPrompt}" 관련 장면만!)
- "simple line art, webtoon style" 키워드 포함
- 좋은 예: "A girl looking at phone with shocked expression in her bedroom, simple line art, webtoon style"
- 나쁜 예: "A character standing, simple line art, webtoon style" (너무 모호, 주제 무관)

■ 한국어 텍스트:
- narrativeText: 나레이션 (3~15자, 없으면 "")
- bubbleText: 대사 (3~12자, 없으면 "")
- 사람이 쓴 것처럼 자연스럽게. AI 티 금지.
- 좋은 예: "하필 그 순간", "아 왜ㅠ", "이거 실화?", "나만 이래?"
- 나쁜 예: "행복한 하루였습니다" (서술체), "함께하면 즐거워요" (광고체)

■ 참고 예시 (4컷 기준):
{"scenes":[
{"sceneDescription":"A cute cat wearing apron standing behind coffee counter, simple line art, webtoon style","narrativeText":"출근 1일차","bubbleText":""},
{"sceneDescription":"Cat spilling milk everywhere trying to make latte art, simple line art, webtoon style","narrativeText":"","bubbleText":"어... 이게 아닌데"},
{"sceneDescription":"Customer confused at cup with cat paw print in latte, simple line art, webtoon style","narrativeText":"","bubbleText":"이게 라떼아트?"},
{"sceneDescription":"Cat sitting proudly next to 'paw print latte' sign with long customer line, simple line art, webtoon style","narrativeText":"대박 터짐","bubbleText":""}
]}

"${storyPrompt}" 주제에 맞는 ${chunkCuts}컷을 JSON으로만 출력:
{"scenes":[{"sceneDescription":"...","narrativeText":"...","bubbleText":"..."}]}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      temperature: 0.85,
    },
  });

  const candidate = response.candidates?.[0];
  const textPart = candidate?.content?.parts?.find((part: any) => part.text);

  if (!textPart?.text) {
    throw new Error("Failed to generate webtoon scene breakdown");
  }

  const cleanedText = textPart.text.replace(/```json|```/g, '').trim();
  const result = JSON.parse(cleanedText);

  // 장면 수 보정
  if (result.scenes) {
    while (result.scenes.length > chunkCuts) {
      result.scenes.pop();
    }
    while (result.scenes.length < chunkCuts) {
      // 주제 기반 패딩 (generic 이미지 방지)
      result.scenes.push({
        sceneDescription: `scene related to "${storyPrompt}", character reacting in relevant setting, simple line art, webtoon style`,
        narrativeText: "",
        bubbleText: "",
      });
    }
  }

  return result;
}
