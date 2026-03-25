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
  // Fandom
  FANDOM_USER_PROFILE: "olli-fandom-user-profile",
  IDOL_GROUPS: "olli-fandom-groups",
  IDOL_MEMBERS: "olli-fandom-members",
  FANDOM_FEED: "olli-fandom-feed",
  FANDOM_COMMENTS: "olli-fandom-comments",
  FANDOM_EVENTS: "olli-fandom-events",
  // Fan Social
  FAN_CREATORS: "olli-fandom-creators",
  FAN_FOLLOWS: "olli-fandom-follows",
  FAN_DMS: "olli-fandom-dms",
  FAN_TALK_POSTS: "olli-fandom-talk",
  // Fandom Editor Content
  EDITOR_IDOL_PROFILES: "olli-editor-idol-profiles",
  EDITOR_FANART: "olli-editor-fanart",
  EDITOR_FANFIC: "olli-editor-fanfic",
  EDITOR_EVENTS: "olli-editor-events",
  EDITOR_POLLS: "olli-editor-polls",
  EDITOR_CONTENT: "olli-editor-all-content",
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

// ─── Fandom User Profile ────────────────────────────────────────────────────

export interface FandomUserProfile {
  id: string;
  nickname: string;
  groupId: string;
  groupName: string;
  fandomName: string;
  bias: string;
  biasWrecker: string;
  answers: Record<string, string>;
  verified: boolean;
  verifiedAt: string;
  createdAt: string;
}

