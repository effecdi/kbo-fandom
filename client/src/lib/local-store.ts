// ─── localStorage-based CRUD for fandom prototype ──────────────────────────────
// Used for features without backend APIs (fandom feed, events, creators, etc.)

import type { FandomTemplateType } from "./workspace-types";

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
  // Core (used by Studio/Editor)
  PROJECTS: "olli-fandom-projects",
  // Fandom
  FANDOM_USER_PROFILE: "olli-fandom-user-profile",
  KBO_TEAMS: "olli-fandom-groups",
  KBO_PLAYERS: "olli-fandom-members",
  // Backward compatibility aliases (same localStorage keys)
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
  // KBO Schedule
  KBO_SCHEDULE: "olli-kbo-schedule",
} as const;

// Backward compatibility aliases
export const IDOL_GROUPS_KEY = STORE_KEYS.KBO_TEAMS;
export const IDOL_MEMBERS_KEY = STORE_KEYS.KBO_PLAYERS;

// ─── ID Generator ────────────────────────────────────────────────────────────

let _counter = 0;
export function generateId(prefix = "item"): string {
  return `${prefix}-${Date.now()}-${++_counter}`;
}

// ─── Project Record (used by Studio/Editor) ─────────────────────────────────

export interface ProjectRecord {
  id: string;
  title: string;
  status: "draft" | "published" | "review";
  panels: number;
  thumbnail: string | null;
  updatedAt: string;
  createdAt: string;
}

// ─── Fandom User Profile ────────────────────────────────────────────────────

export interface FandomUserProfile {
  id: string;
  nickname: string;
  groupId: string;
  groupName: string;
  fandomName: string;
  favoritePlayer: string;
  secondPlayer: string;
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
  const teams = listItems<KboTeam>(STORE_KEYS.KBO_TEAMS);
  const team = teams.find((g) => g.id === groupId);
  if (!team) return { passed: false, score: 0, wrongKeys: ["groupId"] };

  const players = listItems<KboPlayer>(STORE_KEYS.KBO_PLAYERS).filter(
    (m) => m.groupId === groupId
  );

  const wrongKeys: string[] = [];

  // Q2: fandom name
  if (
    (answers.fandomName || "").trim().toLowerCase() !==
    team.fandomName.trim().toLowerCase()
  )
    wrongKeys.push("fandomName");

  // Q3: founded year (창단 연도)
  if (String(answers.foundedYear) !== String(team.foundedYear))
    wrongKeys.push("foundedYear");

  // Q4: city (연고지)
  if (
    (answers.city || "").trim().toLowerCase() !==
    team.city.trim().toLowerCase()
  )
    wrongKeys.push("city");

  // Q5: stadium (홈구장)
  if (
    (answers.stadium || "").trim() !== "" &&
    !(team.stadium.toLowerCase().includes((answers.stadium || "").trim().toLowerCase()))
  )
    wrongKeys.push("stadium");

  // Q6: captain/representative player
  const captains = players
    .slice(0, 3) // 대표 선수 (처음 3명 중 매칭)
    .map((m) => m.name.toLowerCase());
  if (
    (answers.captain || "").trim() !== "" &&
    !captains.includes((answers.captain || "").trim().toLowerCase())
  )
    wrongKeys.push("captain");

  const score = 5 - wrongKeys.length;
  return { passed: score >= 3, score, wrongKeys };
}

// ─── Fandom Type Definitions ────────────────────────────────────────────────

export interface KboTeam {
  id: string;
  name: string;
  nameKo: string;
  city: string;
  stadium: string;
  fandomName: string;
  foundedYear: number;
  followers: number;
  fanartCount: number;
  coverColor: string;
  secondaryColor: string;
  description: string;
  mascot: string;
}

export interface KboPlayer {
  id: string;
  groupId: string;
  name: string;
  nameKo: string;
  position: string;
  jerseyNumber: number;
  color: string;
}

// Backward compatibility aliases
export type IdolGroup = KboTeam;
export type IdolMember = KboPlayer;

// ─── KBO Game Schedule ──────────────────────────────────────────────────────

export interface KboGameSchedule {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  date: string;       // "2026-03-28"
  time: string;       // "18:30"
  stadium: string;
  status: "scheduled" | "live" | "finished" | "postponed";
  homeScore: number | null;
  awayScore: number | null;
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
  type: FandomTemplateType;
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
  favoritePlayer: string;
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
  topic: "잡담" | "질문" | "추천" | "소식" | "인증" | "직관인증";
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
  // ─── Projects (used by Studio) ──────────────────────────────────────────────
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

  // KBO Teams (10개 구단)
  if (listItems(STORE_KEYS.KBO_TEAMS).length === 0) {
    const teams: KboTeam[] = [
      { id: "team-lg", name: "LG Twins", nameKo: "LG 트윈스", city: "서울", stadium: "잠실야구장", fandomName: "트윈스 팬", foundedYear: 1982, followers: 42000, fanartCount: 2800, coverColor: "#C60C30", secondaryColor: "#000000", description: "서울을 대표하는 전통 구단, 2023년 한국시리즈 우승", mascot: "Luckii" },
      { id: "team-kt", name: "KT Wiz", nameKo: "KT 위즈", city: "수원", stadium: "수원KT위즈파크", fandomName: "위즈 팬", foundedYear: 2015, followers: 18000, fanartCount: 1200, coverColor: "#000000", secondaryColor: "#ED1C24", description: "수원의 젊은 구단, 2021년 한국시리즈 우승", mascot: "Vic" },
      { id: "team-ssg", name: "SSG Landers", nameKo: "SSG 랜더스", city: "인천", stadium: "인천SSG랜더스필드", fandomName: "랜더스 팬", foundedYear: 2000, followers: 25000, fanartCount: 1800, coverColor: "#CE0E2D", secondaryColor: "#1D1D1B", description: "인천의 자존심, 2022년 한국시리즈 우승", mascot: "Landro" },
      { id: "team-nc", name: "NC Dinos", nameKo: "NC 다이노스", city: "창원", stadium: "창원NC파크", fandomName: "다이노스 팬", foundedYear: 2013, followers: 22000, fanartCount: 1500, coverColor: "#315288", secondaryColor: "#C0A882", description: "창원의 공룡 군단, 2020년 한국시리즈 우승", mascot: "Dandi" },
      { id: "team-doo", name: "Doosan Bears", nameKo: "두산 베어스", city: "서울", stadium: "잠실야구장", fandomName: "베어스 팬", foundedYear: 1982, followers: 38000, fanartCount: 2500, coverColor: "#131230", secondaryColor: "#ED1C24", description: "잠실의 전통 강호, 최다 한국시리즈 우승 구단", mascot: "Beary" },
      { id: "team-kia", name: "KIA Tigers", nameKo: "KIA 타이거즈", city: "광주", stadium: "광주-기아챔피언스필드", fandomName: "타이거즈 팬", foundedYear: 1982, followers: 35000, fanartCount: 2400, coverColor: "#EA0029", secondaryColor: "#000000", description: "호남의 왕, KBO 최다 통합 우승 구단", mascot: "Hogini" },
      { id: "team-lot", name: "Lotte Giants", nameKo: "롯데 자이언츠", city: "부산", stadium: "사직야구장", fandomName: "자이언츠 팬", foundedYear: 1982, followers: 32000, fanartCount: 2100, coverColor: "#041E42", secondaryColor: "#E30613", description: "부산의 영웅, 열정적인 응원 문화의 원조", mascot: "Giant" },
      { id: "team-sam", name: "Samsung Lions", nameKo: "삼성 라이온즈", city: "대구", stadium: "대구삼성라이온즈파크", fandomName: "라이온즈 팬", foundedYear: 1982, followers: 30000, fanartCount: 2000, coverColor: "#074CA1", secondaryColor: "#FFFFFF", description: "대구의 사자, 4연패 신화의 주인공", mascot: "Blazey" },
      { id: "team-han", name: "Hanwha Eagles", nameKo: "한화 이글스", city: "대전", stadium: "한화생명이글스파크", fandomName: "이글스 팬", foundedYear: 1986, followers: 20000, fanartCount: 1400, coverColor: "#FF6600", secondaryColor: "#000000", description: "대전의 독수리, 꾸준한 팬사랑의 구단", mascot: "Suri" },
      { id: "team-kiw", name: "Kiwoom Heroes", nameKo: "키움 히어로즈", city: "서울", stadium: "고척스카이돔", fandomName: "히어로즈 팬", foundedYear: 2008, followers: 19000, fanartCount: 1300, coverColor: "#820024", secondaryColor: "#000000", description: "고척의 영웅들, 국내 유일 돔구장 구단", mascot: "Tuki" },
    ];
    teams.forEach((t) => addItem(STORE_KEYS.KBO_TEAMS, t));
  }

