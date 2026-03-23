// ─── localStorage-based CRUD for B2B prototype ──────────────────────────────
// Used for features without backend APIs (campaigns, proposals, collaborations, etc.)

function getStore<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setStore<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Generic CRUD ────────────────────────────────────────────────────────────

export function listItems<T>(key: string): T[] {
  return getStore<T>(key);
}

export function getItem<T extends { id: string }>(key: string, id: string): T | null {
  const items = getStore<T>(key);
  return items.find((item) => item.id === id) || null;
}

export function addItem<T extends { id: string }>(key: string, item: T): T {
  const items = getStore<T>(key);
  items.push(item);
  setStore(key, items);
  return item;
}

export function updateItem<T extends { id: string }>(key: string, id: string, updates: Partial<T>): T | null {
  const items = getStore<T>(key);
  const idx = items.findIndex((item) => item.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...updates };
  setStore(key, items);
  return items[idx];
}

export function removeItem<T extends { id: string }>(key: string, id: string): boolean {
  const items = getStore<T>(key);
  const filtered = items.filter((item) => item.id !== id);
  if (filtered.length === items.length) return false;
  setStore(key, filtered);
  return true;
}

// ─── Store Keys ──────────────────────────────────────────────────────────────

export const STORE_KEYS = {
  CAMPAIGNS: "olli-b2b-campaigns",
  PROPOSALS: "olli-b2b-proposals",
  COLLABORATIONS: "olli-b2b-collaborations",
  BRAND_ASSETS: "olli-b2b-brand-assets",
  PROFILE: "olli-b2b-profile",
  PROJECTS: "olli-b2b-projects",
  REVENUE: "olli-b2b-revenue",
} as const;

// ─── ID Generator ────────────────────────────────────────────────────────────

let _counter = 0;
export function generateId(prefix = "item"): string {
  return `${prefix}-${Date.now()}-${++_counter}`;
}

/** Get current user role from localStorage ("creator" | "business") */
export function getUserSource(): "creator" | "business" {
  return (localStorage.getItem("olli_user_role") as "creator" | "business") || "creator";
}

// ─── Type Definitions ────────────────────────────────────────────────────────

export interface Campaign {
  id: string;
  title: string;
  description: string;
  brand: string;
  status: "recruiting" | "active" | "completed";
  budget: number;
  deadline: string;
  applicants: number;
  targetAge: string[];
  genre: string[];
  tone: string[];
  createdAt: string;
}

export interface Proposal {
  id: string;
  title: string;
  campaignName: string;
  creatorName: string;
  brandName: string;
  direction: "sent" | "received";
  status: "pending" | "accepted" | "rejected";
  budget: number;
  deadline: string;
  deliverables: string[];
  requirements: string;
  response: string;
  createdAt: string;
}

export interface Collaboration {
  id: string;
  projectName: string;
  brand: string;
  creator: string;
  campaignName: string;
  status: "in_progress" | "completed" | "pending";
  progress: number;
  stage: number;
  totalStages: number;
  deadline: string;
  lastUpdate: string;
}

export interface BrandAsset {
  id: string;
  name: string;
  type: "mascot" | "logo" | "color" | "document";
  status: "approved" | "review" | "draft";
  version: string;
  downloads: number;
  updatedAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  bio: string;
  avatar: string;
  genres: string[];
  socialLinks: { platform: string; url: string }[];
}

export interface ProjectRecord {
  id: string;
  title: string;
  status: "draft" | "published" | "review";
  panels: number;
  thumbnail: string | null;
  updatedAt: string;
  createdAt: string;
}

export interface RevenueRecord {
  id: string;
  date: string;
  project: string;
  amount: number;
  status: "completed" | "pending" | "processing";
}

// ─── Seed Data (runs once) ───────────────────────────────────────────────────