export function getFandomProfile(): FandomUserProfile | null {
  try {
    const raw = localStorage.getItem(STORE_KEYS.FANDOM_USER_PROFILE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setFandomProfile(profile: FandomUserProfile): void {
  localStorage.setItem(STORE_KEYS.FANDOM_USER_PROFILE, JSON.stringify(profile));
}

export function clearFandomProfile(): void {
  localStorage.removeItem(STORE_KEYS.FANDOM_USER_PROFILE);
}

export function verifyFandomAnswers(
  groupId: string,
  answers: Record<string, string>
): { passed: boolean; score: number; wrongKeys: string[] } {
  const groups = listItems<IdolGroup>(STORE_KEYS.IDOL_GROUPS);
  const group = groups.find((g) => g.id === groupId);
  if (!group) return { passed: false, score: 0, wrongKeys: ["groupId"] };

  const members = listItems<IdolMember>(STORE_KEYS.IDOL_MEMBERS).filter(
    (m) => m.groupId === groupId
  );

  const wrongKeys: string[] = [];

  // Q2: fandom name
  if (
    (answers.fandomName || "").trim().toLowerCase() !==
    group.fandomName.trim().toLowerCase()
  )
    wrongKeys.push("fandomName");

  // Q3: debut year
  if (String(answers.debutYear) !== String(group.debutYear))
    wrongKeys.push("debutYear");

  // Q4: company
  if (
    (answers.company || "").trim().toLowerCase() !==
    group.company.trim().toLowerCase()
  )
    wrongKeys.push("company");

  // Q5: member count
  if (Number(answers.memberCount) !== members.length)
    wrongKeys.push("memberCount");

  // Q6: leader
  const leaders = members
    .filter((m) => m.position.includes("리더"))
    .map((m) => m.name.toLowerCase());
  if (!leaders.includes((answers.leader || "").trim().toLowerCase()))
    wrongKeys.push("leader");

  const score = 5 - wrongKeys.length;
  return { passed: score >= 4, score, wrongKeys };
}

// ─── Fandom Type Definitions ────────────────────────────────────────────────

export interface IdolGroup {
  id: string;
  name: string;
  nameKo: string;
  company: string;
  fandomName: string;
  debutYear: number;
  followers: number;
  fanartCount: number;
  coverColor: string;
  description: string;
}

export interface IdolMember {
  id: string;
  groupId: string;
  name: string;
  nameKo: string;
  position: string;
  color: string;
}

export interface FandomFeedPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  groupId: string;
  groupName: string;
  memberTags: string[];
  title: string;
  description: string;
  imageUrl: string | null;
  likes: number;
  liked: boolean;
  commentCount: number;
  type: "portrait" | "photocard" | "wallpaper" | "fanart" | "sticker" | "concept" | "edit" | "instatoon" | "meme";
  eventId?: string;
  createdAt: string;
}

export interface FandomComment {
  id: string;
  postId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  likes: number;
  liked: boolean;
  parentId?: string;
  createdAt: string;
}

export interface FandomEvent {
  id: string;
  title: string;
  description: string;
  groupId: string;
  groupName: string;
  type: "challenge" | "contest" | "anniversary" | "collab";
  status: "active" | "upcoming" | "ended";
  participants: number;
  prize: string;
  startDate: string;
  endDate: string;
  coverColor: string;
}

// ─── Fan Social Types ────────────────────────────────────────────────────────

export interface FanCreator {
  id: string;
  nickname: string;
  avatar: string;
  bio: string;
  groupId: string;
  groupName: string;
  bias: string;
  fanartCount: number;
  followerCount: number;
  followingCount: number;
  totalLikes: number;
  badge: "rookie" | "rising" | "popular" | "top" | null;
  joinedAt: string;
}

export interface FanFollow {
  id: string;
  followerId: string;  // current user or fan creator id
  followingId: string; // fan creator id being followed
  createdAt: string;
}

export interface FanDM {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface FanTalkPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  groupId: string;
  groupName: string;
  content: string;
  topic: "잡담" | "질문" | "추천" | "소식" | "인증";
  likes: number;
  liked: boolean;
  replyCount: number;
  createdAt: string;
}

export interface FanTalkReply {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  likes: number;
  liked: boolean;
  createdAt: string;
}

// ─── Fandom Editor Content Types ────────────────────────────────────────────

export type EditorContentType = "idol-profile" | "fanart" | "fanfic" | "event" | "poll";
export type EditorContentStatus = "draft" | "published";

export interface EditorContentBase {
  id: string;
  type: EditorContentType;
  title: string;
  description: string;
  authorName: string;
  fandomId: string;
  fandomName: string;
  idolId?: string;
  idolName?: string;
  tags: string[];
  status: EditorContentStatus;
  likes: number;
  views: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EditorIdolProfile extends EditorContentBase {
  type: "idol-profile";
  groupName: string;
  company: string;
  debutDate: string;
  bio: string;
  members: { name: string; position: string }[];
  profileImageUrl: string | null;
  galleryImages: string[];
}

export interface EditorFanArt extends EditorContentBase {
  type: "fanart";
  imageUrls: string[];
  dimensions: string;
  medium: string;
}

export interface EditorFanFic extends EditorContentBase {
  type: "fanfic";
  content: string;
  genre: string;
  chapters: { title: string; content: string }[];
  wordCount: number;
}

export interface EditorEventContent extends EditorContentBase {
  type: "event";
  eventName: string;
  startDate: string;
  endDate: string;
  location: string;
  link: string;
}

export interface EditorPoll extends EditorContentBase {
  type: "poll";
  question: string;
  options: { id: string; text: string; votes: number }[];
  endDate: string;
  totalVotes: number;
}

export type EditorContent = EditorIdolProfile | EditorFanArt | EditorFanFic | EditorEventContent | EditorPoll;

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

  // ─── Fandom Seed Data ──────────────────────────────────────────────────────

  // Idol Groups
  if (listItems(STORE_KEYS.IDOL_GROUPS).length === 0) {
    const groups: IdolGroup[] = [
      { id: "grp-bts", name: "BTS", nameKo: "방탄소년단", company: "HYBE", fandomName: "ARMY", debutYear: 2013, followers: 45200, fanartCount: 3420, coverColor: "#7B2FF7", description: "글로벌 K-POP 그룹 방탄소년단" },
      { id: "grp-bp", name: "BLACKPINK", nameKo: "블랙핑크", company: "YG", fandomName: "BLINK", debutYear: 2016, followers: 38100, fanartCount: 2890, coverColor: "#FF2D8A", description: "글로벌 걸그룹 블랙핑크" },
      { id: "grp-nj", name: "NewJeans", nameKo: "뉴진스", company: "ADOR", fandomName: "Bunnies", debutYear: 2022, followers: 28500, fanartCount: 2150, coverColor: "#00B4D8", description: "4세대 대표 걸그룹 뉴진스" },
      { id: "grp-ae", name: "aespa", nameKo: "에스파", company: "SM", fandomName: "MY", debutYear: 2020, followers: 22800, fanartCount: 1780, coverColor: "#8B5CF6", description: "메타버스 걸그룹 에스파" },
      { id: "grp-skz", name: "Stray Kids", nameKo: "스트레이 키즈", company: "JYP", fandomName: "STAY", debutYear: 2018, followers: 31200, fanartCount: 2340, coverColor: "#EF4444", description: "자체 프로듀싱 보이그룹 스트레이 키즈" },
      { id: "grp-svt", name: "SEVENTEEN", nameKo: "세븐틴", company: "PLEDIS", fandomName: "CARAT", debutYear: 2015, followers: 34600, fanartCount: 2670, coverColor: "#F59E0B", description: "자체 제작 아이돌 세븐틴" },
      { id: "grp-ive", name: "IVE", nameKo: "아이브", company: "STARSHIP", fandomName: "DIVE", debutYear: 2021, followers: 19800, fanartCount: 1420, coverColor: "#EC4899", description: "4세대 걸그룹 아이브" },
      { id: "grp-lsf", name: "LE SSERAFIM", nameKo: "르세라핌", company: "SOURCE", fandomName: "FEARNOT", debutYear: 2022, followers: 21300, fanartCount: 1650, coverColor: "#10B981", description: "퍼포먼스 걸그룹 르세라핌" },
    ];
    groups.forEach((g) => addItem(STORE_KEYS.IDOL_GROUPS, g));
  }

  // Idol Members
  if (listItems(STORE_KEYS.IDOL_MEMBERS).length === 0) {
    const members: IdolMember[] = [
      // BTS
      { id: "mem-rm", groupId: "grp-bts", name: "RM", nameKo: "알엠", position: "리더/래퍼", color: "#7B2FF7" },
      { id: "mem-jin", groupId: "grp-bts", name: "Jin", nameKo: "진", position: "보컬", color: "#EC4899" },
      { id: "mem-suga", groupId: "grp-bts", name: "SUGA", nameKo: "슈가", position: "래퍼", color: "#3B82F6" },
      { id: "mem-jhope", groupId: "grp-bts", name: "j-hope", nameKo: "제이홉", position: "댄서/래퍼", color: "#F59E0B" },
      { id: "mem-jimin", groupId: "grp-bts", name: "Jimin", nameKo: "지민", position: "보컬/댄서", color: "#EF4444" },
      { id: "mem-v", groupId: "grp-bts", name: "V", nameKo: "뷔", position: "보컬", color: "#10B981" },
      { id: "mem-jk", groupId: "grp-bts", name: "Jung Kook", nameKo: "정국", position: "보컬/센터", color: "#8B5CF6" },
      // BLACKPINK
      { id: "mem-jisoo", groupId: "grp-bp", name: "Jisoo", nameKo: "지수", position: "보컬/비주얼", color: "#EC4899" },
      { id: "mem-jennie", groupId: "grp-bp", name: "Jennie", nameKo: "제니", position: "래퍼/보컬", color: "#F59E0B" },
      { id: "mem-rose", groupId: "grp-bp", name: "Rosé", nameKo: "로제", position: "메인보컬", color: "#3B82F6" },
      { id: "mem-lisa", groupId: "grp-bp", name: "Lisa", nameKo: "리사", position: "메인댄서/래퍼", color: "#EF4444" },
      // NewJeans
      { id: "mem-minji", groupId: "grp-nj", name: "Minji", nameKo: "민지", position: "리더/보컬", color: "#00B4D8" },
      { id: "mem-hanni", groupId: "grp-nj", name: "Hanni", nameKo: "하니", position: "보컬", color: "#F59E0B" },
      { id: "mem-danielle", groupId: "grp-nj", name: "Danielle", nameKo: "다니엘", position: "보컬", color: "#EC4899" },
      { id: "mem-haerin", groupId: "grp-nj", name: "Haerin", nameKo: "해린", position: "보컬", color: "#8B5CF6" },
      { id: "mem-hyein", groupId: "grp-nj", name: "Hyein", nameKo: "혜인", position: "보컬/막내", color: "#10B981" },
      // aespa
      { id: "mem-karina", groupId: "grp-ae", name: "Karina", nameKo: "카리나", position: "리더/댄서", color: "#8B5CF6" },
      { id: "mem-giselle", groupId: "grp-ae", name: "Giselle", nameKo: "지젤", position: "래퍼", color: "#3B82F6" },
      { id: "mem-winter", groupId: "grp-ae", name: "Winter", nameKo: "윈터", position: "메인보컬", color: "#00B4D8" },
      { id: "mem-ningning", groupId: "grp-ae", name: "Ningning", nameKo: "닝닝", position: "메인보컬", color: "#EF4444" },
      // Stray Kids
      { id: "mem-bangchan", groupId: "grp-skz", name: "Bang Chan", nameKo: "방찬", position: "리더/프로듀서", color: "#EF4444" },
      { id: "mem-leeknow", groupId: "grp-skz", name: "Lee Know", nameKo: "리노", position: "댄서/보컬", color: "#3B82F6" },
      { id: "mem-changbin", groupId: "grp-skz", name: "Changbin", nameKo: "창빈", position: "래퍼", color: "#F59E0B" },
      { id: "mem-hyunjin", groupId: "grp-skz", name: "Hyunjin", nameKo: "현진", position: "댄서/래퍼", color: "#8B5CF6" },
      { id: "mem-han", groupId: "grp-skz", name: "HAN", nameKo: "한", position: "래퍼/보컬", color: "#10B981" },
      { id: "mem-felix", groupId: "grp-skz", name: "Felix", nameKo: "필릭스", position: "댄서/래퍼", color: "#EC4899" },
      { id: "mem-seungmin", groupId: "grp-skz", name: "Seungmin", nameKo: "승민", position: "보컬", color: "#00B4D8" },
      { id: "mem-in", groupId: "grp-skz", name: "I.N", nameKo: "아이엔", position: "보컬/막내", color: "#F97316" },
      // SEVENTEEN
      { id: "mem-scoups", groupId: "grp-svt", name: "S.Coups", nameKo: "에스쿱스", position: "리더/래퍼", color: "#F59E0B" },
      { id: "mem-jeonghan", groupId: "grp-svt", name: "Jeonghan", nameKo: "정한", position: "보컬", color: "#EC4899" },
      { id: "mem-joshua", groupId: "grp-svt", name: "Joshua", nameKo: "조슈아", position: "보컬", color: "#3B82F6" },
      { id: "mem-hoshi", groupId: "grp-svt", name: "Hoshi", nameKo: "호시", position: "퍼포먼스 리더", color: "#EF4444" },
      { id: "mem-wonwoo", groupId: "grp-svt", name: "Wonwoo", nameKo: "원우", position: "래퍼", color: "#8B5CF6" },
      { id: "mem-woozi", groupId: "grp-svt", name: "Woozi", nameKo: "우지", position: "보컬/프로듀서", color: "#10B981" },
      { id: "mem-dk", groupId: "grp-svt", name: "DK", nameKo: "도겸", position: "메인보컬", color: "#F97316" },
      // IVE
      { id: "mem-yujin", groupId: "grp-ive", name: "Yujin", nameKo: "유진", position: "리더/보컬", color: "#EC4899" },
      { id: "mem-gaeul", groupId: "grp-ive", name: "Gaeul", nameKo: "가을", position: "래퍼", color: "#F59E0B" },
      { id: "mem-rei", groupId: "grp-ive", name: "Rei", nameKo: "레이", position: "보컬", color: "#3B82F6" },
      { id: "mem-wonyoung", groupId: "grp-ive", name: "Wonyoung", nameKo: "원영", position: "센터/보컬", color: "#8B5CF6" },
      { id: "mem-liz", groupId: "grp-ive", name: "Liz", nameKo: "리즈", position: "메인보컬", color: "#10B981" },
      { id: "mem-leeseo", groupId: "grp-ive", name: "Leeseo", nameKo: "이서", position: "보컬/막내", color: "#EF4444" },
      // LE SSERAFIM
      { id: "mem-sakura", groupId: "grp-lsf", name: "Sakura", nameKo: "사쿠라", position: "보컬", color: "#EC4899" },
      { id: "mem-chaewon", groupId: "grp-lsf", name: "Chaewon", nameKo: "채원", position: "리더/보컬", color: "#10B981" },
      { id: "mem-yunjin", groupId: "grp-lsf", name: "Yunjin", nameKo: "윤진", position: "보컬", color: "#3B82F6" },
      { id: "mem-kazuha", groupId: "grp-lsf", name: "Kazuha", nameKo: "카즈하", position: "댄서", color: "#F59E0B" },
      { id: "mem-eunchae", groupId: "grp-lsf", name: "Eunchae", nameKo: "은채", position: "보컬/막내", color: "#8B5CF6" },
    ];
    members.forEach((m) => addItem(STORE_KEYS.IDOL_MEMBERS, m));
  }

  // Fandom Feed Posts
  if (listItems(STORE_KEYS.FANDOM_FEED).length === 0) {
    const posts: FandomFeedPost[] = [
      { id: "fp-1", authorName: "아미드로잉", authorAvatar: "AD", groupId: "grp-bts", groupName: "BTS", memberTags: ["Jimin", "V"], title: "지민 & 뷔 우정 팬아트", description: "95즈 우정을 그려봤어요!", imageUrl: null, likes: 892, liked: false, commentCount: 45, type: "fanart", createdAt: "2026-03-23" },
      { id: "fp-2", authorName: "블링크아트", authorAvatar: "BA", groupId: "grp-bp", groupName: "BLACKPINK", memberTags: ["Jennie"], title: "제니 Solo 팬아트", description: "Solo 컨셉으로 그린 제니", imageUrl: null, likes: 756, liked: false, commentCount: 38, type: "fanart", createdAt: "2026-03-23" },
      { id: "fp-3", authorName: "버니작가", authorAvatar: "BJ", groupId: "grp-nj", groupName: "NewJeans", memberTags: ["Minji", "Hanni"], title: "뉴진스 Ditto 인스타툰", description: "Ditto MV 장면을 4컷 인스타툰으로!", imageUrl: null, likes: 1203, liked: false, commentCount: 67, type: "instatoon", createdAt: "2026-03-22" },
      { id: "fp-4", authorName: "마이드로우", authorAvatar: "MD", groupId: "grp-ae", groupName: "aespa", memberTags: ["Karina", "Winter"], title: "카리나 & 윈터 듀엣 일러스트", description: "Supernova 컨셉 팬아트", imageUrl: null, likes: 645, liked: false, commentCount: 29, type: "fanart", createdAt: "2026-03-22" },
      { id: "fp-5", authorName: "스테이아트", authorAvatar: "SA", groupId: "grp-skz", groupName: "Stray Kids", memberTags: ["Hyunjin"], title: "현진 댄스 팬아트", description: "LALALALA 안무 장면 팬아트", imageUrl: null, likes: 534, liked: false, commentCount: 22, type: "fanart", createdAt: "2026-03-21" },
      { id: "fp-6", authorName: "캐럿크리에이터", authorAvatar: "CC", groupId: "grp-svt", groupName: "SEVENTEEN", memberTags: ["Hoshi"], title: "호시 호랑이 밈 인스타툰", description: "호시의 호랑이 사랑을 인스타툰으로 😂", imageUrl: null, likes: 1567, liked: false, commentCount: 89, type: "meme", createdAt: "2026-03-21" },
      { id: "fp-7", authorName: "다이브아트", authorAvatar: "DA", groupId: "grp-ive", groupName: "IVE", memberTags: ["Wonyoung", "Yujin"], title: "아이브 LOVE DIVE 팬아트", description: "LOVE DIVE 컨셉 일러스트", imageUrl: null, likes: 423, liked: false, commentCount: 18, type: "fanart", createdAt: "2026-03-20" },
      { id: "fp-8", authorName: "피어낫작가", authorAvatar: "FN", groupId: "grp-lsf", groupName: "LE SSERAFIM", memberTags: ["Chaewon", "Kazuha"], title: "르세라핌 퍼포먼스 팬아트", description: "FEARLESS 안무 장면", imageUrl: null, likes: 389, liked: false, commentCount: 15, type: "fanart", createdAt: "2026-03-20" },
      { id: "fp-9", authorName: "아미드로잉", authorAvatar: "AD", groupId: "grp-bts", groupName: "BTS", memberTags: ["Jung Kook"], title: "정국 Seven 인스타툰", description: "Seven MV를 4컷으로!", imageUrl: null, likes: 2103, liked: false, commentCount: 112, type: "instatoon", createdAt: "2026-03-19" },
      { id: "fp-10", authorName: "블링크아트", authorAvatar: "BA", groupId: "grp-bp", groupName: "BLACKPINK", memberTags: ["Lisa"], title: "리사 MONEY 에디트", description: "MONEY 뮤비 팬에디트", imageUrl: null, likes: 934, liked: false, commentCount: 41, type: "edit", createdAt: "2026-03-19" },
      { id: "fp-11", authorName: "버니작가", authorAvatar: "BJ", groupId: "grp-nj", groupName: "NewJeans", memberTags: ["Haerin"], title: "해린 고양이 밈", description: "해린이의 고양이 매력 밈!", imageUrl: null, likes: 1876, liked: false, commentCount: 95, type: "meme", createdAt: "2026-03-18" },
      { id: "fp-12", authorName: "스테이아트", authorAvatar: "SA", groupId: "grp-skz", groupName: "Stray Kids", memberTags: ["Felix", "Bang Chan"], title: "필릭스 & 방찬 듀엣", description: "호주즈 팬아트", imageUrl: null, likes: 678, liked: false, commentCount: 34, type: "fanart", createdAt: "2026-03-18" },
      { id: "fp-13", authorName: "마이드로우", authorAvatar: "MD", groupId: "grp-ae", groupName: "aespa", memberTags: ["Giselle", "Ningning"], title: "지젤 & 닝닝 우정 인스타툰", description: "에스파 연습실 일상 4컷", imageUrl: null, likes: 412, liked: false, commentCount: 19, type: "instatoon", createdAt: "2026-03-17" },
      { id: "fp-14", authorName: "캐럿크리에이터", authorAvatar: "CC", groupId: "grp-svt", groupName: "SEVENTEEN", memberTags: ["Woozi", "DK"], title: "우지 & 도겸 보컬 유닛 팬아트", description: "보컬팀 무대 일러스트", imageUrl: null, likes: 567, liked: false, commentCount: 28, type: "fanart", createdAt: "2026-03-17" },
      { id: "fp-15", authorName: "다이브아트", authorAvatar: "DA", groupId: "grp-ive", groupName: "IVE", memberTags: ["Rei", "Liz"], title: "레이 & 리즈 셀카 인스타툰", description: "아이브 셀카 일상 인스타툰", imageUrl: null, likes: 345, liked: false, commentCount: 14, type: "instatoon", createdAt: "2026-03-16" },
      { id: "fp-16", authorName: "피어낫작가", authorAvatar: "FN", groupId: "grp-lsf", groupName: "LE SSERAFIM", memberTags: ["Sakura"], title: "사쿠라 팬아트", description: "우아한 사쿠라 일러스트", imageUrl: null, likes: 501, liked: false, commentCount: 23, type: "fanart", createdAt: "2026-03-16" },
      { id: "fp-17", authorName: "아미드로잉", authorAvatar: "AD", groupId: "grp-bts", groupName: "BTS", memberTags: ["SUGA"], title: "슈가 Agust D 팬아트", description: "Agust D 컨셉 팬아트", imageUrl: null, likes: 1456, liked: false, commentCount: 72, type: "fanart", createdAt: "2026-03-15" },
      { id: "fp-18", authorName: "버니작가", authorAvatar: "BJ", groupId: "grp-nj", groupName: "NewJeans", memberTags: ["Danielle", "Hyein"], title: "다니엘 & 혜인 학교 인스타툰", description: "뉴진스 등교길 4컷!", imageUrl: null, likes: 923, liked: false, commentCount: 48, type: "instatoon", createdAt: "2026-03-15" },
    ];
    posts.forEach((p) => addItem(STORE_KEYS.FANDOM_FEED, p));
  }

  // Fandom Comments
  if (listItems(STORE_KEYS.FANDOM_COMMENTS).length === 0) {
    const comments: FandomComment[] = [
      { id: "fc-1", postId: "fp-1", authorName: "아미1004", authorAvatar: "A1", content: "95즈 진짜 최고 ㅠㅠ 너무 예쁘게 그리셨어요!", likes: 23, liked: false, createdAt: "2026-03-23" },
      { id: "fc-2", postId: "fp-1", authorName: "보라해", authorAvatar: "BH", content: "색감이 너무 좋아요!! 배경도 예술이에요", likes: 15, liked: false, createdAt: "2026-03-23" },
      { id: "fc-3", postId: "fp-1", authorName: "탄이팬", authorAvatar: "TP", content: "지민이 표정 완벽 캡처! 대단해요", likes: 8, liked: false, parentId: "fc-1", createdAt: "2026-03-23" },
      { id: "fc-4", postId: "fp-3", authorName: "뉴진러버", authorAvatar: "NL", content: "Ditto 인스타툰 너무 귀여워요! 민지 하니 최고", likes: 45, liked: false, createdAt: "2026-03-22" },
      { id: "fc-5", postId: "fp-3", authorName: "버니즈", authorAvatar: "BZ", content: "4컷 스토리텔링 진짜 잘하시네요 ㅎㅎ", likes: 12, liked: false, createdAt: "2026-03-22" },
      { id: "fc-6", postId: "fp-6", authorName: "캐럿팬", authorAvatar: "CF", content: "호시 호랑이 ㅋㅋㅋㅋ 공감 100%", likes: 67, liked: false, createdAt: "2026-03-21" },
      { id: "fc-7", postId: "fp-6", authorName: "세븐틴러브", authorAvatar: "SL", content: "이거 공유해도 되나요?? 너무 웃겨요 ㅋㅋ", likes: 23, liked: false, createdAt: "2026-03-21" },
      { id: "fc-8", postId: "fp-6", authorName: "호시팬", authorAvatar: "HP", content: "호시오빠 보면 진짜 이래요 ㅋㅋㅋ", likes: 34, liked: false, parentId: "fc-6", createdAt: "2026-03-21" },
      { id: "fc-9", postId: "fp-9", authorName: "정국맘", authorAvatar: "JM", content: "Seven 인스타툰 진짜 잘 만드셨어요!! 대박", likes: 89, liked: false, createdAt: "2026-03-19" },
      { id: "fc-10", postId: "fp-9", authorName: "아미드림", authorAvatar: "AD", content: "퀄리티 미쳤다... 프로 크리에이터시죠?", likes: 56, liked: false, createdAt: "2026-03-19" },
      { id: "fc-11", postId: "fp-11", authorName: "해린팬", authorAvatar: "HR", content: "해린이 고양이 너무 귀여워ㅠㅠ", likes: 78, liked: false, createdAt: "2026-03-18" },
      { id: "fc-12", postId: "fp-11", authorName: "버니1", authorAvatar: "B1", content: "이 밈 진짜 찐이다 ㅋㅋㅋ", likes: 45, liked: false, createdAt: "2026-03-18" },
      { id: "fc-13", postId: "fp-2", authorName: "블링크1", authorAvatar: "BK", content: "제니 Solo 느낌 완벽해요!", likes: 34, liked: false, createdAt: "2026-03-23" },
      { id: "fc-14", postId: "fp-4", authorName: "마이팬", authorAvatar: "MF", content: "카리나 윈터 조합 최고!", likes: 19, liked: false, createdAt: "2026-03-22" },
      { id: "fc-15", postId: "fp-5", authorName: "스테이1", authorAvatar: "S1", content: "현진이 댄스 라인 살아있네요!", likes: 22, liked: false, createdAt: "2026-03-21" },
      { id: "fc-16", postId: "fp-7", authorName: "다이버", authorAvatar: "DV", content: "원영이 유진이 투샷 너무 예뻐요!", likes: 15, liked: false, createdAt: "2026-03-20" },
      { id: "fc-17", postId: "fp-8", authorName: "피어낫1", authorAvatar: "F1", content: "채원 카즈하 퍼포먼스 팬아트 대박!", likes: 11, liked: false, createdAt: "2026-03-20" },
      { id: "fc-18", postId: "fp-10", authorName: "블링크2", authorAvatar: "B2", content: "리사 에디트 완전 프로급이에요!", likes: 28, liked: false, createdAt: "2026-03-19" },
      { id: "fc-19", postId: "fp-12", authorName: "스테이2", authorAvatar: "S2", content: "호주즈 조합 최고!! 필릭스 방찬 ♥", likes: 31, liked: false, createdAt: "2026-03-18" },
      { id: "fc-20", postId: "fp-13", authorName: "마이2", authorAvatar: "M2", content: "에스파 연습실 일상 귀여워요 ㅎㅎ", likes: 14, liked: false, createdAt: "2026-03-17" },
      { id: "fc-21", postId: "fp-14", authorName: "캐럿2", authorAvatar: "C2", content: "보컬팀 무대 팬아트 감동이에요!", likes: 20, liked: false, createdAt: "2026-03-17" },
      { id: "fc-22", postId: "fp-15", authorName: "다이버2", authorAvatar: "D2", content: "레이 리즈 셀카 인스타툰 귀여움 폭발!", likes: 9, liked: false, createdAt: "2026-03-16" },
      { id: "fc-23", postId: "fp-16", authorName: "피어낫2", authorAvatar: "F2", content: "사쿠라 일러스트 너무 우아해요!", likes: 17, liked: false, createdAt: "2026-03-16" },
      { id: "fc-24", postId: "fp-17", authorName: "아미3", authorAvatar: "A3", content: "Agust D 컨셉 완전 멋져요!!", likes: 43, liked: false, createdAt: "2026-03-15" },
      { id: "fc-25", postId: "fp-17", authorName: "슈가팬", authorAvatar: "SP", content: "디테일 미쳤다... 슈가 그 자체!", likes: 38, liked: false, createdAt: "2026-03-15" },
      { id: "fc-26", postId: "fp-18", authorName: "버니3", authorAvatar: "B3", content: "등교길 4컷 너무 귀여워요 ㅠㅠ", likes: 29, liked: false, createdAt: "2026-03-15" },
      { id: "fc-27", postId: "fp-18", authorName: "뉴진팬", authorAvatar: "NF", content: "다니엘 혜인 케미 최고!!", likes: 25, liked: false, createdAt: "2026-03-15" },
      { id: "fc-28", postId: "fp-9", authorName: "전정국팬", authorAvatar: "JF", content: "정국이 표현력 진짜 대단하세요", likes: 41, liked: false, parentId: "fc-9", createdAt: "2026-03-19" },
      { id: "fc-29", postId: "fp-3", authorName: "뉴진팬2", authorAvatar: "N2", content: "다음엔 Super Shy도 그려주세요!", likes: 33, liked: false, parentId: "fc-4", createdAt: "2026-03-22" },
      { id: "fc-30", postId: "fp-11", authorName: "해린이", authorAvatar: "HI", content: "이거 짤로 써도 될까요? ㅋㅋ", likes: 12, liked: false, parentId: "fc-11", createdAt: "2026-03-18" },
      { id: "fc-31", postId: "fp-2", authorName: "제니팬", authorAvatar: "JF", content: "Solo 바이브 완벽 재현!! 팔로우했어요", likes: 21, liked: false, parentId: "fc-13", createdAt: "2026-03-23" },
      { id: "fc-32", postId: "fp-5", authorName: "현진맘", authorAvatar: "HM", content: "현진이 비율 진짜 잘 잡으셨네요", likes: 16, liked: false, parentId: "fc-15", createdAt: "2026-03-21" },
      { id: "fc-33", postId: "fp-4", authorName: "에스파팬", authorAvatar: "EF", content: "Supernova 컨셉 너무 잘 어울려요!", likes: 13, liked: false, parentId: "fc-14", createdAt: "2026-03-22" },
      { id: "fc-34", postId: "fp-17", authorName: "민윤기", authorAvatar: "MY", content: "Agust D 3집 컨셉이죠? 대박이에요", likes: 35, liked: false, parentId: "fc-24", createdAt: "2026-03-15" },
      { id: "fc-35", postId: "fp-6", authorName: "호시호랑이", authorAvatar: "HH", content: "이거 호시 본인도 웃겼을 듯 ㅋㅋㅋ", likes: 52, liked: false, parentId: "fc-7", createdAt: "2026-03-21" },
    ];
    comments.forEach((c) => addItem(STORE_KEYS.FANDOM_COMMENTS, c));
  }

  // Fandom Events
  if (listItems(STORE_KEYS.FANDOM_EVENTS).length === 0) {
    const events: FandomEvent[] = [
      { id: "evt-1", title: "BTS 데뷔 13주년 팬아트 챌린지", description: "방탄소년단 데뷔 13주년을 기념하는 팬아트 챌린지! 멤버별 또는 단체 팬아트를 제출하세요.", groupId: "grp-bts", groupName: "BTS", type: "anniversary", status: "active", participants: 234, prize: "공식 굿즈 세트 + 팬미팅 초대권", startDate: "2026-06-01", endDate: "2026-06-30", coverColor: "#7B2FF7" },
      { id: "evt-2", title: "NewJeans 인스타툰 콘테스트", description: "뉴진스의 곡을 주제로 4컷 인스타툰을 만들어주세요! 창의적인 스토리텔링을 기대합니다.", groupId: "grp-nj", groupName: "NewJeans", type: "contest", status: "active", participants: 156, prize: "앨범 사인본 + 포토카드 세트", startDate: "2026-03-15", endDate: "2026-04-15", coverColor: "#00B4D8" },
      { id: "evt-3", title: "BLACKPINK 밈 챌린지", description: "블랙핑크 멤버들의 재미있는 순간을 밈/인스타툰으로 만들어주세요!", groupId: "grp-bp", groupName: "BLACKPINK", type: "challenge", status: "active", participants: 189, prize: "공식 MD + 디지털 포토카드", startDate: "2026-03-10", endDate: "2026-04-10", coverColor: "#FF2D8A" },
      { id: "evt-4", title: "Stray Kids x 크리에이터 콜라보", description: "스트레이 키즈 공식 콜라보! 최우수 팬아트는 공식 SNS에 게시됩니다.", groupId: "grp-skz", groupName: "Stray Kids", type: "collab", status: "active", participants: 312, prize: "공식 SNS 게시 + 앨범 10장", startDate: "2026-03-01", endDate: "2026-04-30", coverColor: "#EF4444" },
      { id: "evt-5", title: "SEVENTEEN 캐럿 팬아트 페스타", description: "세븐틴 유닛별 팬아트를 그려주세요! 힙합팀, 보컬팀, 퍼포먼스팀 부문으로 진행됩니다.", groupId: "grp-svt", groupName: "SEVENTEEN", type: "contest", status: "upcoming", participants: 0, prize: "콘서트 티켓 2매 + 굿즈 패키지", startDate: "2026-04-01", endDate: "2026-05-01", coverColor: "#F59E0B" },
      { id: "evt-6", title: "aespa MY 팬아트 챌린지", description: "에스파와 ae 캐릭터를 함께 그리는 팬아트 챌린지! 메타버스 컨셉을 자유롭게 표현하세요.", groupId: "grp-ae", groupName: "aespa", type: "challenge", status: "upcoming", participants: 0, prize: "앨범 사인본 + 포토카드 풀세트", startDate: "2026-04-15", endDate: "2026-05-15", coverColor: "#8B5CF6" },
      { id: "evt-7", title: "IVE 데뷔 5주년 기념 이벤트", description: "아이브 데뷔 5주년을 축하하는 팬아트 & 인스타툰 공모전!", groupId: "grp-ive", groupName: "IVE", type: "anniversary", status: "ended", participants: 145, prize: "팬사인회 응모권 + 앨범", startDate: "2026-01-01", endDate: "2026-02-01", coverColor: "#EC4899" },
      { id: "evt-8", title: "LE SSERAFIM FEARLESS 팬아트", description: "르세라핌의 FEARLESS 컨셉을 자유롭게 팬아트로 표현하세요!", groupId: "grp-lsf", groupName: "LE SSERAFIM", type: "challenge", status: "ended", participants: 98, prize: "디지털 포토카드 세트", startDate: "2026-02-01", endDate: "2026-03-01", coverColor: "#10B981" },
    ];
    events.forEach((e) => addItem(STORE_KEYS.FANDOM_EVENTS, e));
  }

  // Fan Creators
  if (listItems(STORE_KEYS.FAN_CREATORS).length === 0) {
    const creators: FanCreator[] = [
      { id: "fan-1", nickname: "아미드로잉", avatar: "AD", bio: "BTS 팬아트 전문 크리에이터 🎨 95즈 최애", groupId: "grp-bts", groupName: "BTS", bias: "Jimin", fanartCount: 48, followerCount: 1230, followingCount: 45, totalLikes: 15600, badge: "top", joinedAt: "2025-06-15" },
      { id: "fan-2", nickname: "블링크아트", avatar: "BA", bio: "BLACKPINK 일러스트레이터 💖 제니 최애", groupId: "grp-bp", groupName: "BLACKPINK", bias: "Jennie", fanartCount: 35, followerCount: 890, followingCount: 32, totalLikes: 9800, badge: "popular", joinedAt: "2025-08-20" },
      { id: "fan-3", nickname: "버니작가", avatar: "BJ", bio: "뉴진스 인스타툰 크리에이터 🐰 민지 최애", groupId: "grp-nj", groupName: "NewJeans", bias: "Minji", fanartCount: 52, followerCount: 2100, followingCount: 38, totalLikes: 22400, badge: "top", joinedAt: "2025-05-10" },
      { id: "fan-4", nickname: "마이드로우", avatar: "MD", bio: "에스파 팬아트 그리는 MY 🌟 카리나 최애", groupId: "grp-ae", groupName: "aespa", bias: "Karina", fanartCount: 28, followerCount: 560, followingCount: 51, totalLikes: 5400, badge: "rising", joinedAt: "2025-09-01" },
      { id: "fan-5", nickname: "스테이아트", avatar: "SA", bio: "스키즈 팬아트 & 밈 제작 🎯 현진 최애", groupId: "grp-skz", groupName: "Stray Kids", bias: "Hyunjin", fanartCount: 31, followerCount: 720, followingCount: 28, totalLikes: 7200, badge: "popular", joinedAt: "2025-07-22" },
      { id: "fan-6", nickname: "캐럿크리에이터", avatar: "CC", bio: "세븐틴 밈 장인 ㅋㅋ 호시 최애 🐯", groupId: "grp-svt", groupName: "SEVENTEEN", bias: "Hoshi", fanartCount: 44, followerCount: 1560, followingCount: 41, totalLikes: 18900, badge: "top", joinedAt: "2025-04-05" },
      { id: "fan-7", nickname: "다이브아트", avatar: "DA", bio: "아이브 팬아트 크리에이터 🎀 원영 최애", groupId: "grp-ive", groupName: "IVE", bias: "Wonyoung", fanartCount: 22, followerCount: 380, followingCount: 55, totalLikes: 3800, badge: "rising", joinedAt: "2025-10-12" },
      { id: "fan-8", nickname: "피어낫작가", avatar: "FN", bio: "르세라핌 팬아트 전문 🦋 채원 최애", groupId: "grp-lsf", groupName: "LE SSERAFIM", bias: "Chaewon", fanartCount: 19, followerCount: 340, followingCount: 29, totalLikes: 3200, badge: "rising", joinedAt: "2025-11-01" },
      { id: "fan-9", nickname: "올리작가", avatar: "OL", bio: "멀티 팬덤 크리에이터 ✨ 다양한 그룹 팬아트", groupId: "grp-bts", groupName: "BTS", bias: "V", fanartCount: 67, followerCount: 3200, followingCount: 120, totalLikes: 34500, badge: "top", joinedAt: "2025-01-15" },
      { id: "fan-10", nickname: "뉴진러버", avatar: "NL", bio: "뉴진스 일러스트 & 굿즈 제작 🎨", groupId: "grp-nj", groupName: "NewJeans", bias: "Hanni", fanartCount: 15, followerCount: 210, followingCount: 67, totalLikes: 1800, badge: "rookie", joinedAt: "2026-01-20" },
      { id: "fan-11", nickname: "호시호랑이", avatar: "HH", bio: "호시 = 호랑이 🐯 세븐틴 팬아트", groupId: "grp-svt", groupName: "SEVENTEEN", bias: "Hoshi", fanartCount: 12, followerCount: 180, followingCount: 34, totalLikes: 1200, badge: "rookie", joinedAt: "2026-02-10" },
      { id: "fan-12", nickname: "정국맘", avatar: "JM", bio: "정국이 팬아트 모아 놓는 계정 💜", groupId: "grp-bts", groupName: "BTS", bias: "Jung Kook", fanartCount: 25, followerCount: 890, followingCount: 42, totalLikes: 8900, badge: "popular", joinedAt: "2025-08-05" },
    ];
    creators.forEach((c) => addItem(STORE_KEYS.FAN_CREATORS, c));
  }

  // Fan Talk Posts
  if (listItems(STORE_KEYS.FAN_TALK_POSTS).length === 0) {
    const talkPosts: FanTalkPost[] = [
      { id: "talk-1", authorId: "fan-1", authorName: "아미드로잉", authorAvatar: "AD", groupId: "grp-bts", groupName: "BTS", content: "오늘 지민이 인스타 업데이트 봤어요?! 팬아트 영감 뿜뿜 🎨", topic: "잡담", likes: 45, liked: false, replyCount: 12, createdAt: "2026-03-24T09:30:00" },
      { id: "talk-2", authorId: "fan-3", authorName: "버니작가", authorAvatar: "BJ", groupId: "grp-nj", groupName: "NewJeans", content: "뉴진스 인스타툰 그릴 때 어떤 스타일이 제일 반응 좋았어요? 저는 Ditto 컨셉이 대박이었는데", topic: "질문", likes: 67, liked: false, replyCount: 23, createdAt: "2026-03-24T08:15:00" },
      { id: "talk-3", authorId: "fan-6", authorName: "캐럿크리에이터", authorAvatar: "CC", groupId: "grp-svt", groupName: "SEVENTEEN", content: "호시 밈 새로 만들었는데 반응이 미쳤어요 ㅋㅋㅋ 여러분도 밈 챌린지 참여하세요!", topic: "인증", likes: 89, liked: false, replyCount: 34, createdAt: "2026-03-24T07:00:00" },
      { id: "talk-4", authorId: "fan-9", authorName: "올리작가", authorAvatar: "OL", groupId: "grp-bts", groupName: "BTS", content: "팬아트 그릴 때 참고하기 좋은 포즈 레퍼런스 사이트 추천해요!\n1. QuickPoses\n2. Line of Action\n3. SketchDaily", topic: "추천", likes: 156, liked: false, replyCount: 45, createdAt: "2026-03-23T22:00:00" },
      { id: "talk-5", authorId: "fan-2", authorName: "블링크아트", authorAvatar: "BA", groupId: "grp-bp", groupName: "BLACKPINK", content: "제니 솔로 앨범 나온다는 소식!! 팬아트 미리 준비해야겠어요 🖤💖", topic: "소식", likes: 112, liked: false, replyCount: 28, createdAt: "2026-03-23T20:30:00" },
      { id: "talk-6", authorId: "fan-5", authorName: "스테이아트", authorAvatar: "SA", groupId: "grp-skz", groupName: "Stray Kids", content: "스키즈 월드투어 팬아트 프로젝트 같이 하실 분 구합니다! 멤버별 한 장씩 분배해서 합작하고 싶어요", topic: "잡담", likes: 78, liked: false, replyCount: 19, createdAt: "2026-03-23T18:45:00" },
      { id: "talk-7", authorId: "fan-4", authorName: "마이드로우", authorAvatar: "MD", groupId: "grp-ae", groupName: "aespa", content: "에스파 ae 캐릭터 그릴 때 팁 있으신 분? 메타버스 느낌을 살리고 싶은데 어려워요 ㅠ", topic: "질문", likes: 34, liked: false, replyCount: 15, createdAt: "2026-03-23T16:20:00" },
      { id: "talk-8", authorId: "fan-12", authorName: "정국맘", authorAvatar: "JM", groupId: "grp-bts", groupName: "BTS", content: "정국이 Seven 인스타툰 시리즈 완성했어요! 피드에 올렸으니 봐주세요 💜", topic: "인증", likes: 201, liked: false, replyCount: 56, createdAt: "2026-03-23T14:00:00" },
      { id: "talk-9", authorId: "fan-7", authorName: "다이브아트", authorAvatar: "DA", groupId: "grp-ive", groupName: "IVE", content: "아이브 컴백 예고편 나왔어요!! 원영이 비주얼 미쳤다 ㅠㅠ 바로 팬아트 들어갑니다", topic: "소식", likes: 56, liked: false, replyCount: 11, createdAt: "2026-03-23T12:30:00" },
      { id: "talk-10", authorId: "fan-10", authorName: "뉴진러버", authorAvatar: "NL", groupId: "grp-nj", groupName: "NewJeans", content: "팬아트 초보인데 OLLI AI 써보니까 진짜 신세계에요... 하니 팬아트 처음으로 완성했어요!", topic: "인증", likes: 93, liked: false, replyCount: 31, createdAt: "2026-03-23T10:15:00" },
      { id: "talk-11", authorId: "fan-8", authorName: "피어낫작가", authorAvatar: "FN", groupId: "grp-lsf", groupName: "LE SSERAFIM", content: "르세라핌 FEARLESS 챌린지 참여했는데 결과 언제 나오나요?", topic: "질문", likes: 22, liked: false, replyCount: 8, createdAt: "2026-03-22T21:00:00" },
      { id: "talk-12", authorId: "fan-11", authorName: "호시호랑이", authorAvatar: "HH", groupId: "grp-svt", groupName: "SEVENTEEN", content: "호시 팬아트 그리다가 자동으로 호랑이가 그려지는 건 저만 그런가요 ㅋㅋㅋ", topic: "잡담", likes: 134, liked: false, replyCount: 42, createdAt: "2026-03-22T19:30:00" },
    ];
    talkPosts.forEach((t) => addItem(STORE_KEYS.FAN_TALK_POSTS, t));
  }

  // Fan DMs (demo conversations)
  if (listItems(STORE_KEYS.FAN_DMS).length === 0) {
    const dms: FanDM[] = [
      { id: "dm-1", senderId: "fan-3", senderName: "버니작가", senderAvatar: "BJ", receiverId: "me", receiverName: "나", receiverAvatar: "ME", content: "안녕하세요! 팬아트 스타일 너무 좋아요 😊 혹시 합작 관심 있으신가요?", read: false, createdAt: "2026-03-24T10:00:00" },
      { id: "dm-2", senderId: "me", senderName: "나", senderAvatar: "ME", receiverId: "fan-3", receiverName: "버니작가", receiverAvatar: "BJ", content: "감사합니다! 합작 좋아요~ 어떤 컨셉으로 하고 싶으세요?", read: true, createdAt: "2026-03-24T10:05:00" },
      { id: "dm-3", senderId: "fan-3", senderName: "버니작가", senderAvatar: "BJ", receiverId: "me", receiverName: "나", receiverAvatar: "ME", content: "뉴진스 멤버별로 한 장씩 그려서 합치면 어떨까요? 저는 민지랑 하니를 맡을게요!", read: false, createdAt: "2026-03-24T10:10:00" },
      { id: "dm-4", senderId: "fan-9", senderName: "올리작가", senderAvatar: "OL", receiverId: "me", receiverName: "나", receiverAvatar: "ME", content: "팬아트 이벤트 같이 참여할래요? BTS 데뷔 13주년 챌린지요!", read: false, createdAt: "2026-03-23T15:30:00" },
      { id: "dm-5", senderId: "fan-6", senderName: "캐럿크리에이터", senderAvatar: "CC", receiverId: "me", receiverName: "나", receiverAvatar: "ME", content: "밈 만드는 팁 좀 알려주실 수 있나요? 항상 작품 잘 보고 있어요!", read: true, createdAt: "2026-03-22T20:00:00" },
      { id: "dm-6", senderId: "me", senderName: "나", senderAvatar: "ME", receiverId: "fan-6", receiverName: "캐럿크리에이터", receiverAvatar: "CC", content: "감사해요! 밈은 일단 공감 포인트를 잡는 게 중요해요 ㅎㅎ", read: true, createdAt: "2026-03-22T20:15:00" },
    ];
    dms.forEach((d) => addItem(STORE_KEYS.FAN_DMS, d));
  }

  // ─── Fandom Editor Content Seed Data ──────────────────────────────────────
  if (listItems(STORE_KEYS.EDITOR_CONTENT).length === 0) {
    const editorContent: EditorContent[] = [
      {
        id: "ec-1", type: "idol-profile", title: "BTS 그룹 프로필", description: "방탄소년단 공식 프로필 정리", authorName: "아미드로잉",
        fandomId: "grp-bts", fandomName: "BTS", tags: ["BTS", "방탄소년단", "ARMY"], status: "published",
        likes: 234, views: 1560, commentCount: 12, createdAt: "2026-03-20", updatedAt: "2026-03-22",
        groupName: "BTS", company: "HYBE", debutDate: "2013-06-13", bio: "글로벌 K-POP 그룹 방탄소년단. 2013년 데뷔 이후 전 세계적으로 사랑받는 아이돌 그룹입니다.",
        members: [{ name: "RM", position: "리더/래퍼" }, { name: "Jin", position: "보컬" }, { name: "SUGA", position: "래퍼" }, { name: "j-hope", position: "댄서/래퍼" }, { name: "Jimin", position: "보컬/댄서" }, { name: "V", position: "보컬" }, { name: "Jung Kook", position: "보컬/센터" }],
        profileImageUrl: null, galleryImages: [],
      },
      {
        id: "ec-2", type: "fanart", title: "뉴진스 Ditto 팬아트", description: "Ditto MV 영감을 받은 팬아트",
        authorName: "버니작가", fandomId: "grp-nj", fandomName: "NewJeans", idolId: "mem-minji", idolName: "Minji",
        tags: ["NewJeans", "Ditto", "민지", "팬아트"], status: "published",
        likes: 456, views: 2340, commentCount: 23, createdAt: "2026-03-19", updatedAt: "2026-03-19",
        imageUrls: [], dimensions: "3:4", medium: "디지털",
      },
      {
        id: "ec-3", type: "fanfic", title: "별이 빛나는 밤에 - BTS 팬픽", description: "방탄소년단 멤버들의 따뜻한 우정 이야기",
        authorName: "올리작가", fandomId: "grp-bts", fandomName: "BTS",
        tags: ["BTS", "팬픽", "우정", "힐링"], status: "published",
        likes: 189, views: 890, commentCount: 34, createdAt: "2026-03-18", updatedAt: "2026-03-21",
        content: "서울의 밤하늘에 별이 빛나고 있었다. 연습실을 나선 일곱 명의 청년들은...", genre: "힐링/우정",
        chapters: [{ title: "프롤로그 - 별이 빛나는 밤", content: "서울의 밤하늘에 별이 빛나고 있었다..." }, { title: "1장 - 연습실의 새벽", content: "새벽 3시, 연습실의 불빛이..." }],
        wordCount: 3420,
      },
      {
        id: "ec-4", type: "event", title: "BLACKPINK 밈 챌린지 안내", description: "블랙핑크 밈 챌린지 상세 안내",
        authorName: "블링크아트", fandomId: "grp-bp", fandomName: "BLACKPINK",
        tags: ["BLACKPINK", "챌린지", "밈"], status: "published",
        likes: 78, views: 560, commentCount: 8, createdAt: "2026-03-15", updatedAt: "2026-03-15",
        eventName: "BLACKPINK 밈 챌린지", startDate: "2026-03-10", endDate: "2026-04-10",
        location: "온라인", link: "",
      },
      {
        id: "ec-5", type: "poll", title: "최고의 K-POP 댄스 브레이크는?", description: "역대 K-POP 댄스 브레이크 중 최고를 뽑아주세요!",
        authorName: "캐럿크리에이터", fandomId: "grp-svt", fandomName: "SEVENTEEN",
        tags: ["투표", "댄스브레이크", "K-POP"], status: "published",
        likes: 312, views: 4560, commentCount: 45, createdAt: "2026-03-22", updatedAt: "2026-03-22",
        question: "역대 K-POP 댄스 브레이크 중 최고는?",
        options: [
          { id: "opt-1", text: "BTS - MIC Drop", votes: 342 },
          { id: "opt-2", text: "SEVENTEEN - Super", votes: 287 },
          { id: "opt-3", text: "Stray Kids - LALALALA", votes: 198 },
          { id: "opt-4", text: "aespa - Supernova", votes: 156 },
        ],
        endDate: "2026-04-01", totalVotes: 983,
      },
      {
        id: "ec-6", type: "fanart", title: "에스파 Supernova 컨셉 아트", description: "Supernova 뮤직비디오 영감 팬아트",
        authorName: "마이드로우", fandomId: "grp-ae", fandomName: "aespa", idolId: "mem-karina", idolName: "Karina",
        tags: ["aespa", "Supernova", "카리나", "팬아트"], status: "draft",
        likes: 0, views: 0, commentCount: 0, createdAt: "2026-03-24", updatedAt: "2026-03-24",
        imageUrls: [], dimensions: "1:1", medium: "디지털",
      },
      {
        id: "ec-7", type: "fanfic", title: "르세라핌 FEARLESS 이야기", description: "두려움 없이 나아가는 다섯 소녀의 이야기",
        authorName: "피어낫작가", fandomId: "grp-lsf", fandomName: "LE SSERAFIM",
        tags: ["르세라핌", "팬픽", "FEARLESS"], status: "draft",
        likes: 0, views: 0, commentCount: 0, createdAt: "2026-03-23", updatedAt: "2026-03-24",
        content: "두려움이란 무엇일까. 무대 위에 선 다섯 소녀는...", genre: "성장/드라마",
        chapters: [{ title: "프롤로그", content: "두려움이란 무엇일까..." }],
        wordCount: 1200,
      },
    ];
    editorContent.forEach((c) => addItem(STORE_KEYS.EDITOR_CONTENT, c));
  }
}