  // KBO Players (구단별 대표선수 5~6명)
  if (listItems(STORE_KEYS.KBO_PLAYERS).length === 0) {
    const players: KboPlayer[] = [
      // LG Twins
      { id: "plr-lg-1", groupId: "team-lg", name: "오지환", nameKo: "오지환", position: "내야수", jerseyNumber: 10, color: "#C60C30" },
      { id: "plr-lg-2", groupId: "team-lg", name: "박해민", nameKo: "박해민", position: "외야수", jerseyNumber: 17, color: "#C60C30" },
      { id: "plr-lg-3", groupId: "team-lg", name: "임찬규", nameKo: "임찬규", position: "투수", jerseyNumber: 29, color: "#C60C30" },
      { id: "plr-lg-4", groupId: "team-lg", name: "오스틴", nameKo: "오스틴", position: "외야수", jerseyNumber: 30, color: "#C60C30" },
      { id: "plr-lg-5", groupId: "team-lg", name: "박동원", nameKo: "박동원", position: "포수", jerseyNumber: 22, color: "#C60C30" },
      // KT Wiz
      { id: "plr-kt-1", groupId: "team-kt", name: "강백호", nameKo: "강백호", position: "내야수", jerseyNumber: 50, color: "#ED1C24" },
      { id: "plr-kt-2", groupId: "team-kt", name: "소형준", nameKo: "소형준", position: "투수", jerseyNumber: 11, color: "#ED1C24" },
      { id: "plr-kt-3", groupId: "team-kt", name: "장성우", nameKo: "장성우", position: "포수", jerseyNumber: 27, color: "#ED1C24" },
      { id: "plr-kt-4", groupId: "team-kt", name: "김민혁", nameKo: "김민혁", position: "외야수", jerseyNumber: 8, color: "#ED1C24" },
      { id: "plr-kt-5", groupId: "team-kt", name: "쿠에바스", nameKo: "쿠에바스", position: "투수", jerseyNumber: 34, color: "#ED1C24" },
      // SSG Landers
      { id: "plr-ssg-1", groupId: "team-ssg", name: "최정", nameKo: "최정", position: "내야수", jerseyNumber: 14, color: "#CE0E2D" },
      { id: "plr-ssg-2", groupId: "team-ssg", name: "김광현", nameKo: "김광현", position: "투수", jerseyNumber: 29, color: "#CE0E2D" },
      { id: "plr-ssg-3", groupId: "team-ssg", name: "추신수", nameKo: "추신수", position: "외야수", jerseyNumber: 17, color: "#CE0E2D" },
      { id: "plr-ssg-4", groupId: "team-ssg", name: "한유섬", nameKo: "한유섬", position: "외야수", jerseyNumber: 52, color: "#CE0E2D" },
      { id: "plr-ssg-5", groupId: "team-ssg", name: "오원석", nameKo: "오원석", position: "투수", jerseyNumber: 47, color: "#CE0E2D" },
      // NC Dinos
      { id: "plr-nc-1", groupId: "team-nc", name: "박건우", nameKo: "박건우", position: "외야수", jerseyNumber: 33, color: "#315288" },
      { id: "plr-nc-2", groupId: "team-nc", name: "에릭 양", nameKo: "에릭 양", position: "투수", jerseyNumber: 54, color: "#315288" },
      { id: "plr-nc-3", groupId: "team-nc", name: "손아섭", nameKo: "손아섭", position: "외야수", jerseyNumber: 15, color: "#315288" },
      { id: "plr-nc-4", groupId: "team-nc", name: "노진혁", nameKo: "노진혁", position: "내야수", jerseyNumber: 7, color: "#315288" },
      { id: "plr-nc-5", groupId: "team-nc", name: "양의지", nameKo: "양의지", position: "포수", jerseyNumber: 25, color: "#315288" },
      // Doosan Bears
      { id: "plr-doo-1", groupId: "team-doo", name: "양의지", nameKo: "양의지", position: "포수", jerseyNumber: 25, color: "#131230" },
      { id: "plr-doo-2", groupId: "team-doo", name: "허경민", nameKo: "허경민", position: "내야수", jerseyNumber: 16, color: "#131230" },
      { id: "plr-doo-3", groupId: "team-doo", name: "곽빈", nameKo: "곽빈", position: "투수", jerseyNumber: 22, color: "#131230" },
      { id: "plr-doo-4", groupId: "team-doo", name: "정수빈", nameKo: "정수빈", position: "외야수", jerseyNumber: 51, color: "#131230" },
      { id: "plr-doo-5", groupId: "team-doo", name: "김재환", nameKo: "김재환", position: "지명타자", jerseyNumber: 32, color: "#131230" },
      // KIA Tigers
      { id: "plr-kia-1", groupId: "team-kia", name: "양현종", nameKo: "양현종", position: "투수", jerseyNumber: 54, color: "#EA0029" },
      { id: "plr-kia-2", groupId: "team-kia", name: "나성범", nameKo: "나성범", position: "외야수", jerseyNumber: 47, color: "#EA0029" },
      { id: "plr-kia-3", groupId: "team-kia", name: "김도영", nameKo: "김도영", position: "내야수", jerseyNumber: 5, color: "#EA0029" },
      { id: "plr-kia-4", groupId: "team-kia", name: "소크라테스", nameKo: "소크라테스", position: "외야수", jerseyNumber: 30, color: "#EA0029" },
      { id: "plr-kia-5", groupId: "team-kia", name: "한승택", nameKo: "한승택", position: "포수", jerseyNumber: 22, color: "#EA0029" },
      // Lotte Giants
      { id: "plr-lot-1", groupId: "team-lot", name: "전준우", nameKo: "전준우", position: "외야수", jerseyNumber: 22, color: "#041E42" },
      { id: "plr-lot-2", groupId: "team-lot", name: "안치홍", nameKo: "안치홍", position: "내야수", jerseyNumber: 13, color: "#041E42" },
      { id: "plr-lot-3", groupId: "team-lot", name: "박세웅", nameKo: "박세웅", position: "투수", jerseyNumber: 11, color: "#041E42" },
      { id: "plr-lot-4", groupId: "team-lot", name: "윤동희", nameKo: "윤동희", position: "외야수", jerseyNumber: 51, color: "#041E42" },
      { id: "plr-lot-5", groupId: "team-lot", name: "나균안", nameKo: "나균안", position: "투수", jerseyNumber: 18, color: "#041E42" },
      // Samsung Lions
      { id: "plr-sam-1", groupId: "team-sam", name: "구자욱", nameKo: "구자욱", position: "외야수", jerseyNumber: 42, color: "#074CA1" },
      { id: "plr-sam-2", groupId: "team-sam", name: "오승환", nameKo: "오승환", position: "투수", jerseyNumber: 26, color: "#074CA1" },
      { id: "plr-sam-3", groupId: "team-sam", name: "김영웅", nameKo: "김영웅", position: "내야수", jerseyNumber: 6, color: "#074CA1" },
      { id: "plr-sam-4", groupId: "team-sam", name: "이재현", nameKo: "이재현", position: "포수", jerseyNumber: 35, color: "#074CA1" },
      { id: "plr-sam-5", groupId: "team-sam", name: "원태인", nameKo: "원태인", position: "투수", jerseyNumber: 17, color: "#074CA1" },
      // Hanwha Eagles
      { id: "plr-han-1", groupId: "team-han", name: "노시환", nameKo: "노시환", position: "내야수", jerseyNumber: 52, color: "#FF6600" },
      { id: "plr-han-2", groupId: "team-han", name: "문동주", nameKo: "문동주", position: "투수", jerseyNumber: 21, color: "#FF6600" },
      { id: "plr-han-3", groupId: "team-han", name: "채은성", nameKo: "채은성", position: "내야수", jerseyNumber: 44, color: "#FF6600" },
      { id: "plr-han-4", groupId: "team-han", name: "황준서", nameKo: "황준서", position: "투수", jerseyNumber: 19, color: "#FF6600" },
      { id: "plr-han-5", groupId: "team-han", name: "이주형", nameKo: "이주형", position: "외야수", jerseyNumber: 15, color: "#FF6600" },
      // Kiwoom Heroes
      { id: "plr-kiw-1", groupId: "team-kiw", name: "이정후", nameKo: "이정후", position: "외야수", jerseyNumber: 51, color: "#820024" },
      { id: "plr-kiw-2", groupId: "team-kiw", name: "안우진", nameKo: "안우진", position: "투수", jerseyNumber: 43, color: "#820024" },
      { id: "plr-kiw-3", groupId: "team-kiw", name: "김혜성", nameKo: "김혜성", position: "내야수", jerseyNumber: 3, color: "#820024" },
      { id: "plr-kiw-4", groupId: "team-kiw", name: "송성문", nameKo: "송성문", position: "내야수", jerseyNumber: 7, color: "#820024" },
      { id: "plr-kiw-5", groupId: "team-kiw", name: "이용찬", nameKo: "이용찬", position: "투수", jerseyNumber: 28, color: "#820024" },
    ];
    players.forEach((p) => addItem(STORE_KEYS.KBO_PLAYERS, p));
  }