export function seedIfEmpty(): void {
  // Campaigns
  if (listItems(STORE_KEYS.CAMPAIGNS).length === 0) {
    const campaigns: Campaign[] = [
      { id: generateId("camp"), title: "봄맞이 SNS 캠페인", description: "봄 시즌 신제품 홍보를 위한 인스타툰 시리즈 제작", brand: "네이처리퍼블릭", status: "recruiting", budget: 3000000, deadline: "2026-04-15", applicants: 12, targetAge: ["20대", "30대"], genre: ["뷰티", "라이프스타일"], tone: ["친근한", "밝은"], createdAt: "2026-03-15" },
      { id: generateId("camp"), title: "테크 브랜드 마스코트 활용", description: "AI 기술 브랜드 마스코트를 활용한 교육 콘텐츠", brand: "삼성전자", status: "active", budget: 5000000, deadline: "2026-05-01", applicants: 8, targetAge: ["20대", "30대", "40대"], genre: ["테크", "교육"], tone: ["전문적인", "혁신적인"], createdAt: "2026-03-10" },
      { id: generateId("camp"), title: "웹툰 캐릭터 IP 협업", description: "인기 웹툰 캐릭터를 활용한 브랜드 콜라보 콘텐츠", brand: "카카오엔터", status: "recruiting", budget: 8000000, deadline: "2026-04-30", applicants: 24, targetAge: ["10대", "20대"], genre: ["엔터", "웹툰"], tone: ["재미있는", "활기찬"], createdAt: "2026-03-08" },
      { id: generateId("camp"), title: "친환경 캠페인 인스타툰", description: "친환경 라이프스타일 홍보 4컷 인스타툰", brand: "현대자동차", status: "completed", budget: 4000000, deadline: "2026-03-01", applicants: 15, targetAge: ["30대", "40대"], genre: ["자동차", "환경"], tone: ["따뜻한", "신뢰감있는"], createdAt: "2026-02-01" },
    ];
    campaigns.forEach((c) => addItem(STORE_KEYS.CAMPAIGNS, c));
  }

  // Proposals
  if (listItems(STORE_KEYS.PROPOSALS).length === 0) {
    const proposals: Proposal[] = [
      { id: generateId("prop"), title: "봄맞이 인스타툰 4컷 제작", campaignName: "봄맞이 SNS 캠페인", creatorName: "올리작가", brandName: "네이처리퍼블릭", direction: "received", status: "pending", budget: 800000, deadline: "2026-04-15", deliverables: ["인스타툰 4컷 x 3세트", "캐릭터 일러스트 2장"], requirements: "봄 컨셉에 맞는 밝고 화사한 톤", response: "", createdAt: "2026-03-18" },
      { id: generateId("prop"), title: "마스코트 활용 교육 콘텐츠", campaignName: "테크 브랜드 마스코트 활용", creatorName: "디지털크루", brandName: "삼성전자", direction: "sent", status: "accepted", budget: 1500000, deadline: "2026-05-01", deliverables: ["교육 인포그래픽 5장", "마스코트 포즈 10종"], requirements: "기술 친화적이면서 이해하기 쉬운 스타일", response: "제안 수락합니다. 다음 주 미팅 가능할까요?", createdAt: "2026-03-12" },
      { id: generateId("prop"), title: "웹툰 캐릭터 콜라보 아트", campaignName: "웹툰 캐릭터 IP 협업", creatorName: "펀아트", brandName: "카카오엔터", direction: "received", status: "pending", budget: 2000000, deadline: "2026-04-30", deliverables: ["콜라보 일러스트 3장", "SNS용 움짤 2개"], requirements: "원작 캐릭터 스타일 유지하면서 브랜드 요소 추가", response: "", createdAt: "2026-03-16" },
    ];
    proposals.forEach((p) => addItem(STORE_KEYS.PROPOSALS, p));
  }

  // Collaborations
  if (listItems(STORE_KEYS.COLLABORATIONS).length === 0) {
    const collabs: Collaboration[] = [
      { id: generateId("collab"), projectName: "봄 시즌 인스타툰", brand: "네이처리퍼블릭", creator: "올리작가", campaignName: "봄맞이 SNS 캠페인", status: "in_progress", progress: 45, stage: 2, totalStages: 4, deadline: "2026-04-15", lastUpdate: "2026-03-20" },
      { id: generateId("collab"), projectName: "AI 교육 콘텐츠", brand: "삼성전자", creator: "디지털크루", campaignName: "테크 브랜드 마스코트 활용", status: "in_progress", progress: 75, stage: 3, totalStages: 4, deadline: "2026-05-01", lastUpdate: "2026-03-19" },
      { id: generateId("collab"), projectName: "친환경 캠페인 일러스트", brand: "현대자동차", creator: "봄날작가", campaignName: "친환경 캠페인 인스타툰", status: "completed", progress: 100, stage: 4, totalStages: 4, deadline: "2026-03-01", lastUpdate: "2026-02-28" },
    ];
    collabs.forEach((c) => addItem(STORE_KEYS.COLLABORATIONS, c));
  }

  // Revenue
  if (listItems(STORE_KEYS.REVENUE).length === 0) {
    const revenue: RevenueRecord[] = [
      { id: generateId("rev"), date: "2026-03-20", project: "봄 시즌 인스타툰", amount: 800000, status: "pending" },
      { id: generateId("rev"), date: "2026-03-15", project: "AI 교육 콘텐츠 (1차)", amount: 750000, status: "completed" },
      { id: generateId("rev"), date: "2026-03-10", project: "캐릭터 디자인 의뢰", amount: 500000, status: "completed" },
      { id: generateId("rev"), date: "2026-03-05", project: "배경 일러스트 3종", amount: 350000, status: "completed" },
      { id: generateId("rev"), date: "2026-02-28", project: "친환경 캠페인 인스타툰", amount: 1200000, status: "completed" },
      { id: generateId("rev"), date: "2026-02-20", project: "마스코트 디자인", amount: 900000, status: "processing" },
    ];
    revenue.forEach((r) => addItem(STORE_KEYS.REVENUE, r));
  }

  // Profile
  if (!localStorage.getItem(STORE_KEYS.PROFILE)) {
    const profile: UserProfile = {
      name: "올리 크리에이터",
      email: "creator@olli.ai",
      bio: "AI 캐릭터 디자이너 | 인스타툰 크리에이터 | 브랜드 마스코트 전문",
      avatar: "",
      genres: ["캐릭터 디자인", "일러스트", "브랜드 마스코트", "이모티콘"],
      socialLinks: [
        { platform: "Instagram", url: "https://instagram.com/olli_creator" },
        { platform: "Twitter", url: "https://twitter.com/olli_creator" },
      ],
    };
    localStorage.setItem(STORE_KEYS.PROFILE, JSON.stringify(profile));
  }

  // Projects
  if (listItems(STORE_KEYS.PROJECTS).length === 0) {
    const projects: ProjectRecord[] = [
      { id: "proj-1", title: "카페 일상 인스타툰", status: "published", panels: 4, thumbnail: null, updatedAt: "2026-03-20", createdAt: "2026-03-18" },
      { id: "proj-2", title: "봄맞이 캐릭터 시리즈", status: "draft", panels: 3, thumbnail: null, updatedAt: "2026-03-19", createdAt: "2026-03-15" },
      { id: "proj-3", title: "코믹 사무실 일상", status: "review", panels: 4, thumbnail: null, updatedAt: "2026-03-17", createdAt: "2026-03-10" },
      { id: "proj-4", title: "감성 비오는날", status: "published", panels: 2, thumbnail: null, updatedAt: "2026-03-15", createdAt: "2026-03-08" },
    ];
    projects.forEach((p) => addItem(STORE_KEYS.PROJECTS, p));
  }
}
