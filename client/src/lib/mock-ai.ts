/**
 * Mock AI API for simulating generation workflows.
 * These functions mimic real API calls with realistic delays and mock responses.
 */

import type { CopilotContext } from "./workspace-types";

// ─── Mock response templates ────────────────────────────────────────────────

const STORY_TEMPLATES = [
  {
    title: "카페에서 생긴 일",
    scenes: [
      "주인공이 카페에 들어선다",
      "메뉴를 고르다가 옆 사람과 눈이 마주친다",
      "우연히 같은 음료를 주문한다",
      "미소를 교환하며 마무리",
    ],
  },
  {
    title: "월요일 아침",
    scenes: [
      "알람이 울리지만 이불 밖은 위험하다",
      "겨우 일어나 거울을 본다 - 충격",
      "커피 한잔의 기적으로 변신",
      "자신감 넘치게 출근하는 주인공",
    ],
  },
  {
    title: "반려동물과의 하루",
    scenes: [
      "아침에 반려동물이 깨운다",
      "간식을 달라고 졸라대는 모습",
      "산책 중 벌어지는 에피소드",
      "저녁 소파에서 함께 쉬는 힐링 장면",
    ],
  },
];

const STYLE_LABELS = ["수채화 느낌", "만화 느낌", "펜화 느낌", "파스텔 톤", "레트로"];

// ─── Delay helper ───────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

// ─── Mock AI functions ──────────────────────────────────────────────────────

export interface MockGenerationResult {
  type: "story" | "image" | "style" | "text";
  content: string;
  scenes?: string[];
  previewUrl?: string;
}

export async function mockGenerateStory(
  prompt: string
): Promise<MockGenerationResult> {
  await delay(1200 + Math.random() * 800);
  const template =
    STORY_TEMPLATES[Math.floor(Math.random() * STORY_TEMPLATES.length)];
  return {
    type: "story",
    content: `"${prompt}" 주제로 4컷 인스타툰을 구성했어요!\n\n${template.scenes.map((s, i) => `${i + 1}컷: ${s}`).join("\n")}`,
    scenes: template.scenes,
  };
}

export async function mockGenerateBackground(
  prompt: string
): Promise<MockGenerationResult> {
  await delay(1500 + Math.random() * 500);
  return {
    type: "image",
    content: `"${prompt}" 느낌의 배경을 생성했어요. 적용하시겠어요?`,
    previewUrl: `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e0f7fa"/><stop offset="100%" stop-color="#b2dfdb"/></linearGradient></defs><rect fill="url(#bg)" width="600" height="800"/><text x="300" y="400" text-anchor="middle" fill="#00796b" font-size="24" font-family="sans-serif">${prompt}</text></svg>`
    )}`,
  };
}

export async function mockModifyElement(
  prompt: string,
  context: CopilotContext
): Promise<MockGenerationResult> {
  await delay(800 + Math.random() * 400);
  const typeLabel =
    context.type === "character"
      ? "캐릭터"
      : context.type === "bubble"
        ? "말풍선"
        : "장면";
  return {
    type: "text",
    content: `${typeLabel}을(를) "${prompt}" 방향으로 수정했어요.`,
  };
}

export async function mockChangeStyle(
  prompt: string
): Promise<MockGenerationResult> {
  await delay(1000 + Math.random() * 500);
  const style = STYLE_LABELS[Math.floor(Math.random() * STYLE_LABELS.length)];
  return {
    type: "style",
    content: `스타일을 "${style}"로 변경했어요. "${prompt}" 느낌을 반영했습니다.`,
  };
}

export async function mockAutoGenerate(
  prompt: string
): Promise<MockGenerationResult> {
  await delay(2000 + Math.random() * 1000);
  const template =
    STORY_TEMPLATES[Math.floor(Math.random() * STORY_TEMPLATES.length)];
  return {
    type: "story",
    content: `"${prompt}" 주제로 인스타툰 4컷을 자동 생성했어요!\n\n${template.scenes.map((s, i) => `컷 ${i + 1}: ${s}`).join("\n")}\n\n각 컷을 클릭해서 세부 수정할 수 있어요.`,
    scenes: template.scenes,
  };
}

// ─── Unified dispatcher ─────────────────────────────────────────────────────

export async function mockAIRequest(
  prompt: string,
  context: CopilotContext
): Promise<MockGenerationResult> {
  const lower = prompt.toLowerCase();

  if (lower.includes("배경") || lower.includes("background")) {
    return mockGenerateBackground(prompt);
  }
  if (lower.includes("스타일") || lower.includes("style")) {
    return mockChangeStyle(prompt);
  }
  if (
    lower.includes("자동") ||
    lower.includes("auto") ||
    lower.includes("생성")
  ) {
    return mockAutoGenerate(prompt);
  }
  if (context.selectedElementId) {
    return mockModifyElement(prompt, context);
  }
  return mockGenerateStory(prompt);
}