  // Fandom Feed Posts (KBO 야구 팬아트)
  if (listItems(STORE_KEYS.FANDOM_FEED).length === 0) {
    const posts: FandomFeedPost[] = [
      { id: "fp-1", authorName: "트윈스드로잉", authorAvatar: "TD", groupId: "team-lg", groupName: "LG Twins", memberTags: ["오지환", "박해민"], title: "오지환 & 박해민 더블플레이 팬아트", description: "잠실의 철벽 콤비를 그려봤어요!", imageUrl: null, likes: 892, liked: false, commentCount: 45, type: "fanart", createdAt: "2026-03-23" },
      { id: "fp-2", authorName: "타이거즈아트", authorAvatar: "TA", groupId: "team-kia", groupName: "KIA Tigers", memberTags: ["양현종"], title: "양현종 에이스 포트레이트", description: "KIA의 전설 양현종 투구 팬아트", imageUrl: null, likes: 756, liked: false, commentCount: 38, type: "fanart", createdAt: "2026-03-23" },
      { id: "fp-3", authorName: "다이노스작가", authorAvatar: "DJ", groupId: "team-nc", groupName: "NC Dinos", memberTags: ["박건우", "양의지"], title: "NC 다이노스 우승 인스타툰", description: "2020 우승의 감동을 4컷 인스타툰으로!", imageUrl: null, likes: 1203, liked: false, commentCount: 67, type: "instatoon", createdAt: "2026-03-22" },
      { id: "fp-4", authorName: "랜더스그림", authorAvatar: "RG", groupId: "team-ssg", groupName: "SSG Landers", memberTags: ["최정", "추신수"], title: "최정 & 추신수 레전드 일러스트", description: "SSG 최정의 500홈런 기념 팬아트", imageUrl: null, likes: 645, liked: false, commentCount: 29, type: "fanart", createdAt: "2026-03-22" },
      { id: "fp-5", authorName: "베어스팬아트", authorAvatar: "BA", groupId: "team-doo", groupName: "Doosan Bears", memberTags: ["허경민"], title: "허경민 수비 팬아트", description: "두산의 철벽 유격수 팬아트", imageUrl: null, likes: 534, liked: false, commentCount: 22, type: "fanart", createdAt: "2026-03-21" },
      { id: "fp-6", authorName: "자이언츠크리", authorAvatar: "GC", groupId: "team-lot", groupName: "Lotte Giants", memberTags: ["전준우"], title: "사직구장 응원 밈 인스타툰", description: "롯데 팬들의 열정적인 응원 밈 ㅋㅋ", imageUrl: null, likes: 1567, liked: false, commentCount: 89, type: "meme", createdAt: "2026-03-21" },
      { id: "fp-7", authorName: "라이온즈아트", authorAvatar: "LA", groupId: "team-sam", groupName: "Samsung Lions", memberTags: ["구자욱", "오승환"], title: "삼성 라이온즈 4연패 팬아트", description: "삼성의 황금기를 기억하며", imageUrl: null, likes: 423, liked: false, commentCount: 18, type: "fanart", createdAt: "2026-03-20" },
      { id: "fp-8", authorName: "이글스작가", authorAvatar: "EW", groupId: "team-han", groupName: "Hanwha Eagles", memberTags: ["노시환", "문동주"], title: "한화 이글스 희망의 투수진", description: "문동주의 역투 장면 일러스트", imageUrl: null, likes: 389, liked: false, commentCount: 15, type: "fanart", createdAt: "2026-03-20" },
      { id: "fp-9", authorName: "트윈스드로잉", authorAvatar: "TD", groupId: "team-lg", groupName: "LG Twins", memberTags: ["임찬규"], title: "임찬규 삼진 인스타툰", description: "LG의 에이스 임찬규의 삼진 장면을 4컷으로!", imageUrl: null, likes: 2103, liked: false, commentCount: 112, type: "instatoon", createdAt: "2026-03-19" },
      { id: "fp-10", authorName: "타이거즈아트", authorAvatar: "TA", groupId: "team-kia", groupName: "KIA Tigers", memberTags: ["김도영"], title: "김도영 풀스윙 에디트", description: "김도영의 역동적인 타격 에디트", imageUrl: null, likes: 934, liked: false, commentCount: 41, type: "edit", createdAt: "2026-03-19" },
      { id: "fp-11", authorName: "자이언츠크리", authorAvatar: "GC", groupId: "team-lot", groupName: "Lotte Giants", memberTags: ["안치홍"], title: "부산 사직 응원 밈", description: "사직구장 응원 문화 밈 모음!", imageUrl: null, likes: 1876, liked: false, commentCount: 95, type: "meme", createdAt: "2026-03-18" },
      { id: "fp-12", authorName: "위즈아트", authorAvatar: "WA", groupId: "team-kt", groupName: "KT Wiz", memberTags: ["강백호", "소형준"], title: "강백호 & 소형준 케미 팬아트", description: "KT의 미래 듀오 팬아트", imageUrl: null, likes: 678, liked: false, commentCount: 34, type: "fanart", createdAt: "2026-03-18" },
      { id: "fp-13", authorName: "히어로즈그림", authorAvatar: "HG", groupId: "team-kiw", groupName: "Kiwoom Heroes", memberTags: ["이정후", "안우진"], title: "고척돔 일상 인스타툰", description: "키움 히어로즈 고척돔 일상 4컷", imageUrl: null, likes: 412, liked: false, commentCount: 19, type: "instatoon", createdAt: "2026-03-17" },
      { id: "fp-14", authorName: "라이온즈아트", authorAvatar: "LA", groupId: "team-sam", groupName: "Samsung Lions", memberTags: ["원태인", "김영웅"], title: "삼성 투타 콤비 팬아트", description: "원태인-김영웅 콤비 일러스트", imageUrl: null, likes: 567, liked: false, commentCount: 28, type: "fanart", createdAt: "2026-03-17" },
      { id: "fp-15", authorName: "베어스팬아트", authorAvatar: "BA", groupId: "team-doo", groupName: "Doosan Bears", memberTags: ["정수빈", "김재환"], title: "두산 타선 인스타툰", description: "두산 베어스 타선의 화력 4컷!", imageUrl: null, likes: 345, liked: false, commentCount: 14, type: "instatoon", createdAt: "2026-03-16" },
      { id: "fp-16", authorName: "이글스작가", authorAvatar: "EW", groupId: "team-han", groupName: "Hanwha Eagles", memberTags: ["황준서"], title: "황준서 팬아트", description: "한화의 미래 에이스 황준서 일러스트", imageUrl: null, likes: 501, liked: false, commentCount: 23, type: "fanart", createdAt: "2026-03-16" },
      { id: "fp-17", authorName: "트윈스드로잉", authorAvatar: "TD", groupId: "team-lg", groupName: "LG Twins", memberTags: ["오스틴"], title: "오스틴 홈런 팬아트", description: "LG 오스틴의 대포 홈런 장면 팬아트", imageUrl: null, likes: 1456, liked: false, commentCount: 72, type: "fanart", createdAt: "2026-03-15" },
      { id: "fp-18", authorName: "다이노스작가", authorAvatar: "DJ", groupId: "team-nc", groupName: "NC Dinos", memberTags: ["손아섭", "노진혁"], title: "NC 다이노스 경기 인스타툰", description: "NC 다이노스 경기 하이라이트 4컷!", imageUrl: null, likes: 923, liked: false, commentCount: 48, type: "instatoon", createdAt: "2026-03-15" },
    ];
    posts.forEach((p) => addItem(STORE_KEYS.FANDOM_FEED, p));
  }

  // Fandom Comments (KBO 야구)
  if (listItems(STORE_KEYS.FANDOM_COMMENTS).length === 0) {
    const comments: FandomComment[] = [
      { id: "fc-1", postId: "fp-1", authorName: "LG팬1004", authorAvatar: "L1", content: "더블플레이 장면 진짜 소름 돋게 그리셨어요!", likes: 23, liked: false, createdAt: "2026-03-23" },
      { id: "fc-2", postId: "fp-1", authorName: "잠실직관러", authorAvatar: "JG", content: "색감이 너무 좋아요!! 잠실 분위기 살아있네요", likes: 15, liked: false, createdAt: "2026-03-23" },
      { id: "fc-3", postId: "fp-1", authorName: "트윈스팬", authorAvatar: "TP", content: "오지환 수비 포즈 완벽 캡처! 대단해요", likes: 8, liked: false, parentId: "fc-1", createdAt: "2026-03-23" },
      { id: "fc-4", postId: "fp-3", authorName: "NC팬덤", authorAvatar: "NF", content: "2020 우승 인스타툰 너무 감동이에요! 그때 기억나네요", likes: 45, liked: false, createdAt: "2026-03-22" },
      { id: "fc-5", postId: "fp-3", authorName: "창원직관", authorAvatar: "CG", content: "4컷 스토리텔링 진짜 잘하시네요 ㅎㅎ", likes: 12, liked: false, createdAt: "2026-03-22" },
      { id: "fc-6", postId: "fp-6", authorName: "부산사직팬", authorAvatar: "BS", content: "사직구장 응원 ㅋㅋㅋ 공감 100%", likes: 67, liked: false, createdAt: "2026-03-21" },
      { id: "fc-7", postId: "fp-6", authorName: "롯데팬사랑", authorAvatar: "RL", content: "이거 공유해도 되나요?? 너무 웃겨요 ㅋㅋ", likes: 23, liked: false, createdAt: "2026-03-21" },
      { id: "fc-8", postId: "fp-6", authorName: "자이언츠", authorAvatar: "GI", content: "사직 가본 사람은 진짜 공감할 듯 ㅋㅋㅋ", likes: 34, liked: false, parentId: "fc-6", createdAt: "2026-03-21" },
      { id: "fc-9", postId: "fp-9", authorName: "임찬규팬", authorAvatar: "IC", content: "임찬규 삼진 인스타툰 진짜 잘 만드셨어요!! 대박", likes: 89, liked: false, createdAt: "2026-03-19" },
      { id: "fc-10", postId: "fp-9", authorName: "야구팬아트", authorAvatar: "YA", content: "퀄리티 미쳤다... 프로 크리에이터시죠?", likes: 56, liked: false, createdAt: "2026-03-19" },
      { id: "fc-11", postId: "fp-11", authorName: "사직러버", authorAvatar: "SL", content: "사직 응원 밈 너무 공감ㅋㅋㅋ", likes: 78, liked: false, createdAt: "2026-03-18" },
      { id: "fc-12", postId: "fp-11", authorName: "롯데1", authorAvatar: "L1", content: "이 밈 진짜 레전드다 ㅋㅋㅋ", likes: 45, liked: false, createdAt: "2026-03-18" },
      { id: "fc-13", postId: "fp-2", authorName: "KIA팬1", authorAvatar: "K1", content: "양현종 투구 폼 완벽해요!", likes: 34, liked: false, createdAt: "2026-03-23" },
      { id: "fc-14", postId: "fp-4", authorName: "SSG팬", authorAvatar: "SF", content: "최정 추신수 레전드 조합 최고!", likes: 19, liked: false, createdAt: "2026-03-22" },
      { id: "fc-15", postId: "fp-5", authorName: "두산1", authorAvatar: "D1", content: "허경민 수비 라인 살아있네요!", likes: 22, liked: false, createdAt: "2026-03-21" },
      { id: "fc-16", postId: "fp-7", authorName: "삼성팬", authorAvatar: "SF", content: "4연패 시절 추억이 새록새록!", likes: 15, liked: false, createdAt: "2026-03-20" },
      { id: "fc-17", postId: "fp-8", authorName: "한화팬1", authorAvatar: "H1", content: "문동주 역투 장면 팬아트 대박!", likes: 11, liked: false, createdAt: "2026-03-20" },
      { id: "fc-18", postId: "fp-10", authorName: "KIA팬2", authorAvatar: "K2", content: "김도영 에디트 완전 프로급이에요!", likes: 28, liked: false, createdAt: "2026-03-19" },
      { id: "fc-19", postId: "fp-12", authorName: "KT팬", authorAvatar: "KF", content: "강백호 소형준 콤비 최고!! ♥", likes: 31, liked: false, createdAt: "2026-03-18" },
      { id: "fc-20", postId: "fp-13", authorName: "키움팬", authorAvatar: "KW", content: "고척돔 일상 인스타툰 귀여워요 ㅎㅎ", likes: 14, liked: false, createdAt: "2026-03-17" },
      { id: "fc-21", postId: "fp-14", authorName: "삼성2", authorAvatar: "S2", content: "원태인 김영웅 콤비 팬아트 감동이에요!", likes: 20, liked: false, createdAt: "2026-03-17" },
      { id: "fc-22", postId: "fp-15", authorName: "두산2", authorAvatar: "D2", content: "두산 타선 인스타툰 화력 폭발!", likes: 9, liked: false, createdAt: "2026-03-16" },
      { id: "fc-23", postId: "fp-16", authorName: "한화2", authorAvatar: "H2", content: "황준서 일러스트 너무 멋져요!", likes: 17, liked: false, createdAt: "2026-03-16" },
      { id: "fc-24", postId: "fp-17", authorName: "LG팬3", authorAvatar: "L3", content: "오스틴 홈런 장면 완전 멋져요!!", likes: 43, liked: false, createdAt: "2026-03-15" },
      { id: "fc-25", postId: "fp-17", authorName: "잠실팬", authorAvatar: "JS", content: "디테일 미쳤다... 오스틴 그 자체!", likes: 38, liked: false, createdAt: "2026-03-15" },
    ];
    comments.forEach((c) => addItem(STORE_KEYS.FANDOM_COMMENTS, c));
  }

  // Fandom Events (KBO 이벤트)
  if (listItems(STORE_KEYS.FANDOM_EVENTS).length === 0) {
    const events: FandomEvent[] = [
      { id: "evt-1", title: "KIA 타이거즈 2026 시즌 응원 팬아트 챌린지", description: "KIA 타이거즈 2026 시즌 개막을 기념하는 팬아트 챌린지! 선수별 또는 팀 팬아트를 제출하세요.", groupId: "team-kia", groupName: "KIA Tigers", type: "challenge", status: "active", participants: 234, prize: "KIA 시즌 관람권 + 공식 굿즈", startDate: "2026-03-01", endDate: "2026-04-30", coverColor: "#EA0029" },
      { id: "evt-2", title: "NC 다이노스 인스타툰 콘테스트", description: "NC 다이노스의 경기 하이라이트를 4컷 인스타툰으로 만들어주세요!", groupId: "team-nc", groupName: "NC Dinos", type: "contest", status: "active", participants: 156, prize: "NC 사인볼 + 유니폼 세트", startDate: "2026-03-15", endDate: "2026-04-15", coverColor: "#315288" },
      { id: "evt-3", title: "롯데 자이언츠 응원 밈 챌린지", description: "사직구장의 열정적인 응원 문화를 밈/인스타툰으로 만들어주세요!", groupId: "team-lot", groupName: "Lotte Giants", type: "challenge", status: "active", participants: 189, prize: "롯데 MD + 사직 시즌권", startDate: "2026-03-10", endDate: "2026-04-10", coverColor: "#041E42" },
      { id: "evt-4", title: "LG 트윈스 x 크리에이터 콜라보", description: "LG 트윈스 공식 콜라보! 최우수 팬아트는 구단 공식 SNS에 게시됩니다.", groupId: "team-lg", groupName: "LG Twins", type: "collab", status: "active", participants: 312, prize: "구단 공식 SNS 게시 + 시즌권", startDate: "2026-03-01", endDate: "2026-04-30", coverColor: "#C60C30" },
      { id: "evt-5", title: "KBO 올스타전 기념 팬아트 페스타", description: "KBO 올스타전을 기념하는 팬아트 이벤트! 10개 구단 선수를 자유롭게 그려주세요.", groupId: "team-sam", groupName: "Samsung Lions", type: "contest", status: "upcoming", participants: 0, prize: "올스타전 관람권 2매 + 굿즈 패키지", startDate: "2026-07-01", endDate: "2026-07-31", coverColor: "#074CA1" },
      { id: "evt-6", title: "한화 이글스 팬아트 챌린지", description: "한화 이글스의 젊은 투수진을 응원하는 팬아트 챌린지! 문동주, 황준서를 그려주세요.", groupId: "team-han", groupName: "Hanwha Eagles", type: "challenge", status: "upcoming", participants: 0, prize: "한화 사인볼 + 유니폼", startDate: "2026-04-15", endDate: "2026-05-15", coverColor: "#FF6600" },
      { id: "evt-7", title: "두산 베어스 창단 기념 이벤트", description: "두산 베어스의 전통을 기리는 팬아트 & 인스타툰 공모전!", groupId: "team-doo", groupName: "Doosan Bears", type: "anniversary", status: "ended", participants: 145, prize: "두산 시즌권 + 사인 유니폼", startDate: "2026-01-01", endDate: "2026-02-01", coverColor: "#131230" },
      { id: "evt-8", title: "SSG 랜더스 팬아트 챌린지", description: "인천의 자존심 SSG 랜더스 선수들을 팬아트로 표현하세요!", groupId: "team-ssg", groupName: "SSG Landers", type: "challenge", status: "ended", participants: 98, prize: "SSG 관람권 세트", startDate: "2026-02-01", endDate: "2026-03-01", coverColor: "#CE0E2D" },
    ];
    events.forEach((e) => addItem(STORE_KEYS.FANDOM_EVENTS, e));
  }

  // Fan Creators (KBO 팬 크리에이터)
  if (listItems(STORE_KEYS.FAN_CREATORS).length === 0) {
    const creators: FanCreator[] = [
      { id: "fan-1", nickname: "트윈스드로잉", avatar: "TD", bio: "LG 트윈스 팬아트 전문 크리에이터 잠실 직관러", groupId: "team-lg", groupName: "LG Twins", favoritePlayer: "오지환", fanartCount: 48, followerCount: 1230, followingCount: 45, totalLikes: 15600, badge: "top", joinedAt: "2025-06-15" },
      { id: "fan-2", nickname: "타이거즈아트", avatar: "TA", bio: "KIA 타이거즈 일러스트레이터 광주 챔필 홈팬", groupId: "team-kia", groupName: "KIA Tigers", favoritePlayer: "양현종", fanartCount: 35, followerCount: 890, followingCount: 32, totalLikes: 9800, badge: "popular", joinedAt: "2025-08-20" },
      { id: "fan-3", nickname: "다이노스작가", avatar: "DJ", bio: "NC 다이노스 인스타툰 크리에이터 창원직관러", groupId: "team-nc", groupName: "NC Dinos", favoritePlayer: "박건우", fanartCount: 52, followerCount: 2100, followingCount: 38, totalLikes: 22400, badge: "top", joinedAt: "2025-05-10" },
      { id: "fan-4", nickname: "랜더스그림", avatar: "RG", bio: "SSG 랜더스 팬아트 그리는 인천팬", groupId: "team-ssg", groupName: "SSG Landers", favoritePlayer: "최정", fanartCount: 28, followerCount: 560, followingCount: 51, totalLikes: 5400, badge: "rising", joinedAt: "2025-09-01" },
      { id: "fan-5", nickname: "베어스팬아트", avatar: "BA", bio: "두산 베어스 팬아트 & 밈 제작 잠실 단골", groupId: "team-doo", groupName: "Doosan Bears", favoritePlayer: "허경민", fanartCount: 31, followerCount: 720, followingCount: 28, totalLikes: 7200, badge: "popular", joinedAt: "2025-07-22" },
      { id: "fan-6", nickname: "자이언츠크리", avatar: "GC", bio: "롯데 자이언츠 밈 장인 ㅋㅋ 사직 응원문화 전파", groupId: "team-lot", groupName: "Lotte Giants", favoritePlayer: "전준우", fanartCount: 44, followerCount: 1560, followingCount: 41, totalLikes: 18900, badge: "top", joinedAt: "2025-04-05" },
      { id: "fan-7", nickname: "라이온즈아트", avatar: "LA", bio: "삼성 라이온즈 팬아트 크리에이터 대구팬", groupId: "team-sam", groupName: "Samsung Lions", favoritePlayer: "구자욱", fanartCount: 22, followerCount: 380, followingCount: 55, totalLikes: 3800, badge: "rising", joinedAt: "2025-10-12" },
      { id: "fan-8", nickname: "이글스작가", avatar: "EW", bio: "한화 이글스 팬아트 전문 대전직관러", groupId: "team-han", groupName: "Hanwha Eagles", favoritePlayer: "노시환", fanartCount: 19, followerCount: 340, followingCount: 29, totalLikes: 3200, badge: "rising", joinedAt: "2025-11-01" },
      { id: "fan-9", nickname: "KBO작가", avatar: "KB", bio: "KBO 전 구단 크리에이터 다양한 구단 팬아트", groupId: "team-lg", groupName: "LG Twins", favoritePlayer: "박해민", fanartCount: 67, followerCount: 3200, followingCount: 120, totalLikes: 34500, badge: "top", joinedAt: "2025-01-15" },
      { id: "fan-10", nickname: "위즈아트", avatar: "WA", bio: "KT 위즈 일러스트 & 굿즈 제작", groupId: "team-kt", groupName: "KT Wiz", favoritePlayer: "강백호", fanartCount: 15, followerCount: 210, followingCount: 67, totalLikes: 1800, badge: "rookie", joinedAt: "2026-01-20" },
      { id: "fan-11", nickname: "히어로즈그림", avatar: "HG", bio: "키움 히어로즈 팬아트 고척돔 직관러", groupId: "team-kiw", groupName: "Kiwoom Heroes", favoritePlayer: "이정후", fanartCount: 12, followerCount: 180, followingCount: 34, totalLikes: 1200, badge: "rookie", joinedAt: "2026-02-10" },
      { id: "fan-12", nickname: "임찬규팬", avatar: "IC", bio: "임찬규 팬아트 모아 놓는 계정", groupId: "team-lg", groupName: "LG Twins", favoritePlayer: "임찬규", fanartCount: 25, followerCount: 890, followingCount: 42, totalLikes: 8900, badge: "popular", joinedAt: "2025-08-05" },
    ];
    creators.forEach((c) => addItem(STORE_KEYS.FAN_CREATORS, c));
  }

  // Fan Talk Posts (KBO 야구 토크)
  if (listItems(STORE_KEYS.FAN_TALK_POSTS).length === 0) {
    const talkPosts: FanTalkPost[] = [
      { id: "talk-1", authorId: "fan-1", authorName: "트윈스드로잉", authorAvatar: "TD", groupId: "team-lg", groupName: "LG Twins", content: "오늘 잠실 직관 가시는 분?! 오지환 타격 폼 팬아트 영감 잡아야해요", topic: "잡담", likes: 45, liked: false, replyCount: 12, createdAt: "2026-03-24T09:30:00" },
      { id: "talk-2", authorId: "fan-3", authorName: "다이노스작가", authorAvatar: "DJ", groupId: "team-nc", groupName: "NC Dinos", content: "야구 인스타툰 그릴 때 어떤 장면이 제일 반응 좋았어요? 저는 역전 홈런 장면이 대박이었는데", topic: "질문", likes: 67, liked: false, replyCount: 23, createdAt: "2026-03-24T08:15:00" },
      { id: "talk-3", authorId: "fan-6", authorName: "자이언츠크리", authorAvatar: "GC", groupId: "team-lot", groupName: "Lotte Giants", content: "사직구장 응원 밈 새로 만들었는데 반응이 미쳤어요 ㅋㅋㅋ 여러분도 밈 챌린지 참여하세요!", topic: "인증", likes: 89, liked: false, replyCount: 34, createdAt: "2026-03-24T07:00:00" },
      { id: "talk-4", authorId: "fan-9", authorName: "KBO작가", authorAvatar: "KB", groupId: "team-lg", groupName: "LG Twins", content: "야구 팬아트 그릴 때 참고하기 좋은 자료 추천!\n1. KBO 공식 사진\n2. 스포츠 일러스트\n3. 야구 포즈 레퍼런스", topic: "추천", likes: 156, liked: false, replyCount: 45, createdAt: "2026-03-23T22:00:00" },
      { id: "talk-5", authorId: "fan-2", authorName: "타이거즈아트", authorAvatar: "TA", groupId: "team-kia", groupName: "KIA Tigers", content: "김도영 20-20 달성 기념 팬아트 이벤트 소식!! 지금 참여 가능!", topic: "소식", likes: 112, liked: false, replyCount: 28, createdAt: "2026-03-23T20:30:00" },
      { id: "talk-6", authorId: "fan-5", authorName: "베어스팬아트", authorAvatar: "BA", groupId: "team-doo", groupName: "Doosan Bears", content: "두산 선수별 팬아트 프로젝트 같이 하실 분 구합니다! 선수별 한 장씩 분배해서 합작하고 싶어요", topic: "잡담", likes: 78, liked: false, replyCount: 19, createdAt: "2026-03-23T18:45:00" },
      { id: "talk-7", authorId: "fan-4", authorName: "랜더스그림", authorAvatar: "RG", groupId: "team-ssg", groupName: "SSG Landers", content: "야구 유니폼 그릴 때 팁 있으신 분? 로고랑 번호를 정확하게 그리고 싶은데 어려워요 ㅠ", topic: "질문", likes: 34, liked: false, replyCount: 15, createdAt: "2026-03-23T16:20:00" },
      { id: "talk-8", authorId: "fan-12", authorName: "임찬규팬", authorAvatar: "IC", groupId: "team-lg", groupName: "LG Twins", content: "임찬규 삼진 인스타툰 시리즈 완성했어요! 피드에 올렸으니 봐주세요", topic: "인증", likes: 201, liked: false, replyCount: 56, createdAt: "2026-03-23T14:00:00" },
      { id: "talk-9", authorId: "fan-7", authorName: "라이온즈아트", authorAvatar: "LA", groupId: "team-sam", groupName: "Samsung Lions", content: "삼성 라이온즈 신규 유니폼 디자인 공개됐어요!! 팬아트 들어갑니다", topic: "소식", likes: 56, liked: false, replyCount: 11, createdAt: "2026-03-23T12:30:00" },
      { id: "talk-10", authorId: "fan-10", authorName: "위즈아트", authorAvatar: "WA", groupId: "team-kt", groupName: "KT Wiz", content: "팬아트 초보인데 AI 써보니까 진짜 신세계에요... 강백호 팬아트 처음으로 완성!", topic: "인증", likes: 93, liked: false, replyCount: 31, createdAt: "2026-03-23T10:15:00" },
      { id: "talk-11", authorId: "fan-8", authorName: "이글스작가", authorAvatar: "EW", groupId: "team-han", groupName: "Hanwha Eagles", content: "한화 이글스 팬아트 챌린지 참여했는데 결과 언제 나오나요?", topic: "질문", likes: 22, liked: false, replyCount: 8, createdAt: "2026-03-22T21:00:00" },
      { id: "talk-12", authorId: "fan-11", authorName: "히어로즈그림", authorAvatar: "HG", groupId: "team-kiw", groupName: "Kiwoom Heroes", content: "이정후 팬아트 그리다가 자동으로 타격폼이 그려지는 건 저만 그런가요 ㅋㅋㅋ", topic: "잡담", likes: 134, liked: false, replyCount: 42, createdAt: "2026-03-22T19:30:00" },
    ];
    talkPosts.forEach((t) => addItem(STORE_KEYS.FAN_TALK_POSTS, t));
  }

  // Fan DMs (demo conversations)
  if (listItems(STORE_KEYS.FAN_DMS).length === 0) {
    const dms: FanDM[] = [
      { id: "dm-1", senderId: "fan-3", senderName: "다이노스작가", senderAvatar: "DJ", receiverId: "me", receiverName: "나", receiverAvatar: "ME", content: "안녕하세요! 팬아트 스타일 너무 좋아요 혹시 합작 관심 있으신가요?", read: false, createdAt: "2026-03-24T10:00:00" },
      { id: "dm-2", senderId: "me", senderName: "나", senderAvatar: "ME", receiverId: "fan-3", receiverName: "다이노스작가", receiverAvatar: "DJ", content: "감사합니다! 합작 좋아요~ 어떤 컨셉으로 하고 싶으세요?", read: true, createdAt: "2026-03-24T10:05:00" },
      { id: "dm-3", senderId: "fan-3", senderName: "다이노스작가", senderAvatar: "DJ", receiverId: "me", receiverName: "나", receiverAvatar: "ME", content: "NC 선수별로 한 장씩 그려서 합치면 어떨까요? 저는 박건우랑 양의지를 맡을게요!", read: false, createdAt: "2026-03-24T10:10:00" },
      { id: "dm-4", senderId: "fan-9", senderName: "KBO작가", senderAvatar: "KB", receiverId: "me", receiverName: "나", receiverAvatar: "ME", content: "팬아트 이벤트 같이 참여할래요? KIA 타이거즈 시즌 챌린지요!", read: false, createdAt: "2026-03-23T15:30:00" },
      { id: "dm-5", senderId: "fan-6", senderName: "자이언츠크리", senderAvatar: "GC", receiverId: "me", receiverName: "나", receiverAvatar: "ME", content: "밈 만드는 팁 좀 알려주실 수 있나요? 항상 작품 잘 보고 있어요!", read: true, createdAt: "2026-03-22T20:00:00" },
      { id: "dm-6", senderId: "me", senderName: "나", senderAvatar: "ME", receiverId: "fan-6", receiverName: "자이언츠크리", receiverAvatar: "GC", content: "감사해요! 밈은 일단 공감 포인트를 잡는 게 중요해요 ㅎㅎ", read: true, createdAt: "2026-03-22T20:15:00" },
    ];
    dms.forEach((d) => addItem(STORE_KEYS.FAN_DMS, d));
  }

  // ─── Fandom Editor Content Seed Data ──────────────────────────────────────
  if (listItems(STORE_KEYS.EDITOR_CONTENT).length === 0) {
    const editorContent: EditorContent[] = [
      {
        id: "ec-1", type: "idol-profile", title: "LG 트윈스 구단 프로필", description: "LG 트윈스 공식 프로필 정리", authorName: "트윈스드로잉",
        fandomId: "team-lg", fandomName: "LG Twins", tags: ["LG", "트윈스", "잠실"], status: "published",
        likes: 234, views: 1560, commentCount: 12, createdAt: "2026-03-20", updatedAt: "2026-03-22",
        groupName: "LG Twins", company: "LG", debutDate: "1982-01-01", bio: "서울을 대표하는 전통 구단 LG 트윈스. 1982년 창단 이후 잠실야구장을 홈으로 하는 명문 구단입니다.",
        members: [{ name: "오지환", position: "내야수" }, { name: "박해민", position: "외야수" }, { name: "임찬규", position: "투수" }, { name: "오스틴", position: "외야수" }, { name: "박동원", position: "포수" }],
        profileImageUrl: null, galleryImages: [],
      },
      {
        id: "ec-2", type: "fanart", title: "NC 다이노스 우승 팬아트", description: "2020 한국시리즈 우승 영감 팬아트",
        authorName: "다이노스작가", fandomId: "team-nc", fandomName: "NC Dinos", idolId: "plr-nc-1", idolName: "박건우",
        tags: ["NC", "다이노스", "우승", "팬아트"], status: "published",
        likes: 456, views: 2340, commentCount: 23, createdAt: "2026-03-19", updatedAt: "2026-03-19",
        imageUrls: [], dimensions: "3:4", medium: "디지털",
      },
      {
        id: "ec-3", type: "fanfic", title: "잠실의 밤 - 야구 팬픽", description: "잠실야구장에서 펼쳐지는 감동의 야구 이야기",
        authorName: "KBO작가", fandomId: "team-lg", fandomName: "LG Twins",
        tags: ["LG", "잠실", "야구", "팬픽"], status: "published",
        likes: 189, views: 890, commentCount: 34, createdAt: "2026-03-18", updatedAt: "2026-03-21",
        content: "잠실야구장의 조명이 밝게 빛나고 있었다. 9회말 2아웃, 투스트라이크에서...", genre: "스포츠/감동",
        chapters: [{ title: "프롤로그 - 잠실의 밤", content: "잠실야구장의 조명이 밝게 빛나고 있었다..." }, { title: "1장 - 9회말의 기적", content: "9회말, 스코어보드에는 1-2가 찍혀있었다..." }],
        wordCount: 3420,
      },
      {
        id: "ec-4", type: "event", title: "롯데 자이언츠 응원 밈 챌린지 안내", description: "롯데 응원 밈 챌린지 상세 안내",
        authorName: "자이언츠크리", fandomId: "team-lot", fandomName: "Lotte Giants",
        tags: ["롯데", "챌린지", "밈", "사직"], status: "published",
        likes: 78, views: 560, commentCount: 8, createdAt: "2026-03-15", updatedAt: "2026-03-15",
        eventName: "롯데 자이언츠 응원 밈 챌린지", startDate: "2026-03-10", endDate: "2026-04-10",
        location: "온라인", link: "",
      },
      {
        id: "ec-5", type: "poll", title: "2026 시즌 최고의 홈런왕 후보는?", description: "올 시즌 홈런왕 후보를 뽑아주세요!",
        authorName: "KBO작가", fandomId: "team-lg", fandomName: "LG Twins",
        tags: ["투표", "홈런왕", "KBO"], status: "published",
        likes: 312, views: 4560, commentCount: 45, createdAt: "2026-03-22", updatedAt: "2026-03-22",
        question: "2026 시즌 최고의 홈런왕 후보는?",
        options: [
          { id: "opt-1", text: "오스틴 (LG)", votes: 342 },
          { id: "opt-2", text: "최정 (SSG)", votes: 287 },
          { id: "opt-3", text: "강백호 (KT)", votes: 198 },
          { id: "opt-4", text: "노시환 (한화)", votes: 156 },
        ],
        endDate: "2026-04-01", totalVotes: 983,
      },
      {
        id: "ec-6", type: "fanart", title: "SSG 랜더스 최정 500홈런 아트", description: "최정 500홈런 기념 팬아트",
        authorName: "랜더스그림", fandomId: "team-ssg", fandomName: "SSG Landers", idolId: "plr-ssg-1", idolName: "최정",
        tags: ["SSG", "최정", "500홈런", "팬아트"], status: "draft",
        likes: 0, views: 0, commentCount: 0, createdAt: "2026-03-24", updatedAt: "2026-03-24",
        imageUrls: [], dimensions: "1:1", medium: "디지털",
      },
      {
        id: "ec-7", type: "fanfic", title: "사직의 함성 - 롯데 팬픽", description: "부산 사직야구장의 열정적인 응원 이야기",
        authorName: "자이언츠크리", fandomId: "team-lot", fandomName: "Lotte Giants",
        tags: ["롯데", "팬픽", "사직", "응원"], status: "draft",
        likes: 0, views: 0, commentCount: 0, createdAt: "2026-03-23", updatedAt: "2026-03-24",
        content: "부산 사직야구장의 관중석이 들썩거리고 있었다. 3만 관중의 함성이...", genre: "스포츠/열정",
        chapters: [{ title: "프롤로그", content: "부산 사직야구장의 관중석이 들썩거리고 있었다..." }],
        wordCount: 1200,
      },
    ];
    editorContent.forEach((c) => addItem(STORE_KEYS.EDITOR_CONTENT, c));
  }

  // ── KBO Schedule Seed ──────────────────────────────────────────────────────
  if (listItems(STORE_KEYS.KBO_SCHEDULE).length === 0) {
    const schedule: KboGameSchedule[] = [
      // 오늘 경기 (2026-03-28)
      { id: "game-1", homeTeamId: "team-lg", awayTeamId: "team-doosan", homeTeamName: "LG 트윈스", awayTeamName: "두산 베어스", date: "2026-03-28", time: "18:30", stadium: "잠실야구장", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-2", homeTeamId: "team-kt", awayTeamId: "team-nc", homeTeamName: "KT 위즈", awayTeamName: "NC 다이노스", date: "2026-03-28", time: "18:30", stadium: "수원KT위즈파크", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-3", homeTeamId: "team-ssg", awayTeamId: "team-kia", homeTeamName: "SSG 랜더스", awayTeamName: "KIA 타이거즈", date: "2026-03-28", time: "18:30", stadium: "인천SSG랜더스필드", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-4", homeTeamId: "team-lot", awayTeamId: "team-samsung", homeTeamName: "롯데 자이언츠", awayTeamName: "삼성 라이온즈", date: "2026-03-28", time: "18:30", stadium: "사직야구장", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-5", homeTeamId: "team-hanwha", awayTeamId: "team-kiwoom", homeTeamName: "한화 이글스", awayTeamName: "키움 히어로즈", date: "2026-03-28", time: "18:30", stadium: "한화생명이글스파크", status: "scheduled", homeScore: null, awayScore: null },
      // 어제 경기 (종료)
      { id: "game-6", homeTeamId: "team-kia", awayTeamId: "team-lg", homeTeamName: "KIA 타이거즈", awayTeamName: "LG 트윈스", date: "2026-03-27", time: "18:30", stadium: "광주-기아챔피언스필드", status: "finished", homeScore: 5, awayScore: 3 },
      { id: "game-7", homeTeamId: "team-doosan", awayTeamId: "team-ssg", homeTeamName: "두산 베어스", awayTeamName: "SSG 랜더스", date: "2026-03-27", time: "18:30", stadium: "잠실야구장", status: "finished", homeScore: 2, awayScore: 7 },
      { id: "game-8", homeTeamId: "team-nc", awayTeamId: "team-hanwha", homeTeamName: "NC 다이노스", awayTeamName: "한화 이글스", date: "2026-03-27", time: "18:30", stadium: "창원NC파크", status: "finished", homeScore: 4, awayScore: 4 },
      { id: "game-9", homeTeamId: "team-samsung", awayTeamId: "team-kt", homeTeamName: "삼성 라이온즈", awayTeamName: "KT 위즈", date: "2026-03-27", time: "18:30", stadium: "대구삼성라이온즈파크", status: "finished", homeScore: 6, awayScore: 1 },
      { id: "game-10", homeTeamId: "team-kiwoom", awayTeamId: "team-lot", homeTeamName: "키움 히어로즈", awayTeamName: "롯데 자이언츠", date: "2026-03-27", time: "18:30", stadium: "고척스카이돔", status: "finished", homeScore: 3, awayScore: 5 },
      // 내일 경기
      { id: "game-11", homeTeamId: "team-lg", awayTeamId: "team-kia", homeTeamName: "LG 트윈스", awayTeamName: "KIA 타이거즈", date: "2026-03-29", time: "14:00", stadium: "잠실야구장", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-12", homeTeamId: "team-ssg", awayTeamId: "team-doosan", homeTeamName: "SSG 랜더스", awayTeamName: "두산 베어스", date: "2026-03-29", time: "14:00", stadium: "인천SSG랜더스필드", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-13", homeTeamId: "team-hanwha", awayTeamId: "team-nc", homeTeamName: "한화 이글스", awayTeamName: "NC 다이노스", date: "2026-03-29", time: "14:00", stadium: "한화생명이글스파크", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-14", homeTeamId: "team-kt", awayTeamId: "team-samsung", homeTeamName: "KT 위즈", awayTeamName: "삼성 라이온즈", date: "2026-03-29", time: "14:00", stadium: "수원KT위즈파크", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-15", homeTeamId: "team-lot", awayTeamId: "team-kiwoom", homeTeamName: "롯데 자이언츠", awayTeamName: "키움 히어로즈", date: "2026-03-29", time: "14:00", stadium: "사직야구장", status: "scheduled", homeScore: null, awayScore: null },
      // 추가 경기 (3/30 ~ 4/1)
      { id: "game-16", homeTeamId: "team-doosan", awayTeamId: "team-kt", homeTeamName: "두산 베어스", awayTeamName: "KT 위즈", date: "2026-03-30", time: "14:00", stadium: "잠실야구장", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-17", homeTeamId: "team-kia", awayTeamId: "team-lot", homeTeamName: "KIA 타이거즈", awayTeamName: "롯데 자이언츠", date: "2026-03-30", time: "14:00", stadium: "광주-기아챔피언스필드", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-18", homeTeamId: "team-nc", awayTeamId: "team-kiwoom", homeTeamName: "NC 다이노스", awayTeamName: "키움 히어로즈", date: "2026-03-30", time: "14:00", stadium: "창원NC파크", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-19", homeTeamId: "team-samsung", awayTeamId: "team-hanwha", homeTeamName: "삼성 라이온즈", awayTeamName: "한화 이글스", date: "2026-03-31", time: "18:30", stadium: "대구삼성라이온즈파크", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-20", homeTeamId: "team-kiwoom", awayTeamId: "team-ssg", homeTeamName: "키움 히어로즈", awayTeamName: "SSG 랜더스", date: "2026-03-31", time: "18:30", stadium: "고척스카이돔", status: "scheduled", homeScore: null, awayScore: null },
    ];
    schedule.forEach((g) => addItem(STORE_KEYS.KBO_SCHEDULE, g));
  }
}
