// ─── localStorage-based CRUD for fandom prototype ──────────────────────────────
// Used for features without backend APIs (fandom feed, events, creators, etc.)

import type { FandomTemplateType, FandomStylePreset } from "./workspace-types";
import { generateKbo2026Schedule } from "./kbo-schedule-generator";

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
  FANDOM_FEED: "olli-fandom-feed",
  FANDOM_COMMENTS: "olli-fandom-comments",
  FANDOM_EVENTS: "olli-fandom-events",
  // Fan Social
  FAN_CREATORS: "olli-fandom-creators",
  FAN_FOLLOWS: "olli-fandom-follows",
  FAN_DMS: "olli-fandom-dms",
  FAN_TALK_POSTS: "olli-fandom-talk",
  // Fandom Editor Content
  EDITOR_PLAYER_PROFILES: "olli-editor-player-profiles",
  EDITOR_FANART: "olli-editor-fanart",
  EDITOR_FANFIC: "olli-editor-fanfic",
  EDITOR_EVENTS: "olli-editor-events",
  EDITOR_POLLS: "olli-editor-polls",
  EDITOR_CONTENT: "olli-editor-all-content",
  // KBO Schedule
  KBO_SCHEDULE: "olli-kbo-schedule",
  // KBO Extended
  KBO_ATTENDANCE: "olli-kbo-attendance",
  KBO_STANDINGS: "olli-kbo-standings",
  CHEER_SONGS: "olli-cheer-songs",
  STADIUM_GUIDES: "olli-stadium-guides",
  PHOTOCARD_COLLECTION: "olli-photocard-collection",
  GOODS_TRADES: "olli-goods-trades",
  SEED_VERSION: "olli-seed-version",
} as const;

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
  // Fandom metadata (populated from CreateFanart)
  templateType?: FandomTemplateType;
  teamId?: string;
  teamName?: string;
  teamColor?: string;
  stylePreset?: FandomStylePreset;
  memberTags?: string[];
  description?: string;
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
  /** If registered as creator, their creator ID */
  creatorId?: string;
  /** Bio for creator profile */
  bio?: string;
  /** Custom lanyard card image URL (from editor/photocard) */
  lanyardCardUrl?: string;
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

// ─── Creator Registration & Engagement ──────────────────────────────────────

/** Register current user as a creator */
export function registerAsCreator(bio: string): FanCreator | null {
  const profile = getFandomProfile();
  if (!profile) return null;

  // Check if already registered
  const existing = listItems<FanCreator>(STORE_KEYS.FAN_CREATORS).find(
    (c) => c.id === `creator-${profile.id}` || c.nickname === profile.nickname
  );
  if (existing) return existing;

  const creator: FanCreator = {
    id: `creator-${profile.id}`,
    nickname: profile.nickname,
    avatar: profile.nickname.slice(0, 2).toUpperCase(),
    bio,
    groupId: profile.groupId,
    groupName: profile.groupName,
    favoritePlayer: profile.favoritePlayer,
    fanartCount: 0,
    followerCount: 0,
    followingCount: 0,
    totalLikes: 0,
    totalSaves: 0,
    totalShares: 0,
    engagementScore: 0,
    badge: "rookie",
    joinedAt: new Date().toISOString().slice(0, 10),
  };

  addItem(STORE_KEYS.FAN_CREATORS, creator);

  // Update profile with creator ID
  setFandomProfile({ ...profile, creatorId: creator.id, bio });

  return creator;
}

/** Calculate engagement score: likes×1 + saves×2 + shares×3 + followers×5 */
function calcEngagement(c: { totalLikes: number; totalSaves: number; totalShares: number; followerCount: number }): number {
  return c.totalLikes + c.totalSaves * 2 + c.totalShares * 3 + c.followerCount * 5;
}

/** Assign badge based on engagement score */
function assignBadge(score: number, daysSinceJoin: number): FanCreator["badge"] {
  if (score >= 10000) return "top";
  if (score >= 3000) return "popular";
  if (score >= 500) return "rising";
  if (daysSinceJoin <= 30) return "rookie";
  return null;
}

/** Recalculate all creator stats from actual feed data */
export function recalcCreatorStats(): void {
  const posts = listItems<FandomFeedPost>(STORE_KEYS.FANDOM_FEED);
  const creators = listItems<FanCreator>(STORE_KEYS.FAN_CREATORS);
  const follows = listItems<FanFollow>(STORE_KEYS.FAN_FOLLOWS);
  const now = Date.now();

  const updated = creators.map((c) => {
    // Aggregate from posts by this creator
    const myPosts = posts.filter((p) => p.authorId === c.id || p.authorName === c.nickname);
    const totalLikes = myPosts.reduce((sum, p) => sum + p.likes, 0);
    const totalSaves = myPosts.reduce((sum, p) => sum + (p.saveCount || 0), 0);
    const totalShares = myPosts.reduce((sum, p) => sum + (p.shareCount || 0), 0);
    const followerCount = follows.filter((f) => f.followingId === c.id).length;
    const fanartCount = myPosts.length;

    const engagement = calcEngagement({ totalLikes, totalSaves, totalShares, followerCount });
    const daysSinceJoin = Math.floor((now - new Date(c.joinedAt).getTime()) / 86400000);
    const badge = assignBadge(engagement, daysSinceJoin);

    return {
      ...c,
      totalLikes,
      totalSaves,
      totalShares,
      fanartCount: fanartCount || c.fanartCount, // Keep seed data if no posts match
      followerCount: followerCount || c.followerCount,
      engagementScore: engagement || calcEngagement(c), // fallback to existing data
      badge: badge || c.badge,
    };
  });

  setStore(STORE_KEYS.FAN_CREATORS, updated);
}

/** Get creators sorted by engagement (for ranking) */
export function getCreatorRanking(limit = 10): FanCreator[] {
  const creators = listItems<FanCreator>(STORE_KEYS.FAN_CREATORS);
  return creators
    .map((c) => ({
      ...c,
      engagementScore: c.engagementScore || calcEngagement(c),
    }))
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, limit);
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

  // Q2: 구단 정식 이름 (nameKo 또는 fandomName 둘 다 허용)
  const nameAnswer = (answers.fandomName || "").trim().replace(/\s+/g, "").toLowerCase();
  const nameKoNorm = team.nameKo.trim().replace(/\s+/g, "").toLowerCase();
  if (nameAnswer !== nameKoNorm && nameAnswer !== team.fandomName.trim().replace(/\s+/g, "").toLowerCase())
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

  // Q5: stadium (홈구장) — 부분 일치 허용
  const stadiumAnswer = (answers.stadium || "").trim().toLowerCase();
  if (
    stadiumAnswer !== "" &&
    !team.stadium.toLowerCase().includes(stadiumAnswer) &&
    !stadiumAnswer.includes(team.stadium.toLowerCase().replace(/\s/g, "").slice(0, 3))
  )
    wrongKeys.push("stadium");

  // Q6: 구단 대표선수 (에이스/핵심/4번타자/3번타자/마감 역할 매칭)
  const keyRoles = ["에이스", "4번타자", "3번타자", "마감", "핵심"];
  const keyPlayers = players
    .filter((m) => m.role && keyRoles.includes(m.role))
    .map((m) => m.name.toLowerCase());
  if (
    (answers.captain || "").trim() !== "" &&
    !keyPlayers.includes((answers.captain || "").trim().toLowerCase())
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
  /** 유니폼 워드마크 (텍스트형 로고, 예: "KIA TIGERS") */
  wordmarkUrl?: string;
  /** 헬멧 로고 심볼 (아이콘형, 예: "T" 마크) */
  logoUrl?: string;
  /** 구단 엠블럼 (풀 뱃지/방패형 로고) */
  emblemUrl?: string;
}

export type PlayerRole = "에이스" | "선발" | "마감" | "셋업" | "중계" | "4번타자" | "3번타자" | "리드오프" | "주전" | "핵심" | "유망주";

export interface KboPlayer {
  id: string;
  groupId: string;
  name: string;
  nameKo: string;
  position: string;
  jerseyNumber: number;
  color: string;
  role?: PlayerRole;
  pcode?: string;
}

// ─── Player Photo URL Helper ────────────────────────────────────────────────

export function getPlayerPhotoUrl(pcode: string): string {
  return `/api/kbo/player-photo/${pcode}`;
}

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
  inning?: string;           // "3회초", "5회말" 등
  homeHits?: number;
  awayHits?: number;
  homeErrors?: number;
  awayErrors?: number;
}

export interface KboAttendance {
  id: string;
  gameId: string;
  note: string;
  createdAt: string;
}

export interface KboStanding {
  id: string;
  teamId: string;
  teamName: string;
  teamColor: string;
  wins: number;
  losses: number;
  draws: number;
  winRate: string;
  gamesBack: string;
  streak: string;
  last10: string;
  rank: number;
}

export interface CheerSong {
  id: string;
  teamId: string;
  teamName: string;
  title: string;
  type: "team" | "player" | "situation";
  playerName?: string;
  lyrics: string;
  description: string;
  order: number;
}

export interface StadiumGuide {
  id: string;
  teamId: string;
  stadiumName: string;
  address: string;
  capacity: number;
  transportation: string[];
  nearbyFood: { name: string; desc: string }[];
  tips: string[];
  sections: { name: string; desc: string; priceRange: string }[];
  parkingInfo: string;
}

export interface PhotocardItem {
  id: string;
  ownerId: string;
  ownerName: string;
  teamId: string;
  teamName: string;
  playerName?: string;
  title: string;
  imageUrl: string | null;
  frameType: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  likes: number;
  liked: boolean;
  createdAt: string;
  isForTrade: boolean;
}

export interface GoodsTrade {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  teamId: string;
  teamName: string;
  itemName: string;
  category: "uniform" | "cap" | "towel" | "keyring" | "photocard" | "other";
  description: string;
  condition: "new" | "likeNew" | "good" | "fair";
  tradeType: "sell" | "trade" | "giveaway";
  price?: number;
  wantedItem?: string;
  imageUrl: string | null;
  status: "active" | "reserved" | "completed";
  likes: number;
  createdAt: string;
}

export interface FandomFeedPost {
  id: string;
  authorId?: string;
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
  saved: boolean;
  saveCount: number;
  shareCount: number;
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
  totalSaves: number;
  totalShares: number;
  engagementScore: number;
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

export type EditorContentType = "team-profile" | "fanart" | "fanfic" | "event" | "poll";
export type EditorContentStatus = "draft" | "published";

export interface EditorContentBase {
  id: string;
  type: EditorContentType;
  title: string;
  description: string;
  authorName: string;
  fandomId: string;
  fandomName: string;
  playerId?: string;
  playerName?: string;
  tags: string[];
  status: EditorContentStatus;
  likes: number;
  views: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EditorTeamProfile extends EditorContentBase {
  type: "team-profile";
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

export type EditorContent = EditorTeamProfile | EditorFanArt | EditorFanFic | EditorEventContent | EditorPoll;

// ─── Seed Data (runs once) ───────────────────────────────────────────────────

const SEED_VERSION = 20; // v20: NC Dinos triple-logo + 2026 개막 엔트리 29명 (투수12+포수2+내야10+외야5)

export function seedIfEmpty(): void {
  const storedVersion = localStorage.getItem(STORE_KEYS.SEED_VERSION);
  if (storedVersion !== String(SEED_VERSION)) {
    localStorage.removeItem(STORE_KEYS.KBO_SCHEDULE);
    localStorage.removeItem(STORE_KEYS.KBO_PLAYERS);
    localStorage.removeItem(STORE_KEYS.KBO_STANDINGS);
    localStorage.removeItem(STORE_KEYS.KBO_TEAMS);
    // v6: reset feed & creators for new engagement fields
    localStorage.removeItem(STORE_KEYS.FANDOM_FEED);
    localStorage.removeItem(STORE_KEYS.FAN_CREATORS);
    // v7: reset stadium guides (한화 이글스 데이터 누락 수정)
    localStorage.removeItem(STORE_KEYS.STADIUM_GUIDES);
  }

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
      { id: "team-lg", name: "LG Twins", nameKo: "LG 트윈스", city: "서울", stadium: "잠실야구장", fandomName: "트윈스 팬", foundedYear: 1982, followers: 0, fanartCount: 0, coverColor: "#C60C30", secondaryColor: "#000000", description: "서울을 대표하는 전통 구단, 2025년 한국시리즈 우승", mascot: "Luckii", wordmarkUrl: "https://sports-phinf.pstatic.net/team/kbo/default/LG.png", logoUrl: "https://sports-phinf.pstatic.net/team/kbo/default/LG.png", emblemUrl: "https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/emblem/regular/2026/emblem_LG.png" },
      { id: "team-kt", name: "KT Wiz", nameKo: "KT 위즈", city: "수원", stadium: "수원KT위즈파크", fandomName: "위즈 팬", foundedYear: 2015, followers: 0, fanartCount: 0, coverColor: "#000000", secondaryColor: "#ED1C24", description: "수원의 젊은 구단, 2021년 한국시리즈 우승", mascot: "Vic", wordmarkUrl: "https://sports-phinf.pstatic.net/team/kbo/default/KT.png", logoUrl: "https://sports-phinf.pstatic.net/team/kbo/default/KT.png", emblemUrl: "https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/emblem/regular/2026/emblem_KT.png" },
      { id: "team-ssg", name: "SSG Landers", nameKo: "SSG 랜더스", city: "인천", stadium: "인천SSG랜더스필드", fandomName: "랜더스 팬", foundedYear: 2000, followers: 0, fanartCount: 0, coverColor: "#CE0E2D", secondaryColor: "#000000", description: "인천의 자존심, 2024 리브랜딩 (Todd Radom)", mascot: "Landro", wordmarkUrl: "https://sports-phinf.pstatic.net/team/kbo/default/SK.png", logoUrl: "https://sports-phinf.pstatic.net/team/kbo/default/SK.png", emblemUrl: "https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/emblem/regular/2026/emblem_SK.png" },
      { id: "team-nc", name: "NC Dinos", nameKo: "NC 다이노스", city: "창원", stadium: "창원NC파크", fandomName: "다이노스 팬", foundedYear: 2013, followers: 0, fanartCount: 0, coverColor: "#315288", secondaryColor: "#C0A882", description: "창원의 공룡 군단, 2020년 한국시리즈 우승", mascot: "Dandi", wordmarkUrl: "/logos/nc/wordmark.png", logoUrl: "/logos/nc/logo.png", emblemUrl: "/logos/nc/emblem.png" },
      { id: "team-doo", name: "Doosan Bears", nameKo: "두산 베어스", city: "서울", stadium: "잠실야구장", fandomName: "베어스 팬", foundedYear: 1982, followers: 0, fanartCount: 0, coverColor: "#131230", secondaryColor: "#ED1C24", description: "잠실의 전통 강호, 2025 RARE Design 리브랜딩", mascot: "Cheol-woong", wordmarkUrl: "https://sports-phinf.pstatic.net/team/kbo/default/OB.png", logoUrl: "https://sports-phinf.pstatic.net/team/kbo/default/OB.png", emblemUrl: "https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/emblem/regular/2026/emblem_OB.png" },
      { id: "team-kia", name: "KIA Tigers", nameKo: "KIA 타이거즈", city: "광주", stadium: "광주-기아챔피언스필드", fandomName: "타이거즈 팬", foundedYear: 1982, followers: 0, fanartCount: 0, coverColor: "#EA0029", secondaryColor: "#000000", description: "호남의 왕, KBO 최다 통합 우승 구단", mascot: "Hogini", wordmarkUrl: "/logos/kia/wordmark.jpg", logoUrl: "/logos/kia/logo.jpg", emblemUrl: "/logos/kia/emblem.jpg" },
      { id: "team-lot", name: "Lotte Giants", nameKo: "롯데 자이언츠", city: "부산", stadium: "사직야구장", fandomName: "자이언츠 팬", foundedYear: 1982, followers: 0, fanartCount: 0, coverColor: "#041E42", secondaryColor: "#E30613", description: "부산의 영웅, 2023 갈매기 CI 리뉴얼", mascot: "Giant", wordmarkUrl: "https://sports-phinf.pstatic.net/team/kbo/default/LT.png", logoUrl: "https://sports-phinf.pstatic.net/team/kbo/default/LT.png", emblemUrl: "https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/emblem/regular/2026/emblem_LT.png" },
      { id: "team-sam", name: "Samsung Lions", nameKo: "삼성 라이온즈", city: "대구", stadium: "대구삼성라이온즈파크", fandomName: "라이온즈 팬", foundedYear: 1982, followers: 0, fanartCount: 0, coverColor: "#074CA1", secondaryColor: "#FFFFFF", description: "대구의 사자, 4연패 신화의 주인공", mascot: "Blazey", wordmarkUrl: "/logos/samsung/wordmark.png", logoUrl: "/logos/samsung/logo.png", emblemUrl: "/logos/samsung/emblem.png" },
      { id: "team-han", name: "Hanwha Eagles", nameKo: "한화 이글스", city: "대전", stadium: "한화생명볼파크", fandomName: "이글스 팬", foundedYear: 1986, followers: 0, fanartCount: 0, coverColor: "#FF6600", secondaryColor: "#1B2A4A", description: "대전의 독수리, 2025 새 BI 'RIDE THE STORM'", mascot: "Suri", wordmarkUrl: "https://sports-phinf.pstatic.net/team/kbo/default/HH.png", logoUrl: "https://sports-phinf.pstatic.net/team/kbo/default/HH.png", emblemUrl: "https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/emblem/regular/2026/emblem_HH.png" },
      { id: "team-kiw", name: "Kiwoom Heroes", nameKo: "키움 히어로즈", city: "서울", stadium: "고척스카이돔", fandomName: "히어로즈 팬", foundedYear: 2008, followers: 0, fanartCount: 0, coverColor: "#820024", secondaryColor: "#000000", description: "고척의 영웅들, 국내 유일 돔구장 구단", mascot: "Tuki", wordmarkUrl: "https://sports-phinf.pstatic.net/team/kbo/default/WO.png", logoUrl: "https://sports-phinf.pstatic.net/team/kbo/default/WO.png", emblemUrl: "https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/emblem/regular/2026/emblem_WO.png" },
    ];
    teams.forEach((t) => addItem(STORE_KEYS.KBO_TEAMS, t));
  }

  // KBO Players - 2026 개막 엔트리 기준 구단별 주요선수 15명
  if (listItems(STORE_KEYS.KBO_PLAYERS).length === 0) {
    const players: KboPlayer[] = [
      // ── LG Twins (2025 통합 우승) ──
      { id: "plr-lg-1", groupId: "team-lg", name: "홍창기", nameKo: "홍창기", position: "외야수", jerseyNumber: 51, color: "#C60C30", role: "리드오프", pcode: "66108" },
      { id: "plr-lg-2", groupId: "team-lg", name: "박해민", nameKo: "박해민", position: "외야수", jerseyNumber: 7, color: "#C60C30", role: "주전", pcode: "62415" },
      { id: "plr-lg-3", groupId: "team-lg", name: "오지환", nameKo: "오지환", position: "내야수", jerseyNumber: 10, color: "#C60C30", role: "주전", pcode: "79109" },
      { id: "plr-lg-4", groupId: "team-lg", name: "임찬규", nameKo: "임찬규", position: "투수", jerseyNumber: 1, color: "#C60C30", role: "에이스", pcode: "61101" },
      { id: "plr-lg-5", groupId: "team-lg", name: "문보경", nameKo: "문보경", position: "내야수", jerseyNumber: 2, color: "#C60C30", role: "4번타자", pcode: "69102" },
      { id: "plr-lg-6", groupId: "team-lg", name: "박동원", nameKo: "박동원", position: "포수", jerseyNumber: 27, color: "#C60C30", role: "주전", pcode: "79365" },
      { id: "plr-lg-7", groupId: "team-lg", name: "오스틴", nameKo: "오스틴", position: "내야수", jerseyNumber: 30, color: "#C60C30", role: "3번타자", pcode: "53123" },
      { id: "plr-lg-8", groupId: "team-lg", name: "치리노스", nameKo: "치리노스", position: "투수", jerseyNumber: 46, color: "#C60C30", role: "선발", pcode: "55146" },
      { id: "plr-lg-9", groupId: "team-lg", name: "톨허스트", nameKo: "톨허스트", position: "투수", jerseyNumber: 35, color: "#C60C30", role: "선발", pcode: "55130" },
      { id: "plr-lg-10", groupId: "team-lg", name: "이우찬", nameKo: "이우찬", position: "투수", jerseyNumber: 19, color: "#C60C30", role: "마감", pcode: "61145" },
      { id: "plr-lg-11", groupId: "team-lg", name: "유영찬", nameKo: "유영찬", position: "투수", jerseyNumber: 33, color: "#C60C30", role: "선발", pcode: "50106" },
      { id: "plr-lg-12", groupId: "team-lg", name: "구본혁", nameKo: "구본혁", position: "내야수", jerseyNumber: 6, color: "#C60C30", role: "유망주", pcode: "69100" },
      { id: "plr-lg-13", groupId: "team-lg", name: "문성주", nameKo: "문성주", position: "외야수", jerseyNumber: 25, color: "#C60C30", role: "주전", pcode: "68119" },
      { id: "plr-lg-14", groupId: "team-lg", name: "배재준", nameKo: "배재준", position: "투수", jerseyNumber: 41, color: "#C60C30", role: "셋업", pcode: "63145" },
      { id: "plr-lg-15", groupId: "team-lg", name: "최원영", nameKo: "최원영", position: "외야수", jerseyNumber: 55, color: "#C60C30", role: "핵심", pcode: "52103" },
      // ── KT Wiz ──
      { id: "plr-kt-1", groupId: "team-kt", name: "소형준", nameKo: "소형준", position: "투수", jerseyNumber: 17, color: "#ED1C24", role: "에이스", pcode: "50030" },
      { id: "plr-kt-2", groupId: "team-kt", name: "박영현", nameKo: "박영현", position: "투수", jerseyNumber: 22, color: "#ED1C24", role: "마감", pcode: "52060" },
      { id: "plr-kt-3", groupId: "team-kt", name: "김현수", nameKo: "김현수", position: "외야수", jerseyNumber: 23, color: "#ED1C24", role: "핵심", pcode: "76290" },
      { id: "plr-kt-4", groupId: "team-kt", name: "배정대", nameKo: "배정대", position: "외야수", jerseyNumber: 27, color: "#ED1C24", role: "리드오프", pcode: "64166" },
      { id: "plr-kt-5", groupId: "team-kt", name: "최원준", nameKo: "최원준", position: "외야수", jerseyNumber: 53, color: "#ED1C24", role: "주전", pcode: "66606" },
      { id: "plr-kt-6", groupId: "team-kt", name: "힐리어드", nameKo: "힐리어드", position: "내야수", jerseyNumber: 50, color: "#ED1C24", role: "3번타자", pcode: "56034" },
      { id: "plr-kt-7", groupId: "team-kt", name: "사우어", nameKo: "사우어", position: "투수", jerseyNumber: 45, color: "#ED1C24", role: "선발", pcode: "56032" },
      { id: "plr-kt-8", groupId: "team-kt", name: "보쉬릴리", nameKo: "보쉬릴리", position: "투수", jerseyNumber: 31, color: "#ED1C24", role: "선발", pcode: "56036" },
      { id: "plr-kt-9", groupId: "team-kt", name: "허경민", nameKo: "허경민", position: "내야수", jerseyNumber: 13, color: "#ED1C24", role: "핵심", pcode: "79240" },
      { id: "plr-kt-10", groupId: "team-kt", name: "장성우", nameKo: "장성우", position: "포수", jerseyNumber: 32, color: "#ED1C24", role: "주전", pcode: "78548" },
      { id: "plr-kt-11", groupId: "team-kt", name: "오윤석", nameKo: "오윤석", position: "내야수", jerseyNumber: 2, color: "#ED1C24", role: "주전", pcode: "64504" },
      { id: "plr-kt-12", groupId: "team-kt", name: "김상수", nameKo: "김상수", position: "내야수", jerseyNumber: 3, color: "#ED1C24", role: "주전", pcode: "79402" },
      { id: "plr-kt-13", groupId: "team-kt", name: "한승혁", nameKo: "한승혁", position: "투수", jerseyNumber: 18, color: "#ED1C24", role: "선발", pcode: "61666" },
      { id: "plr-kt-14", groupId: "team-kt", name: "우규민", nameKo: "우규민", position: "투수", jerseyNumber: 11, color: "#ED1C24", role: "셋업", pcode: "73117" },
      { id: "plr-kt-15", groupId: "team-kt", name: "스기모토", nameKo: "스기모토", position: "투수", jerseyNumber: 48, color: "#ED1C24", role: "선발", pcode: "56011" },
      // ── SSG Landers ──
      { id: "plr-ssg-1", groupId: "team-ssg", name: "화이트", nameKo: "미치 화이트", position: "투수", jerseyNumber: 47, color: "#CE0E2D", role: "에이스", pcode: "55855" },
      { id: "plr-ssg-2", groupId: "team-ssg", name: "최정", nameKo: "최정", position: "내야수", jerseyNumber: 3, color: "#CE0E2D", role: "4번타자", pcode: "75847" },
      { id: "plr-ssg-3", groupId: "team-ssg", name: "김재환", nameKo: "김재환", position: "외야수", jerseyNumber: 4, color: "#CE0E2D", role: "3번타자", pcode: "78224" },
      { id: "plr-ssg-4", groupId: "team-ssg", name: "에레디아", nameKo: "에레디아", position: "외야수", jerseyNumber: 6, color: "#CE0E2D", role: "핵심", pcode: "53827" },
      { id: "plr-ssg-5", groupId: "team-ssg", name: "최지훈", nameKo: "최지훈", position: "외야수", jerseyNumber: 2, color: "#CE0E2D", role: "리드오프", pcode: "50854" },
      { id: "plr-ssg-6", groupId: "team-ssg", name: "조병현", nameKo: "조병현", position: "투수", jerseyNumber: 17, color: "#CE0E2D", role: "선발", pcode: "51897" },
      { id: "plr-ssg-7", groupId: "team-ssg", name: "베니지아노", nameKo: "베니지아노", position: "투수", jerseyNumber: 40, color: "#CE0E2D", role: "선발", pcode: "56841" },
      { id: "plr-ssg-8", groupId: "team-ssg", name: "문승원", nameKo: "문승원", position: "투수", jerseyNumber: 11, color: "#CE0E2D", role: "마감", pcode: "62869" },
      { id: "plr-ssg-9", groupId: "team-ssg", name: "조형우", nameKo: "조형우", position: "포수", jerseyNumber: 22, color: "#CE0E2D", role: "주전", pcode: "51865" },
      { id: "plr-ssg-10", groupId: "team-ssg", name: "이지영", nameKo: "이지영", position: "포수", jerseyNumber: 10, color: "#CE0E2D", role: "주전", pcode: "79456" },
      { id: "plr-ssg-11", groupId: "team-ssg", name: "박성한", nameKo: "박성한", position: "내야수", jerseyNumber: 7, color: "#CE0E2D", role: "주전", pcode: "67893" },
      { id: "plr-ssg-12", groupId: "team-ssg", name: "고명준", nameKo: "고명준", position: "내야수", jerseyNumber: 55, color: "#CE0E2D", role: "유망주", pcode: "51868" },
      { id: "plr-ssg-13", groupId: "team-ssg", name: "노경은", nameKo: "노경은", position: "투수", jerseyNumber: 28, color: "#CE0E2D", role: "선발", pcode: "73211" },
      { id: "plr-ssg-14", groupId: "team-ssg", name: "김민", nameKo: "김민", position: "투수", jerseyNumber: 15, color: "#CE0E2D", role: "셋업", pcode: "68043" },
      { id: "plr-ssg-15", groupId: "team-ssg", name: "채현우", nameKo: "채현우", position: "외야수", jerseyNumber: 51, color: "#CE0E2D", role: "주전", pcode: "69804" },
      // ── NC Dinos (2026 개막 엔트리 29명) ──
      // 투수 (12명)
      { id: "plr-nc-1", groupId: "team-nc", name: "구창모", nameKo: "구창모", position: "투수", jerseyNumber: 59, color: "#315288", role: "에이스", pcode: "65933" },
      { id: "plr-nc-2", groupId: "team-nc", name: "토다", nameKo: "토다 나츠키", position: "투수", jerseyNumber: 11, color: "#315288", role: "선발", pcode: "56911" },
      { id: "plr-nc-3", groupId: "team-nc", name: "테일러", nameKo: "커티스 테일러", position: "투수", jerseyNumber: 66, color: "#315288", role: "선발", pcode: "56966" },
      { id: "plr-nc-4", groupId: "team-nc", name: "김영규", nameKo: "김영규", position: "투수", jerseyNumber: 17, color: "#315288", role: "선발", pcode: "68900" },
      { id: "plr-nc-5", groupId: "team-nc", name: "류진욱", nameKo: "류진욱", position: "투수", jerseyNumber: 41, color: "#315288", role: "선발", pcode: "65949" },
      { id: "plr-nc-6", groupId: "team-nc", name: "임지민", nameKo: "임지민", position: "투수", jerseyNumber: 19, color: "#315288", role: "중계", pcode: "53909" },
      { id: "plr-nc-7", groupId: "team-nc", name: "임정호", nameKo: "임정호", position: "투수", jerseyNumber: 30, color: "#315288", role: "셋업", pcode: "63959" },
      { id: "plr-nc-8", groupId: "team-nc", name: "이준혁", nameKo: "이준혁", position: "투수", jerseyNumber: 40, color: "#315288", role: "중계", pcode: "52992" },
      { id: "plr-nc-9", groupId: "team-nc", name: "손주환", nameKo: "손주환", position: "투수", jerseyNumber: 46, color: "#315288", role: "중계", pcode: "54904" },
      { id: "plr-nc-10", groupId: "team-nc", name: "김진호", nameKo: "김진호", position: "투수", jerseyNumber: 54, color: "#315288", role: "마감", pcode: "67954" },
      { id: "plr-nc-11", groupId: "team-nc", name: "배재환", nameKo: "배재환", position: "투수", jerseyNumber: 61, color: "#315288", role: "중계", pcode: "64995" },
      { id: "plr-nc-12", groupId: "team-nc", name: "원종해", nameKo: "원종해", position: "투수", jerseyNumber: 63, color: "#315288", role: "중계", pcode: "54906" },
      // 포수 (2명)
      { id: "plr-nc-13", groupId: "team-nc", name: "김형준", nameKo: "김형준", position: "포수", jerseyNumber: 25, color: "#315288", role: "주전", pcode: "68912" },
      { id: "plr-nc-14", groupId: "team-nc", name: "김정호", nameKo: "김정호", position: "포수", jerseyNumber: 42, color: "#315288", role: "주전", pcode: "51903" },
      // 내야수 (10명)
      { id: "plr-nc-15", groupId: "team-nc", name: "데이비슨", nameKo: "맷 데이비슨", position: "내야수", jerseyNumber: 24, color: "#315288", role: "4번타자", pcode: "54944" },
      { id: "plr-nc-16", groupId: "team-nc", name: "박민우", nameKo: "박민우", position: "내야수", jerseyNumber: 2, color: "#315288", role: "핵심", pcode: "62907" },
      { id: "plr-nc-17", groupId: "team-nc", name: "서호철", nameKo: "서호철", position: "내야수", jerseyNumber: 5, color: "#315288", role: "핵심", pcode: "69995" },
      { id: "plr-nc-18", groupId: "team-nc", name: "김주원", nameKo: "김주원", position: "내야수", jerseyNumber: 7, color: "#315288", role: "주전", pcode: "51907" },
      { id: "plr-nc-19", groupId: "team-nc", name: "허윤", nameKo: "허윤", position: "내야수", jerseyNumber: 4, color: "#315288", role: "주전", pcode: "" },
      { id: "plr-nc-20", groupId: "team-nc", name: "신재인", nameKo: "신재인", position: "내야수", jerseyNumber: 9, color: "#315288", role: "주전", pcode: "56909" },
      { id: "plr-nc-21", groupId: "team-nc", name: "김한별", nameKo: "김한별", position: "내야수", jerseyNumber: 13, color: "#315288", role: "주전", pcode: "50902" },
      { id: "plr-nc-22", groupId: "team-nc", name: "최정원", nameKo: "최정원", position: "내야수", jerseyNumber: 14, color: "#315288", role: "주전", pcode: "69992" },
      { id: "plr-nc-23", groupId: "team-nc", name: "오영수", nameKo: "오영수", position: "내야수", jerseyNumber: 34, color: "#315288", role: "주전", pcode: "68904" },
      { id: "plr-nc-24", groupId: "team-nc", name: "김휘집", nameKo: "김휘집", position: "내야수", jerseyNumber: 44, color: "#315288", role: "주전", pcode: "51344" },
      // 외야수 (5명)
      { id: "plr-nc-25", groupId: "team-nc", name: "박건우", nameKo: "박건우", position: "외야수", jerseyNumber: 37, color: "#315288", role: "핵심", pcode: "79215" },
      { id: "plr-nc-26", groupId: "team-nc", name: "천재환", nameKo: "천재환", position: "외야수", jerseyNumber: 23, color: "#315288", role: "주전", pcode: "67905" },
      { id: "plr-nc-27", groupId: "team-nc", name: "한석현", nameKo: "한석현", position: "외야수", jerseyNumber: 33, color: "#315288", role: "주전", pcode: "64101" },
      { id: "plr-nc-28", groupId: "team-nc", name: "권희동", nameKo: "권희동", position: "외야수", jerseyNumber: 36, color: "#315288", role: "리드오프", pcode: "63963" },
      { id: "plr-nc-29", groupId: "team-nc", name: "고준휘", nameKo: "고준휘", position: "외야수", jerseyNumber: 49, color: "#315288", role: "주전", pcode: "62934" },
      // ── Doosan Bears ──
      { id: "plr-doo-1", groupId: "team-doo", name: "양의지", nameKo: "양의지", position: "포수", jerseyNumber: 25, color: "#131230", role: "핵심", pcode: "76232" },
      { id: "plr-doo-2", groupId: "team-doo", name: "박찬호", nameKo: "박찬호", position: "내야수", jerseyNumber: 61, color: "#131230", role: "주전", pcode: "64646" },
      { id: "plr-doo-3", groupId: "team-doo", name: "정수빈", nameKo: "정수빈", position: "외야수", jerseyNumber: 15, color: "#131230", role: "리드오프", pcode: "79231" },
      { id: "plr-doo-4", groupId: "team-doo", name: "곽빈", nameKo: "곽빈", position: "투수", jerseyNumber: 22, color: "#131230", role: "에이스", pcode: "68220" },
      { id: "plr-doo-5", groupId: "team-doo", name: "플렉센", nameKo: "크리스 플렉센", position: "투수", jerseyNumber: 45, color: "#131230", role: "선발", pcode: "50234" },
      { id: "plr-doo-6", groupId: "team-doo", name: "카메론", nameKo: "다즈 카메론", position: "외야수", jerseyNumber: 50, color: "#131230", role: "4번타자", pcode: "56251" },
      { id: "plr-doo-7", groupId: "team-doo", name: "김택연", nameKo: "김택연", position: "투수", jerseyNumber: 36, color: "#131230", role: "선발", pcode: "54263" },
      { id: "plr-doo-8", groupId: "team-doo", name: "잭로그", nameKo: "잭로그", position: "투수", jerseyNumber: 31, color: "#131230", role: "선발", pcode: "55239" },
      { id: "plr-doo-9", groupId: "team-doo", name: "이용찬", nameKo: "이용찬", position: "투수", jerseyNumber: 28, color: "#131230", role: "마감", pcode: "77211" },
      { id: "plr-doo-10", groupId: "team-doo", name: "이병헌", nameKo: "이병헌", position: "투수", jerseyNumber: 17, color: "#131230", role: "셋업", pcode: "52204" },
      { id: "plr-doo-11", groupId: "team-doo", name: "양석환", nameKo: "양석환", position: "내야수", jerseyNumber: 3, color: "#131230", role: "4번타자", pcode: "64153" },
      { id: "plr-doo-12", groupId: "team-doo", name: "이유찬", nameKo: "이유찬", position: "내야수", jerseyNumber: 7, color: "#131230", role: "3번타자", pcode: "67207" },
      { id: "plr-doo-13", groupId: "team-doo", name: "조수행", nameKo: "조수행", position: "외야수", jerseyNumber: 24, color: "#131230", role: "유망주", pcode: "66209" },
      { id: "plr-doo-14", groupId: "team-doo", name: "오명진", nameKo: "오명진", position: "내야수", jerseyNumber: 13, color: "#131230", role: "주전", pcode: "50208" },
      { id: "plr-doo-15", groupId: "team-doo", name: "김인태", nameKo: "김인태", position: "외야수", jerseyNumber: 55, color: "#131230", role: "주전", pcode: "63257" },
      // ── KIA Tigers (2024 한국시리즈 우승) — 2026 개막 엔트리 30명 ──
      // 투수 (14명)
      { id: "plr-kia-1", groupId: "team-kia", name: "양현종", nameKo: "양현종", position: "투수", jerseyNumber: 54, color: "#EA0029", role: "에이스", pcode: "77637" },
      { id: "plr-kia-2", groupId: "team-kia", name: "조상우", nameKo: "조상우", position: "투수", jerseyNumber: 11, color: "#EA0029", role: "마감", pcode: "63342" },
      { id: "plr-kia-3", groupId: "team-kia", name: "올러", nameKo: "아담 올러", position: "투수", jerseyNumber: 33, color: "#EA0029", role: "선발", pcode: "55633" },
      { id: "plr-kia-4", groupId: "team-kia", name: "네일", nameKo: "제임스 네일", position: "투수", jerseyNumber: 40, color: "#EA0029", role: "선발", pcode: "54640" },
      { id: "plr-kia-5", groupId: "team-kia", name: "이의리", nameKo: "이의리", position: "투수", jerseyNumber: 48, color: "#EA0029", role: "선발", pcode: "51648" },
      { id: "plr-kia-6", groupId: "team-kia", name: "정해영", nameKo: "정해영", position: "투수", jerseyNumber: 62, color: "#EA0029", role: "셋업", pcode: "50662" },
      { id: "plr-kia-7", groupId: "team-kia", name: "황동하", nameKo: "황동하", position: "투수", jerseyNumber: 41, color: "#EA0029", role: "선발", pcode: "52641" },
      { id: "plr-kia-8", groupId: "team-kia", name: "최지민", nameKo: "최지민", position: "투수", jerseyNumber: 39, color: "#EA0029", role: "중계", pcode: "52639" },
      { id: "plr-kia-9", groupId: "team-kia", name: "김범수", nameKo: "김범수", position: "투수", jerseyNumber: 49, color: "#EA0029", role: "중계", pcode: "65769" },
      { id: "plr-kia-10", groupId: "team-kia", name: "전상현", nameKo: "전상현", position: "투수", jerseyNumber: 51, color: "#EA0029", role: "중계", pcode: "66609" },
      { id: "plr-kia-11", groupId: "team-kia", name: "김기훈", nameKo: "김기훈", position: "투수", jerseyNumber: 53, color: "#EA0029", role: "중계", pcode: "69620" },
      { id: "plr-kia-12", groupId: "team-kia", name: "김시훈", nameKo: "김시훈", position: "투수", jerseyNumber: 61, color: "#EA0029", role: "중계", pcode: "68928" },
      { id: "plr-kia-13", groupId: "team-kia", name: "성영탁", nameKo: "성영탁", position: "투수", jerseyNumber: 65, color: "#EA0029", role: "중계", pcode: "54610" },
      { id: "plr-kia-14", groupId: "team-kia", name: "홍민규", nameKo: "홍민규", position: "투수", jerseyNumber: 67, color: "#EA0029", role: "중계", pcode: "55267" },
      // 포수 (2명)
      { id: "plr-kia-15", groupId: "team-kia", name: "한준수", nameKo: "한준수", position: "포수", jerseyNumber: 25, color: "#EA0029", role: "주전", pcode: "68646" },
      { id: "plr-kia-16", groupId: "team-kia", name: "김태군", nameKo: "김태군", position: "포수", jerseyNumber: 42, color: "#EA0029", role: "주전", pcode: "78122" },
      // 내야수 (8명)
      { id: "plr-kia-17", groupId: "team-kia", name: "김도영", nameKo: "김도영", position: "내야수", jerseyNumber: 5, color: "#EA0029", role: "3번타자", pcode: "52605" },
      { id: "plr-kia-18", groupId: "team-kia", name: "김선빈", nameKo: "김선빈", position: "내야수", jerseyNumber: 3, color: "#EA0029", role: "주전", pcode: "78603" },
      { id: "plr-kia-19", groupId: "team-kia", name: "데일", nameKo: "제로드 데일", position: "내야수", jerseyNumber: 32, color: "#EA0029", role: "핵심", pcode: "56632" },
      { id: "plr-kia-20", groupId: "team-kia", name: "박민", nameKo: "박민", position: "내야수", jerseyNumber: 2, color: "#EA0029", role: "주전", pcode: "50657" },
      { id: "plr-kia-21", groupId: "team-kia", name: "정현창", nameKo: "정현창", position: "내야수", jerseyNumber: 12, color: "#EA0029", role: "주전", pcode: "55926" },
      { id: "plr-kia-22", groupId: "team-kia", name: "김규성", nameKo: "김규성", position: "내야수", jerseyNumber: 14, color: "#EA0029", role: "주전", pcode: "66614" },
      { id: "plr-kia-23", groupId: "team-kia", name: "윤도현", nameKo: "윤도현", position: "내야수", jerseyNumber: 16, color: "#EA0029", role: "주전", pcode: "52667" },
      { id: "plr-kia-24", groupId: "team-kia", name: "오선우", nameKo: "오선우", position: "내야수", jerseyNumber: 56, color: "#EA0029", role: "주전", pcode: "69636" },
      // 외야수 (6명)
      { id: "plr-kia-25", groupId: "team-kia", name: "나성범", nameKo: "나성범", position: "외야수", jerseyNumber: 47, color: "#EA0029", role: "4번타자", pcode: "62947" },
      { id: "plr-kia-26", groupId: "team-kia", name: "카스트로", nameKo: "해롤드 카스트로", position: "외야수", jerseyNumber: 26, color: "#EA0029", role: "핵심", pcode: "56626" },
      { id: "plr-kia-27", groupId: "team-kia", name: "이창진", nameKo: "이창진", position: "외야수", jerseyNumber: 8, color: "#EA0029", role: "주전", pcode: "64560" },
      { id: "plr-kia-28", groupId: "team-kia", name: "김호령", nameKo: "김호령", position: "외야수", jerseyNumber: 27, color: "#EA0029", role: "주전", pcode: "65653" },
      { id: "plr-kia-29", groupId: "team-kia", name: "박정우", nameKo: "박정우", position: "외야수", jerseyNumber: 1, color: "#EA0029", role: "주전", pcode: "67609" },
      { id: "plr-kia-30", groupId: "team-kia", name: "박재현", nameKo: "박재현", position: "외야수", jerseyNumber: 15, color: "#EA0029", role: "주전", pcode: "55636" },
      // ── Lotte Giants ──
      { id: "plr-lot-1", groupId: "team-lot", name: "전준우", nameKo: "전준우", position: "외야수", jerseyNumber: 8, color: "#041E42", role: "4번타자", pcode: "78513" },
      { id: "plr-lot-2", groupId: "team-lot", name: "한태양", nameKo: "한태양", position: "내야수", jerseyNumber: 6, color: "#041E42", role: "주전", pcode: "52568" },
      { id: "plr-lot-3", groupId: "team-lot", name: "박세웅", nameKo: "박세웅", position: "투수", jerseyNumber: 11, color: "#041E42", role: "에이스", pcode: "64021" },
      { id: "plr-lot-4", groupId: "team-lot", name: "레이예스", nameKo: "빅터 레이예스", position: "외야수", jerseyNumber: 29, color: "#041E42", role: "3번타자", pcode: "54529" },
      { id: "plr-lot-5", groupId: "team-lot", name: "로드리게스", nameKo: "엘빈 로드리게스", position: "투수", jerseyNumber: 40, color: "#041E42", role: "선발", pcode: "56531" },
      { id: "plr-lot-6", groupId: "team-lot", name: "비슬리", nameKo: "제레미 비슬리", position: "투수", jerseyNumber: 45, color: "#041E42", role: "선발", pcode: "56523" },
      { id: "plr-lot-7", groupId: "team-lot", name: "김원중", nameKo: "김원중", position: "투수", jerseyNumber: 50, color: "#041E42", role: "마감", pcode: "62528" },
      { id: "plr-lot-8", groupId: "team-lot", name: "쿄야마", nameKo: "쿄야마", position: "투수", jerseyNumber: 46, color: "#041E42", role: "선발", pcode: "56548" },
      { id: "plr-lot-9", groupId: "team-lot", name: "정철원", nameKo: "정철원", position: "투수", jerseyNumber: 57, color: "#041E42", role: "셋업", pcode: "68242" },
      { id: "plr-lot-10", groupId: "team-lot", name: "유강남", nameKo: "유강남", position: "포수", jerseyNumber: 22, color: "#041E42", role: "주전", pcode: "61102" },
      { id: "plr-lot-11", groupId: "team-lot", name: "윤동희", nameKo: "윤동희", position: "외야수", jerseyNumber: 1, color: "#041E42", role: "리드오프", pcode: "52591" },
      { id: "plr-lot-12", groupId: "team-lot", name: "황성빈", nameKo: "황성빈", position: "외야수", jerseyNumber: 2, color: "#041E42", role: "유망주", pcode: "50500" },
      { id: "plr-lot-13", groupId: "team-lot", name: "노진혁", nameKo: "노진혁", position: "내야수", jerseyNumber: 3, color: "#041E42", role: "주전", pcode: "62931" },
      { id: "plr-lot-14", groupId: "team-lot", name: "신윤후", nameKo: "신윤후", position: "외야수", jerseyNumber: 55, color: "#041E42", role: "핵심", pcode: "69508" },
      { id: "plr-lot-15", groupId: "team-lot", name: "김민성", nameKo: "김민성", position: "내야수", jerseyNumber: 7, color: "#041E42", role: "주전", pcode: "77564" },
      // ── Samsung Lions (2026 개막 엔트리 30명) ──
      // 투수 (13명)
      { id: "plr-sam-1", groupId: "team-sam", name: "후라도", nameKo: "후라도", position: "투수", jerseyNumber: 75, color: "#074CA1", role: "에이스", pcode: "53375" },
      { id: "plr-sam-2", groupId: "team-sam", name: "원태인", nameKo: "원태인", position: "투수", jerseyNumber: 18, color: "#074CA1", role: "선발", pcode: "69446" },
      { id: "plr-sam-3", groupId: "team-sam", name: "최원태", nameKo: "최원태", position: "투수", jerseyNumber: 20, color: "#074CA1", role: "선발", pcode: "65320" },
      { id: "plr-sam-4", groupId: "team-sam", name: "미야지", nameKo: "미야지", position: "투수", jerseyNumber: 15, color: "#074CA1", role: "선발", pcode: "56415" },
      { id: "plr-sam-5", groupId: "team-sam", name: "배찬승", nameKo: "배찬승", position: "투수", jerseyNumber: 55, color: "#074CA1", role: "선발", pcode: "55455" },
      { id: "plr-sam-6", groupId: "team-sam", name: "오러클린", nameKo: "오러클린", position: "투수", jerseyNumber: 64, color: "#074CA1", role: "중계", pcode: "56464" },
      { id: "plr-sam-7", groupId: "team-sam", name: "이승현", nameKo: "이승현", position: "투수", jerseyNumber: 26, color: "#074CA1", role: "셋업", pcode: "51454" },
      { id: "plr-sam-8", groupId: "team-sam", name: "이승민", nameKo: "이승민", position: "투수", jerseyNumber: 28, color: "#074CA1", role: "중계", pcode: "50464" },
      { id: "plr-sam-9", groupId: "team-sam", name: "육선엽", nameKo: "육선엽", position: "투수", jerseyNumber: 4, color: "#074CA1", role: "중계", pcode: "54404" },
      { id: "plr-sam-10", groupId: "team-sam", name: "최지광", nameKo: "최지광", position: "투수", jerseyNumber: 11, color: "#074CA1", role: "마감", pcode: "67421" },
      { id: "plr-sam-11", groupId: "team-sam", name: "김재윤", nameKo: "김재윤", position: "투수", jerseyNumber: 62, color: "#074CA1", role: "셋업", pcode: "65062" },
      { id: "plr-sam-12", groupId: "team-sam", name: "장찬희", nameKo: "장찬희", position: "투수", jerseyNumber: 60, color: "#074CA1", role: "중계", pcode: "56460" },
      { id: "plr-sam-13", groupId: "team-sam", name: "백정현", nameKo: "백정현", position: "투수", jerseyNumber: 29, color: "#074CA1", role: "중계", pcode: "77446" },
      // 포수 (2명)
      { id: "plr-sam-14", groupId: "team-sam", name: "강민호", nameKo: "강민호", position: "포수", jerseyNumber: 47, color: "#074CA1", role: "주전", pcode: "74540" },
      { id: "plr-sam-15", groupId: "team-sam", name: "박세혁", nameKo: "박세혁", position: "포수", jerseyNumber: 52, color: "#074CA1", role: "주전", pcode: "62244" },
      // 내야수 (8명)
      { id: "plr-sam-16", groupId: "team-sam", name: "디아즈", nameKo: "르윈 디아즈", position: "내야수", jerseyNumber: 0, color: "#074CA1", role: "4번타자", pcode: "54400" },
      { id: "plr-sam-17", groupId: "team-sam", name: "김영웅", nameKo: "김영웅", position: "내야수", jerseyNumber: 30, color: "#074CA1", role: "주전", pcode: "52430" },
      { id: "plr-sam-18", groupId: "team-sam", name: "류지혁", nameKo: "류지혁", position: "내야수", jerseyNumber: 16, color: "#074CA1", role: "주전", pcode: "62234" },
      { id: "plr-sam-19", groupId: "team-sam", name: "이재현", nameKo: "이재현", position: "내야수", jerseyNumber: 7, color: "#074CA1", role: "주전", pcode: "52415" },
      { id: "plr-sam-20", groupId: "team-sam", name: "전병우", nameKo: "전병우", position: "내야수", jerseyNumber: 61, color: "#074CA1", role: "주전", pcode: "65586" },
      { id: "plr-sam-21", groupId: "team-sam", name: "이해승", nameKo: "이해승", position: "내야수", jerseyNumber: 3, color: "#074CA1", role: "주전", pcode: "69416" },
      { id: "plr-sam-22", groupId: "team-sam", name: "심재훈", nameKo: "심재훈", position: "내야수", jerseyNumber: 6, color: "#074CA1", role: "주전", pcode: "55438" },
      { id: "plr-sam-23", groupId: "team-sam", name: "김재상", nameKo: "김재상", position: "내야수", jerseyNumber: 14, color: "#074CA1", role: "주전", pcode: "53400" },
      // 외야수 (7명)
      { id: "plr-sam-24", groupId: "team-sam", name: "구자욱", nameKo: "구자욱", position: "외야수", jerseyNumber: 5, color: "#074CA1", role: "핵심", pcode: "62404" },
      { id: "plr-sam-25", groupId: "team-sam", name: "최형우", nameKo: "최형우", position: "외야수", jerseyNumber: 34, color: "#074CA1", role: "핵심", pcode: "72443" },
      { id: "plr-sam-26", groupId: "team-sam", name: "김헌곤", nameKo: "김헌곤", position: "외야수", jerseyNumber: 32, color: "#074CA1", role: "주전", pcode: "61404" },
      { id: "plr-sam-27", groupId: "team-sam", name: "김지찬", nameKo: "김지찬", position: "외야수", jerseyNumber: 58, color: "#074CA1", role: "핵심", pcode: "50458" },
      { id: "plr-sam-28", groupId: "team-sam", name: "김성윤", nameKo: "김성윤", position: "외야수", jerseyNumber: 39, color: "#074CA1", role: "주전", pcode: "67449" },
      { id: "plr-sam-29", groupId: "team-sam", name: "홍현빈", nameKo: "홍현빈", position: "외야수", jerseyNumber: 51, color: "#074CA1", role: "주전", pcode: "67005" },
      { id: "plr-sam-30", groupId: "team-sam", name: "박승규", nameKo: "박승규", position: "외야수", jerseyNumber: 66, color: "#074CA1", role: "리드오프", pcode: "69418" },
      // ── Hanwha Eagles ──
      { id: "plr-han-1", groupId: "team-han", name: "강백호", nameKo: "강백호", position: "내야수", jerseyNumber: 50, color: "#FF6600", role: "4번타자", pcode: "68050" },
      { id: "plr-han-2", groupId: "team-han", name: "노시환", nameKo: "노시환", position: "내야수", jerseyNumber: 8, color: "#FF6600", role: "3번타자", pcode: "69737" },
      { id: "plr-han-3", groupId: "team-han", name: "에르난데스", nameKo: "에르난데스", position: "투수", jerseyNumber: 41, color: "#FF6600", role: "에이스", pcode: "56712" },
      { id: "plr-han-4", groupId: "team-han", name: "화이트", nameKo: "화이트", position: "투수", jerseyNumber: 47, color: "#FF6600", role: "선발", pcode: "70542" },
      { id: "plr-han-5", groupId: "team-han", name: "최재훈", nameKo: "최재훈", position: "포수", jerseyNumber: 13, color: "#FF6600", role: "주전", pcode: "78288" },
      { id: "plr-han-6", groupId: "team-han", name: "손아섭", nameKo: "손아섭", position: "외야수", jerseyNumber: 15, color: "#FF6600", role: "핵심", pcode: "77532" },
      { id: "plr-han-7", groupId: "team-han", name: "페라자", nameKo: "페라자", position: "외야수", jerseyNumber: 27, color: "#FF6600", role: "핵심", pcode: "54730" },
      { id: "plr-han-8", groupId: "team-han", name: "조동욱", nameKo: "조동욱", position: "투수", jerseyNumber: 31, color: "#FF6600", role: "선발", pcode: "54768" },
      { id: "plr-han-9", groupId: "team-han", name: "박준영", nameKo: "박준영", position: "투수", jerseyNumber: 21, color: "#FF6600", role: "선발", pcode: "52731" },
      { id: "plr-han-10", groupId: "team-han", name: "강재민", nameKo: "강재민", position: "투수", jerseyNumber: 37, color: "#FF6600", role: "마감", pcode: "50705" },
      { id: "plr-han-11", groupId: "team-han", name: "채은성", nameKo: "채은성", position: "내야수", jerseyNumber: 22, color: "#FF6600", role: "핵심", pcode: "79192" },
      { id: "plr-han-12", groupId: "team-han", name: "이도윤", nameKo: "이도윤", position: "내야수", jerseyNumber: 5, color: "#FF6600", role: "리드오프", pcode: "65703" },
      { id: "plr-han-13", groupId: "team-han", name: "이진영", nameKo: "이진영", position: "외야수", jerseyNumber: 10, color: "#FF6600", role: "주전", pcode: "66657" },
      { id: "plr-han-14", groupId: "team-han", name: "하주석", nameKo: "하주석", position: "내야수", jerseyNumber: 16, color: "#FF6600", role: "주전", pcode: "62700" },
      { id: "plr-han-15", groupId: "team-han", name: "오재원", nameKo: "오재원", position: "외야수", jerseyNumber: 9, color: "#FF6600", role: "유망주", pcode: "56754" },
      // ── Kiwoom Heroes ──
      { id: "plr-kiw-1", groupId: "team-kiw", name: "이주형", nameKo: "이주형", position: "외야수", jerseyNumber: 51, color: "#820024", role: "리드오프", pcode: "50167" },
      { id: "plr-kiw-2", groupId: "team-kiw", name: "알칸타라", nameKo: "알칸타라", position: "투수", jerseyNumber: 43, color: "#820024", role: "에이스", pcode: "69045" },
      { id: "plr-kiw-3", groupId: "team-kiw", name: "와일스", nameKo: "와일스", position: "투수", jerseyNumber: 49, color: "#820024", role: "선발", pcode: "56334" },
      { id: "plr-kiw-4", groupId: "team-kiw", name: "하영민", nameKo: "하영민", position: "투수", jerseyNumber: 19, color: "#820024", role: "선발", pcode: "64350" },
      { id: "plr-kiw-5", groupId: "team-kiw", name: "브룩스", nameKo: "트렌턴 브룩스", position: "외야수", jerseyNumber: 50, color: "#820024", role: "3번타자", pcode: "56322" },
      { id: "plr-kiw-6", groupId: "team-kiw", name: "김재웅", nameKo: "김재웅", position: "투수", jerseyNumber: 28, color: "#820024", role: "마감", pcode: "67391" },
      { id: "plr-kiw-7", groupId: "team-kiw", name: "윤석원", nameKo: "윤석원", position: "투수", jerseyNumber: 22, color: "#820024", role: "셋업", pcode: "52395" },
      { id: "plr-kiw-8", groupId: "team-kiw", name: "안치홍", nameKo: "안치홍", position: "내야수", jerseyNumber: 13, color: "#820024", role: "핵심", pcode: "79608" },
      { id: "plr-kiw-9", groupId: "team-kiw", name: "최주환", nameKo: "최주환", position: "내야수", jerseyNumber: 7, color: "#820024", role: "4번타자", pcode: "76267" },
      { id: "plr-kiw-10", groupId: "team-kiw", name: "김건희", nameKo: "김건희", position: "포수", jerseyNumber: 10, color: "#820024", role: "주전", pcode: "53312" },
      { id: "plr-kiw-11", groupId: "team-kiw", name: "추재현", nameKo: "추재현", position: "외야수", jerseyNumber: 25, color: "#820024", role: "주전", pcode: "68362" },
      { id: "plr-kiw-12", groupId: "team-kiw", name: "김태진", nameKo: "김태진", position: "내야수", jerseyNumber: 3, color: "#820024", role: "주전", pcode: "64984" },
      { id: "plr-kiw-13", groupId: "team-kiw", name: "오석주", nameKo: "오석주", position: "투수", jerseyNumber: 17, color: "#820024", role: "선발", pcode: "67116" },
      { id: "plr-kiw-14", groupId: "team-kiw", name: "이형종", nameKo: "이형종", position: "외야수", jerseyNumber: 55, color: "#820024", role: "주전", pcode: "78135" },
      { id: "plr-kiw-15", groupId: "team-kiw", name: "오선진", nameKo: "오선진", position: "내야수", jerseyNumber: 6, color: "#820024", role: "유망주", pcode: "78756" },
    ];
    players.forEach((p) => addItem(STORE_KEYS.KBO_PLAYERS, p));
  }

  // Fandom Feed Posts — 실제 사용자 데이터만 사용 (가짜 시드 제거)
  if (listItems(STORE_KEYS.FANDOM_FEED).length === 0) {
    const posts: FandomFeedPost[] = [
    ];
    posts.forEach((p) => addItem(STORE_KEYS.FANDOM_FEED, p));
  }

  // Fandom Comments — 실제 사용자 데이터만 사용 (가짜 시드 제거)
  if (listItems(STORE_KEYS.FANDOM_COMMENTS).length === 0) {
    const comments: FandomComment[] = [];
    comments.forEach((c) => addItem(STORE_KEYS.FANDOM_COMMENTS, c));
  }

  // Fandom Events — 실제 사용자 데이터만 사용 (가짜 시드 제거)
  if (listItems(STORE_KEYS.FANDOM_EVENTS).length === 0) {
    const events: FandomEvent[] = [];
    events.forEach((e) => addItem(STORE_KEYS.FANDOM_EVENTS, e));
  }

  // Fan Creators — 실제 사용자 데이터만 사용 (가짜 시드 제거)
  if (listItems(STORE_KEYS.FAN_CREATORS).length === 0) {
    const creators: FanCreator[] = [];
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
        id: "ec-1", type: "team-profile", title: "LG 트윈스 구단 프로필", description: "LG 트윈스 공식 프로필 정리", authorName: "트윈스드로잉",
        fandomId: "team-lg", fandomName: "LG Twins", tags: ["LG", "트윈스", "잠실"], status: "published",
        likes: 234, views: 1560, commentCount: 12, createdAt: "2026-03-20", updatedAt: "2026-03-22",
        groupName: "LG Twins", company: "LG", debutDate: "1982-01-01", bio: "서울을 대표하는 전통 구단 LG 트윈스. 1982년 창단 이후 잠실야구장을 홈으로 하는 명문 구단입니다.",
        members: [{ name: "오지환", position: "내야수" }, { name: "박해민", position: "외야수" }, { name: "임찬규", position: "투수" }, { name: "오스틴", position: "외야수" }, { name: "박동원", position: "포수" }],
        profileImageUrl: null, galleryImages: [],
      },
      {
        id: "ec-2", type: "fanart", title: "NC 다이노스 우승 팬아트", description: "2020 한국시리즈 우승 영감 팬아트",
        authorName: "다이노스작가", fandomId: "team-nc", fandomName: "NC Dinos", playerId: "plr-nc-1", playerName: "박건우",
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
        authorName: "랜더스그림", fandomId: "team-ssg", fandomName: "SSG Landers", playerId: "plr-ssg-1", playerName: "최정",
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

  // ── KBO Schedule Seed (폴백 — API 실패 시 generator 데이터 사용) ──
  if (listItems(STORE_KEYS.KBO_SCHEDULE).length === 0) {
    const schedule = generateKbo2026Schedule();
    /* === Old hardcoded 45-game schedule (replaced by full-season generator) ===
      // 3/28 개막전 (토) 14:00 - 5경기
      { id: "game-1", homeTeamId: "team-lg", awayTeamId: "team-kt", homeTeamName: "LG 트윈스", awayTeamName: "KT 위즈", date: "2026-03-28", time: "14:00", stadium: "잠실야구장", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-2", homeTeamId: "team-ssg", awayTeamId: "team-kia", homeTeamName: "SSG 랜더스", awayTeamName: "KIA 타이거즈", date: "2026-03-28", time: "14:00", stadium: "인천 SSG랜더스필드", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-3", homeTeamId: "team-han", awayTeamId: "team-kiw", homeTeamName: "한화 이글스", awayTeamName: "키움 히어로즈", date: "2026-03-28", time: "14:00", stadium: "대전 한화생명이글스파크", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-4", homeTeamId: "team-sam", awayTeamId: "team-lot", homeTeamName: "삼성 라이온즈", awayTeamName: "롯데 자이언츠", date: "2026-03-28", time: "14:00", stadium: "대구 삼성라이온즈파크", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-5", homeTeamId: "team-nc", awayTeamId: "team-doo", homeTeamName: "NC 다이노스", awayTeamName: "두산 베어스", date: "2026-03-28", time: "14:00", stadium: "창원 NC파크", status: "scheduled", homeScore: null, awayScore: null },
      // 3/29 2연전 (일) 14:00 - same matchups
      { id: "game-6", homeTeamId: "team-lg", awayTeamId: "team-kt", homeTeamName: "LG 트윈스", awayTeamName: "KT 위즈", date: "2026-03-29", time: "14:00", stadium: "잠실야구장", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-7", homeTeamId: "team-ssg", awayTeamId: "team-kia", homeTeamName: "SSG 랜더스", awayTeamName: "KIA 타이거즈", date: "2026-03-29", time: "14:00", stadium: "인천 SSG랜더스필드", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-8", homeTeamId: "team-han", awayTeamId: "team-kiw", homeTeamName: "한화 이글스", awayTeamName: "키움 히어로즈", date: "2026-03-29", time: "14:00", stadium: "대전 한화생명이글스파크", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-9", homeTeamId: "team-sam", awayTeamId: "team-lot", homeTeamName: "삼성 라이온즈", awayTeamName: "롯데 자이언츠", date: "2026-03-29", time: "14:00", stadium: "대구 삼성라이온즈파크", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-10", homeTeamId: "team-nc", awayTeamId: "team-doo", homeTeamName: "NC 다이노스", awayTeamName: "두산 베어스", date: "2026-03-29", time: "14:00", stadium: "창원 NC파크", status: "scheduled", homeScore: null, awayScore: null },
      // 3/31 새 카드 3연전 (화) 18:30
      { id: "game-11", homeTeamId: "team-kt", awayTeamId: "team-ssg", homeTeamName: "KT 위즈", awayTeamName: "SSG 랜더스", date: "2026-03-31", time: "18:30", stadium: "수원 KT위즈파크", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-12", homeTeamId: "team-lg", awayTeamId: "team-nc", homeTeamName: "LG 트윈스", awayTeamName: "NC 다이노스", date: "2026-03-31", time: "18:30", stadium: "잠실야구장", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-13", homeTeamId: "team-doo", awayTeamId: "team-kia", homeTeamName: "두산 베어스", awayTeamName: "KIA 타이거즈", date: "2026-03-31", time: "18:30", stadium: "잠실야구장", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-14", homeTeamId: "team-lot", awayTeamId: "team-han", homeTeamName: "롯데 자이언츠", awayTeamName: "한화 이글스", date: "2026-03-31", time: "18:30", stadium: "사직야구장", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-15", homeTeamId: "team-kiw", awayTeamId: "team-sam", homeTeamName: "키움 히어로즈", awayTeamName: "삼성 라이온즈", date: "2026-03-31", time: "18:30", stadium: "고척스카이돔", status: "scheduled", homeScore: null, awayScore: null },
      // 4/1 3연전 2일차 (수) 18:30
      { id: "game-16", homeTeamId: "team-kt", awayTeamId: "team-ssg", homeTeamName: "KT 위즈", awayTeamName: "SSG 랜더스", date: "2026-04-01", time: "18:30", stadium: "수원 KT위즈파크", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-17", homeTeamId: "team-lg", awayTeamId: "team-nc", homeTeamName: "LG 트윈스", awayTeamName: "NC 다이노스", date: "2026-04-01", time: "18:30", stadium: "잠실야구장", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-18", homeTeamId: "team-doo", awayTeamId: "team-kia", homeTeamName: "두산 베어스", awayTeamName: "KIA 타이거즈", date: "2026-04-01", time: "18:30", stadium: "잠실야구장", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-19", homeTeamId: "team-lot", awayTeamId: "team-han", homeTeamName: "롯데 자이언츠", awayTeamName: "한화 이글스", date: "2026-04-01", time: "18:30", stadium: "사직야구장", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-20", homeTeamId: "team-kiw", awayTeamId: "team-sam", homeTeamName: "키움 히어로즈", awayTeamName: "삼성 라이온즈", date: "2026-04-01", time: "18:30", stadium: "고척스카이돔", status: "scheduled", homeScore: null, awayScore: null },
      // 4/2 3연전 3일차 (목) 18:30
      { id: "game-21", homeTeamId: "team-kt", awayTeamId: "team-ssg", homeTeamName: "KT 위즈", awayTeamName: "SSG 랜더스", date: "2026-04-02", time: "18:30", stadium: "수원 KT위즈파크", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-22", homeTeamId: "team-lg", awayTeamId: "team-nc", homeTeamName: "LG 트윈스", awayTeamName: "NC 다이노스", date: "2026-04-02", time: "18:30", stadium: "잠실야구장", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-23", homeTeamId: "team-doo", awayTeamId: "team-kia", homeTeamName: "두산 베어스", awayTeamName: "KIA 타이거즈", date: "2026-04-02", time: "18:30", stadium: "잠실야구장", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-24", homeTeamId: "team-lot", awayTeamId: "team-han", homeTeamName: "롯데 자이언츠", awayTeamName: "한화 이글스", date: "2026-04-02", time: "18:30", stadium: "사직야구장", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-25", homeTeamId: "team-kiw", awayTeamId: "team-sam", homeTeamName: "키움 히어로즈", awayTeamName: "삼성 라이온즈", date: "2026-04-02", time: "18:30", stadium: "고척스카이돔", status: "scheduled", homeScore: null, awayScore: null },
      // 4/3 새 카드 (금) 18:30
      { id: "game-26", homeTeamId: "team-kia", awayTeamId: "team-lg", homeTeamName: "KIA 타이거즈", awayTeamName: "LG 트윈스", date: "2026-04-03", time: "18:30", stadium: "광주 기아챔피언스필드", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-27", homeTeamId: "team-ssg", awayTeamId: "team-doo", homeTeamName: "SSG 랜더스", awayTeamName: "두산 베어스", date: "2026-04-03", time: "18:30", stadium: "인천 SSG랜더스필드", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-28", homeTeamId: "team-han", awayTeamId: "team-nc", homeTeamName: "한화 이글스", awayTeamName: "NC 다이노스", date: "2026-04-03", time: "18:30", stadium: "대전 한화생명이글스파크", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-29", homeTeamId: "team-sam", awayTeamId: "team-kiw", homeTeamName: "삼성 라이온즈", awayTeamName: "키움 히어로즈", date: "2026-04-03", time: "18:30", stadium: "대구 삼성라이온즈파크", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-30", homeTeamId: "team-lot", awayTeamId: "team-kt", homeTeamName: "롯데 자이언츠", awayTeamName: "KT 위즈", date: "2026-04-03", time: "18:30", stadium: "사직야구장", status: "scheduled", homeScore: null, awayScore: null },
      // 4/4 (토) 14:00
      { id: "game-31", homeTeamId: "team-kia", awayTeamId: "team-lg", homeTeamName: "KIA 타이거즈", awayTeamName: "LG 트윈스", date: "2026-04-04", time: "14:00", stadium: "광주 기아챔피언스필드", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-32", homeTeamId: "team-ssg", awayTeamId: "team-doo", homeTeamName: "SSG 랜더스", awayTeamName: "두산 베어스", date: "2026-04-04", time: "14:00", stadium: "인천 SSG랜더스필드", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-33", homeTeamId: "team-han", awayTeamId: "team-nc", homeTeamName: "한화 이글스", awayTeamName: "NC 다이노스", date: "2026-04-04", time: "14:00", stadium: "대전 한화생명이글스파크", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-34", homeTeamId: "team-sam", awayTeamId: "team-kiw", homeTeamName: "삼성 라이온즈", awayTeamName: "키움 히어로즈", date: "2026-04-04", time: "14:00", stadium: "대구 삼성라이온즈파크", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-35", homeTeamId: "team-lot", awayTeamId: "team-kt", homeTeamName: "롯데 자이언츠", awayTeamName: "KT 위즈", date: "2026-04-04", time: "14:00", stadium: "사직야구장", status: "scheduled", homeScore: null, awayScore: null },
      // 4/5 (일) 14:00
      { id: "game-36", homeTeamId: "team-kia", awayTeamId: "team-lg", homeTeamName: "KIA 타이거즈", awayTeamName: "LG 트윈스", date: "2026-04-05", time: "14:00", stadium: "광주 기아챔피언스필드", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-37", homeTeamId: "team-ssg", awayTeamId: "team-doo", homeTeamName: "SSG 랜더스", awayTeamName: "두산 베어스", date: "2026-04-05", time: "14:00", stadium: "인천 SSG랜더스필드", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-38", homeTeamId: "team-han", awayTeamId: "team-nc", homeTeamName: "한화 이글스", awayTeamName: "NC 다이노스", date: "2026-04-05", time: "14:00", stadium: "대전 한화생명이글스파크", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-39", homeTeamId: "team-sam", awayTeamId: "team-kiw", homeTeamName: "삼성 라이온즈", awayTeamName: "키움 히어로즈", date: "2026-04-05", time: "14:00", stadium: "대구 삼성라이온즈파크", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-40", homeTeamId: "team-lot", awayTeamId: "team-kt", homeTeamName: "롯데 자이언츠", awayTeamName: "KT 위즈", date: "2026-04-05", time: "14:00", stadium: "사직야구장", status: "scheduled", homeScore: null, awayScore: null },
      // 4/6 (월) 14:00
      { id: "game-41", homeTeamId: "team-kia", awayTeamId: "team-lg", homeTeamName: "KIA 타이거즈", awayTeamName: "LG 트윈스", date: "2026-04-06", time: "14:00", stadium: "광주 기아챔피언스필드", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-42", homeTeamId: "team-ssg", awayTeamId: "team-doo", homeTeamName: "SSG 랜더스", awayTeamName: "두산 베어스", date: "2026-04-06", time: "14:00", stadium: "인천 SSG랜더스필드", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-43", homeTeamId: "team-han", awayTeamId: "team-nc", homeTeamName: "한화 이글스", awayTeamName: "NC 다이노스", date: "2026-04-06", time: "14:00", stadium: "대전 한화생명이글스파크", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-44", homeTeamId: "team-sam", awayTeamId: "team-kiw", homeTeamName: "삼성 라이온즈", awayTeamName: "키움 히어로즈", date: "2026-04-06", time: "14:00", stadium: "대구 삼성라이온즈파크", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-45", homeTeamId: "team-lot", awayTeamId: "team-kt", homeTeamName: "롯데 자이언츠", awayTeamName: "KT 위즈", date: "2026-04-06", time: "14:00", stadium: "사직야구장", status: "scheduled", homeScore: null, awayScore: null },
    ]; === */
    schedule.forEach((g) => addItem(STORE_KEYS.KBO_SCHEDULE, g));
  }

  // ── KBO Standings Seed ─────────────────────────────────────────────────────
  if (listItems(STORE_KEYS.KBO_STANDINGS).length === 0) {
    const standings: KboStanding[] = [
      { id: "st-1", teamId: "team-lg", teamName: "LG 트윈스", teamColor: "#C60C30", wins: 0, losses: 0, draws: 0, winRate: ".000", gamesBack: "-", streak: "-", last10: "-", rank: 1 },
      { id: "st-2", teamId: "team-kia", teamName: "KIA 타이거즈", teamColor: "#EA0029", wins: 0, losses: 0, draws: 0, winRate: ".000", gamesBack: "-", streak: "-", last10: "-", rank: 2 },
      { id: "st-3", teamId: "team-sam", teamName: "삼성 라이온즈", teamColor: "#074CA1", wins: 0, losses: 0, draws: 0, winRate: ".000", gamesBack: "-", streak: "-", last10: "-", rank: 3 },
      { id: "st-4", teamId: "team-doo", teamName: "두산 베어스", teamColor: "#131230", wins: 0, losses: 0, draws: 0, winRate: ".000", gamesBack: "-", streak: "-", last10: "-", rank: 4 },
      { id: "st-5", teamId: "team-ssg", teamName: "SSG 랜더스", teamColor: "#CE0E2D", wins: 0, losses: 0, draws: 0, winRate: ".000", gamesBack: "-", streak: "-", last10: "-", rank: 5 },
      { id: "st-6", teamId: "team-nc", teamName: "NC 다이노스", teamColor: "#315288", wins: 0, losses: 0, draws: 0, winRate: ".000", gamesBack: "-", streak: "-", last10: "-", rank: 6 },
      { id: "st-7", teamId: "team-lot", teamName: "롯데 자이언츠", teamColor: "#041E42", wins: 0, losses: 0, draws: 0, winRate: ".000", gamesBack: "-", streak: "-", last10: "-", rank: 7 },
      { id: "st-8", teamId: "team-kt", teamName: "KT 위즈", teamColor: "#000000", wins: 0, losses: 0, draws: 0, winRate: ".000", gamesBack: "-", streak: "-", last10: "-", rank: 8 },
      { id: "st-9", teamId: "team-han", teamName: "한화 이글스", teamColor: "#FF6600", wins: 0, losses: 0, draws: 0, winRate: ".000", gamesBack: "-", streak: "-", last10: "-", rank: 9 },
      { id: "st-10", teamId: "team-kiw", teamName: "키움 히어로즈", teamColor: "#820024", wins: 0, losses: 0, draws: 0, winRate: ".000", gamesBack: "-", streak: "-", last10: "-", rank: 10 },
    ];
    standings.forEach((s) => addItem(STORE_KEYS.KBO_STANDINGS, s));
  }

  // ── Cheer Songs Seed (disabled – feature removed) ──────────────────────────
  if (false && listItems(STORE_KEYS.CHEER_SONGS).length === 0) {
    const songs: CheerSong[] = [
      // LG Twins
      { id: "cs-lg-1", teamId: "team-lg", teamName: "LG 트윈스", title: "LG 트윈스 구단가", type: "team", lyrics: "우리는 LG 트윈스\n승리를 향해 달려가자\n잠실의 함성 속에\n오늘도 우리는 하나!", description: "LG 트윈스 공식 구단가", order: 1 },
      { id: "cs-lg-2", teamId: "team-lg", teamName: "LG 트윈스", title: "오지환 응원가", type: "player", playerName: "오지환", lyrics: "오지환 오지환\n잠실의 유격수\n화려한 수비 날카로운 타격\n오지환 화이팅!", description: "오지환 선수 개인 응원가", order: 2 },
      { id: "cs-lg-3", teamId: "team-lg", teamName: "LG 트윈스", title: "승리의 노래", type: "situation", lyrics: "이겼다 이겼다 LG가 이겼다\n잠실의 밤하늘 아래\n승리의 기쁨을 나누자\n우리는 트윈스!", description: "승리 후 부르는 응원가", order: 3 },
      { id: "cs-lg-4", teamId: "team-lg", teamName: "LG 트윈스", title: "박해민 응원가", type: "player", playerName: "박해민", lyrics: "달려라 박해민\n바람보다 빠르게\n도루왕 박해민\n그라운드를 지배해!", description: "박해민 선수 응원가", order: 4 },
      { id: "cs-lg-5", teamId: "team-lg", teamName: "LG 트윈스", title: "홈런 응원가", type: "situation", lyrics: "날아가라 높이 높이\n담장을 넘어서\n잠실의 함성과 함께\n홈런! 홈런!", description: "홈런 타구 시 응원가", order: 5 },
      // KIA Tigers
      { id: "cs-kia-1", teamId: "team-kia", teamName: "KIA 타이거즈", title: "해뜰날", type: "team", lyrics: "해뜰날 해뜰날\n광주의 해뜰날\n타이거즈 승리의 해뜰날\n함께 가자 우리 모두!", description: "KIA 타이거즈 대표 응원가", order: 1 },
      { id: "cs-kia-2", teamId: "team-kia", teamName: "KIA 타이거즈", title: "양현종 응원가", type: "player", playerName: "양현종", lyrics: "양현종 양현종\n마운드의 지배자\n에이스의 투구 삼진의 쾌감\n양현종 화이팅!", description: "양현종 선수 응원가", order: 2 },
      { id: "cs-kia-3", teamId: "team-kia", teamName: "KIA 타이거즈", title: "김도영 응원가", type: "player", playerName: "김도영", lyrics: "김도영 김도영\n20-20 슈퍼스타\n타격도 수비도 완벽하게\n김도영 파이팅!", description: "김도영 선수 응원가", order: 3 },
      { id: "cs-kia-4", teamId: "team-kia", teamName: "KIA 타이거즈", title: "타이거즈 파이팅", type: "team", lyrics: "광주의 호랑이들\n오늘도 으르렁\n챔피언스필드 가득 채운 함성\n타이거즈 파이팅!", description: "경기 시작 응원가", order: 4 },
      { id: "cs-kia-5", teamId: "team-kia", teamName: "KIA 타이거즈", title: "역전 응원가", type: "situation", lyrics: "뒤집자 뒤집자\n지금부터 시작이다\n타이거즈의 역전 드라마\n이길 수 있다!", description: "역전 상황 응원가", order: 5 },
      // Lotte Giants
      { id: "cs-lot-1", teamId: "team-lot", teamName: "롯데 자이언츠", title: "부산 갈매기", type: "team", lyrics: "부산 갈매기 부산 갈매기\n사직의 함성 속에\n자이언츠 승리를 위해\n오늘도 응원한다!", description: "롯데 자이언츠 대표 응원가", order: 1 },
      { id: "cs-lot-2", teamId: "team-lot", teamName: "롯데 자이언츠", title: "전준우 응원가", type: "player", playerName: "전준우", lyrics: "전준우 전준우\n사직의 스타\n타석에 서면 기대가 되는\n전준우 홈런!", description: "전준우 선수 응원가", order: 2 },
      { id: "cs-lot-3", teamId: "team-lot", teamName: "롯데 자이언츠", title: "사직 응원가", type: "team", lyrics: "사직에 모인 우리들\n하나 된 함성으로\n자이언츠 승리 이끌자\n부산의 자존심!", description: "사직야구장 응원가", order: 3 },
      { id: "cs-lot-4", teamId: "team-lot", teamName: "롯데 자이언츠", title: "비닐봉지 응원", type: "situation", lyrics: "비닐봉지를 흔들어라\n사직의 열정을 보여줘\n뜨거운 응원의 물결\n자이언츠 화이팅!", description: "비닐봉지 응원 챈트", order: 4 },
      { id: "cs-lot-5", teamId: "team-lot", teamName: "롯데 자이언츠", title: "7회 럭키세븐", type: "situation", lyrics: "럭키 세븐 럭키 세븐\n7회가 왔다\n역전의 자이언츠\n이길 수 있다!", description: "7회 응원가", order: 5 },
      // Samsung Lions
      { id: "cs-sam-1", teamId: "team-sam", teamName: "삼성 라이온즈", title: "삼성 라이온즈 구단가", type: "team", lyrics: "대구의 사자들\n포효하라 라이온즈\n4연패의 전설을 이어\n오늘도 승리하자!", description: "삼성 라이온즈 구단가", order: 1 },
      { id: "cs-sam-2", teamId: "team-sam", teamName: "삼성 라이온즈", title: "구자욱 응원가", type: "player", playerName: "구자욱", lyrics: "구자욱 구자욱\n라이온즈의 타격왕\n타석에 서면 안타가 되는\n구자욱 파이팅!", description: "구자욱 선수 응원가", order: 2 },
      { id: "cs-sam-3", teamId: "team-sam", teamName: "삼성 라이온즈", title: "오승환 응원가", type: "player", playerName: "오승환", lyrics: "돌직구 오승환\n마운드의 전설\n삼진을 잡아라\n석직구 화이팅!", description: "오승환 선수 응원가", order: 3 },
      { id: "cs-sam-4", teamId: "team-sam", teamName: "삼성 라이온즈", title: "삼성 찬가", type: "team", lyrics: "라이온즈 라이온즈\n대구의 자존심\n승리를 향한 포효\n삼성 파이팅!", description: "경기 시작 응원가", order: 4 },
      { id: "cs-sam-5", teamId: "team-sam", teamName: "삼성 라이온즈", title: "득점 챈트", type: "situation", lyrics: "들어가라 들어가라\n홈으로 들어가라\n라이온즈 득점!\n대구의 함성!", description: "득점 시 응원가", order: 5 },
      // Doosan Bears
      { id: "cs-doo-1", teamId: "team-doo", teamName: "두산 베어스", title: "두산 베어스 구단가", type: "team", lyrics: "우리는 두산 베어스\n잠실의 왕자들\n강한 타선 철벽 수비\n두산 베어스 파이팅!", description: "두산 베어스 구단가", order: 1 },
      { id: "cs-doo-2", teamId: "team-doo", teamName: "두산 베어스", title: "김재환 응원가", type: "player", playerName: "김재환", lyrics: "김재환 김재환\n잠실의 대포\n타석에 서면 홈런 예감\n김재환 홈런!", description: "김재환 선수 응원가", order: 2 },
      { id: "cs-doo-3", teamId: "team-doo", teamName: "두산 베어스", title: "그것만이 내 세상", type: "team", lyrics: "두산이 내 세상\n잠실이 내 집\n오늘도 응원한다\n베어스 화이팅!", description: "두산 팬 애창곡", order: 3 },
      { id: "cs-doo-4", teamId: "team-doo", teamName: "두산 베어스", title: "허경민 응원가", type: "player", playerName: "허경민", lyrics: "허경민 허경민\n철벽의 유격수\n화려한 수비에 날카로운 타격\n허경민 파이팅!", description: "허경민 선수 응원가", order: 4 },
      { id: "cs-doo-5", teamId: "team-doo", teamName: "두산 베어스", title: "승리의 행진", type: "situation", lyrics: "이겼다 두산\n이겼다 베어스\n잠실의 밤하늘에\n승리의 불꽃!", description: "승리 후 응원가", order: 5 },
      // SSG Landers
      { id: "cs-ssg-1", teamId: "team-ssg", teamName: "SSG 랜더스", title: "SSG 랜더스 구단가", type: "team", lyrics: "인천의 자존심 SSG\n랜더스필드의 함성\n승리를 향해 달려가자\n랜더스 파이팅!", description: "SSG 랜더스 구단가", order: 1 },
      { id: "cs-ssg-2", teamId: "team-ssg", teamName: "SSG 랜더스", title: "최정 응원가", type: "player", playerName: "최정", lyrics: "최정 최정 홈런왕\n500홈런의 전설\n타석에 서면 담장 넘어\n최정 화이팅!", description: "최정 선수 응원가", order: 2 },
      { id: "cs-ssg-3", teamId: "team-ssg", teamName: "SSG 랜더스", title: "김광현 응원가", type: "player", playerName: "김광현", lyrics: "김광현 김광현\n좌완의 에이스\n삼진 행렬 이어가라\n김광현 파이팅!", description: "김광현 선수 응원가", order: 3 },
      { id: "cs-ssg-4", teamId: "team-ssg", teamName: "SSG 랜더스", title: "랜더스 파이팅", type: "team", lyrics: "인천의 바다처럼\n넓은 마음으로\n랜더스 응원하자\nSSG 승리!", description: "경기 시작 응원가", order: 4 },
      { id: "cs-ssg-5", teamId: "team-ssg", teamName: "SSG 랜더스", title: "9회 응원가", type: "situation", lyrics: "마지막 이닝이다\n끝까지 응원하자\nSSG의 승리를 위해\n랜더스 파이팅!", description: "9회 응원가", order: 5 },
      // NC Dinos
      { id: "cs-nc-1", teamId: "team-nc", teamName: "NC 다이노스", title: "NC 다이노스 구단가", type: "team", lyrics: "창원의 공룡 군단\nNC 다이노스\n강한 발걸음으로\n승리를 향해!", description: "NC 다이노스 구단가", order: 1 },
      { id: "cs-nc-2", teamId: "team-nc", teamName: "NC 다이노스", title: "양의지 응원가", type: "player", playerName: "양의지", lyrics: "양의지 양의지\n최고의 포수\n리드도 타격도 완벽한\n양의지 파이팅!", description: "양의지 선수 응원가", order: 2 },
      { id: "cs-nc-3", teamId: "team-nc", teamName: "NC 다이노스", title: "박건우 응원가", type: "player", playerName: "박건우", lyrics: "박건우 박건우\n외야의 지배자\n캐치부터 타격까지\n박건우 홈런!", description: "박건우 선수 응원가", order: 3 },
      { id: "cs-nc-4", teamId: "team-nc", teamName: "NC 다이노스", title: "다이노스 파이팅", type: "team", lyrics: "공룡의 포효처럼\n강하게 응원하자\nNC파크의 함성으로\n다이노스 승리!", description: "경기 시작 응원가", order: 4 },
      { id: "cs-nc-5", teamId: "team-nc", teamName: "NC 다이노스", title: "역전 챈트", type: "situation", lyrics: "뒤집자 다이노스\n역전의 드라마\n공룡 군단의 반격\n이길 수 있다!", description: "역전 상황 응원가", order: 5 },
      // KT Wiz
      { id: "cs-kt-1", teamId: "team-kt", teamName: "KT 위즈", title: "KT 위즈 구단가", type: "team", lyrics: "수원의 마법사들\nKT 위즈\n위즈파크의 열정으로\n승리를 만들자!", description: "KT 위즈 구단가", order: 1 },
      { id: "cs-kt-2", teamId: "team-kt", teamName: "KT 위즈", title: "강백호 응원가", type: "player", playerName: "강백호", lyrics: "강백호 강백호\n4번 타자의 위엄\n풀스윙 홈런\n강백호 파이팅!", description: "강백호 선수 응원가", order: 2 },
      { id: "cs-kt-3", teamId: "team-kt", teamName: "KT 위즈", title: "위즈 파이팅", type: "team", lyrics: "위즈파크에 울려퍼지는\n응원의 함성\nKT 위즈 승리하라\n수원의 자존심!", description: "경기 시작 응원가", order: 3 },
      { id: "cs-kt-4", teamId: "team-kt", teamName: "KT 위즈", title: "소형준 응원가", type: "player", playerName: "소형준", lyrics: "소형준 소형준\n마운드의 신예\n삼진을 잡아라\n소형준 화이팅!", description: "소형준 선수 응원가", order: 4 },
      { id: "cs-kt-5", teamId: "team-kt", teamName: "KT 위즈", title: "홈런 챈트", type: "situation", lyrics: "날아가라 홈런\n위즈파크를 흔들어\nKT의 대포가 불을 뿜는다\n홈런 홈런!", description: "홈런 시 응원가", order: 5 },
      // Hanwha Eagles
      { id: "cs-han-1", teamId: "team-han", teamName: "한화 이글스", title: "한화 이글스 구단가", type: "team", lyrics: "대전의 독수리\n한화 이글스\n하늘 높이 날아올라\n승리를 잡아라!", description: "한화 이글스 구단가", order: 1 },
      { id: "cs-han-2", teamId: "team-han", teamName: "한화 이글스", title: "노시환 응원가", type: "player", playerName: "노시환", lyrics: "노시환 노시환\n한화의 대포\n홈런을 날려라\n노시환 파이팅!", description: "노시환 선수 응원가", order: 2 },
      { id: "cs-han-3", teamId: "team-han", teamName: "한화 이글스", title: "문동주 응원가", type: "player", playerName: "문동주", lyrics: "문동주 문동주\n에이스의 투혼\n삼진 행렬 이어가라\n문동주 화이팅!", description: "문동주 선수 응원가", order: 3 },
      { id: "cs-han-4", teamId: "team-han", teamName: "한화 이글스", title: "이글스 파이팅", type: "team", lyrics: "독수리의 날갯짓\n이글스파크의 함성\n한화 이글스 승리하라\n대전의 영웅!", description: "경기 시작 응원가", order: 4 },
      { id: "cs-han-5", teamId: "team-han", teamName: "한화 이글스", title: "7회 응원", type: "situation", lyrics: "7회다 일어서라\n이글스 팬이여\n뜨거운 응원으로\n역전을 만들자!", description: "7회 응원가", order: 5 },
      // Kiwoom Heroes
      { id: "cs-kiw-1", teamId: "team-kiw", teamName: "키움 히어로즈", title: "키움 히어로즈 구단가", type: "team", lyrics: "고척의 영웅들\n키움 히어로즈\n돔구장을 뒤흔들어\n승리를 쟁취하라!", description: "키움 히어로즈 구단가", order: 1 },
      { id: "cs-kiw-2", teamId: "team-kiw", teamName: "키움 히어로즈", title: "이정후 응원가", type: "player", playerName: "이정후", lyrics: "이정후 이정후\n타격의 천재\n안타 제조기\n이정후 파이팅!", description: "이정후 선수 응원가", order: 2 },
      { id: "cs-kiw-3", teamId: "team-kiw", teamName: "키움 히어로즈", title: "안우진 응원가", type: "player", playerName: "안우진", lyrics: "안우진 안우진\n괴물 투수\n삼진의 비가 내린다\n안우진 화이팅!", description: "안우진 선수 응원가", order: 3 },
      { id: "cs-kiw-4", teamId: "team-kiw", teamName: "키움 히어로즈", title: "히어로즈 파이팅", type: "team", lyrics: "고척돔에 울려퍼지는\n영웅들의 함성\n키움 히어로즈 승리\n우리가 응원한다!", description: "경기 시작 응원가", order: 4 },
      { id: "cs-kiw-5", teamId: "team-kiw", teamName: "키움 히어로즈", title: "끝까지 응원가", type: "situation", lyrics: "끝까지 끝까지\n포기하지 마라\n히어로즈의 저력을 보여줘\n이길 수 있다!", description: "종반 응원가", order: 5 },
    ];
    songs.forEach((s) => addItem(STORE_KEYS.CHEER_SONGS, s));
  }

  // ── Stadium Guides Seed ────────────────────────────────────────────────────
  if (listItems(STORE_KEYS.STADIUM_GUIDES).length === 0) {
    const guides: StadiumGuide[] = [
      {
        id: "sg-1", teamId: "team-lg", stadiumName: "잠실야구장",
        address: "서울특별시 송파구 올림픽로 25 (잠실동)",
        capacity: 25553,
        transportation: [
          "지하철 2호선 종합운동장역 5·6번 출구 도보 5분",
          "버스: 종합운동장 정류장 하차 (다수 노선)",
          "대중교통 강력 권장 (경기일 주차장 만차 빈번)",
        ],
        nearbyFood: [
          { name: "신철판 야채곱창", desc: "구장 내 1층 인기 메뉴. 잠실 직관의 대표 먹거리" },
          { name: "명인만두 / 파오파오 새우만두", desc: "한입 크기로 경기 보며 먹기 좋은 만두" },
          { name: "송파 치맥거리", desc: "야구장 도보 10분, 경기 후 치킨 맛집 즐비" },
        ],
        tips: [
          "잠실은 LG/두산 공용. LG는 티켓링크, 두산은 인터파크(NOL 티켓) 예매",
          "2층 프랜차이즈 구역이 대기 짧아 초보자 추천. 1층은 혼잡",
          "외부 음식 반입 가능 (유리병/주류 반입 불가, 주류는 내부 구매)",
          "2026년 마지막 시즌 (이후 돔구장 재건) — 기념 이벤트 다수 예정",
        ],
        sections: [
          { name: "외야 그린석 (응원석)", desc: "응원 열기가 가장 뜨거운 곳", priceRange: "8,000~10,000원" },
          { name: "네이비석 (중앙지정석)", desc: "메인 관람 좌석", priceRange: "13,000~15,000원" },
          { name: "블루석 (프리미엄 내야)", desc: "시야 좋은 프리미엄석", priceRange: "20,000~22,000원" },
        ],
        parkingInfo: "약 1,556대 수용. 소형 5,000원/대형 10,000원(선불). 만차 빈번 — 대중교통 강력 권장",
      },
      {
        id: "sg-2", teamId: "team-kt", stadiumName: "수원 KT위즈파크",
        address: "경기도 수원시 장안구 경수대로 893 (조원동)",
        capacity: 20255,
        transportation: [
          "지하철 직접 연결 없음 — 광역버스 이용",
          "수원역에서 7770번 버스 → '위즈파크' 정류장 하차",
          "사당/강남/모란역에서 광역버스 다수 운행",
        ],
        nearbyFood: [
          { name: "진미통닭", desc: "수원 통닭거리 30년 명성. 구장 내 직영점도 운영" },
          { name: "보영만두", desc: "기름 없이 바삭한 군만두 + 쫄면. 구장 내 판매" },
          { name: "행궁동 카페거리", desc: "화성행궁 외곽 인스타 감성 맛집/카페 밀집" },
        ],
        tips: [
          "주차 공간 매우 열악 — 사전 온라인 주차 예약 필수 (1,402면)",
          "경기일 좌회전 입출차 제한 — 시계방향으로 접근 필요",
          "KT WIZZAP 앱으로 모바일 주문 가능",
          "홈플러스 북수원점(1.1km) 주차 후 이동도 대안",
        ],
        sections: [
          { name: "스카이존 (최상단)", desc: "가성비 좋은 상층석", priceRange: "8,000~10,000원" },
          { name: "중앙 지정석", desc: "메인 관람 좌석", priceRange: "12,000~15,000원" },
          { name: "지니존 (테이블석)", desc: "포수 뒤 프리미엄 테이블", priceRange: "50,000원" },
        ],
        parkingInfo: "총 1,402면(종합운동장+야구장). 사전 온라인 예약제, 시계방향 진입 필수",
      },
      {
        id: "sg-3", teamId: "team-ssg", stadiumName: "인천 SSG랜더스필드",
        address: "인천광역시 미추홀구 매소홀로 618",
        capacity: 23000,
        transportation: [
          "인천지하철 1호선 문학경기장역 하차, 도보 약 10분",
          "인천종합터미널에서 인천지하철 환승 → 문학경기장역",
          "수도권 최대 주차장(4,002대)으로 자차도 비교적 편리",
        ],
        nearbyFood: [
          { name: "스테이션 크림새우", desc: "SSG랜더스필드 시그니처 메뉴. KBO 먹거리 성지" },
          { name: "허갈 닭강정", desc: "2층 3루 쪽 위치. 달콤 바삭한 닭강정 + 맥주" },
          { name: "스타벅스 랜더스필드점", desc: "프로야구 경기장 내 세계 최초 스타벅스" },
        ],
        tips: [
          "KBO 구장 중 주차장 가장 넓음 (4,002대) — 자차 이용 편리",
          "이마트 바베큐존, 몰리스 그린존, 커플존 등 특화 좌석 다양",
          "먹거리와 함께 즐기려면 테이블석 추천",
          "주말엔 주차장 입구부터 정체 — 일찍 도착 권장",
        ],
        sections: [
          { name: "외야 잔디석/일반석", desc: "자유로운 분위기의 외야석", priceRange: "10,000~15,000원" },
          { name: "내야 지정석", desc: "메인 관람석", priceRange: "18,000~25,000원" },
          { name: "노브랜드 테이블석", desc: "먹으며 관람하는 프리미엄", priceRange: "55,000~64,000원" },
        ],
        parkingInfo: "수도권 최대 4,002대 수용. 승용차 전일 2,000원(선불). 평일 여유, 주말 조기 만차 가능",
      },
      {
        id: "sg-4", teamId: "team-han", stadiumName: "대전 한화생명 볼파크",
        address: "대전광역시 중구 대종로 373",
        capacity: 17000,
        transportation: [
          "대전 1호선 중구청역 하차 → 택시 10분 (1.6km)",
          "버스: 513번, 604번 등 '한밭종합운동장' 정류장 하차 후 도보 5분",
          "타슈(공유자전거): 중앙로역 3번 출구 앞 대여소에서 약 2km",
        ],
        nearbyFood: [
          { name: "농민순대", desc: "볼파크 근처 전통 맛집. 쫄깃한 순대와 구수한 국물" },
          { name: "대흥칼국수", desc: "대전 명물. 직접 뽑은 면발과 진한 멸치 육수" },
          { name: "한화 브루어리 크래프트 맥주", desc: "KBO 최초 구장 내 양조장 직영 생맥주" },
        ],
        tips: [
          "2025년 신축 개장 KBO 최신 구장 — 인피니티풀, 잔디석 등 혁신 시설",
          "주차난 심각 — 빈 구획 보이면 멀어도 바로 주차하고 이동",
          "티켓 가격 구간제(1~4구간) — 경기 중요도에 따라 변동",
          "경기일 보문로/대종로 정체 심함 — 타슈 이용도 좋은 대안",
        ],
        sections: [
          { name: "응원석 (카스존)", desc: "열정적인 응원 구역", priceRange: "10,000~15,000원" },
          { name: "내야 지정석 A/B", desc: "시야 좋은 메인 관람석", priceRange: "15,000~25,000원" },
          { name: "포수 후면석 / VIP", desc: "최고의 시야 프리미엄", priceRange: "40,000~60,000원" },
        ],
        parkingInfo: "지상 459대 + 지하 1,220대 (총 1,679대). 경기일 경쟁 치열 — 최소 2시간 전 도착 권장",
      },
      {
        id: "sg-5", teamId: "team-sam", stadiumName: "대구 삼성라이온즈파크",
        address: "대구광역시 수성구 야구전설로 1",
        capacity: 24000,
        transportation: [
          "대구 도시철도 2호선 수성알파시티역 4·5번 출구 도보 50m (접근성 최고)",
          "버스: 동대구역에서 399번, 937번 야구장 앞까지 운행",
          "수성IC 인근으로 시외 자차 접근도 편리",
        ],
        nearbyFood: [
          { name: "알통떡강정", desc: "라팍 대표 먹거리. 달콤 바삭한 떡강정 인기 1위" },
          { name: "지코바 치킨", desc: "구장 내 입점. 양념치킨 + 맥주가 라팍 직관의 정석" },
          { name: "땅땅치킨 루프탑존", desc: "루프탑에서 치킨 먹으며 야구 관람 (주중 18,000원~)" },
        ],
        tips: [
          "수성알파시티역에서 50m — KBO 지하철 접근성 최고, 대중교통 강추",
          "블루존(1루 응원석)이 가장 인기 — 일찍 예매 필수",
          "주차장 약 1,097대뿐, 주말 최소 2시간 전 도착 필요",
          "경기 종료 후 출차 혼잡 심함 — 대중교통 귀가 권장",
        ],
        sections: [
          { name: "1루 내야지정석", desc: "삼성 라이온즈 응원석", priceRange: "10,000~14,000원" },
          { name: "VIP석", desc: "프리미엄 시야", priceRange: "50,000~65,000원" },
          { name: "SKY 패밀리존 4인석", desc: "가족 단위 프리미엄 관람", priceRange: "140,000~200,000원" },
        ],
        parkingInfo: "약 1,097대 수용. 선불 2,000원. 경기 종료 후 2시간 내 출차. 주말 최소 2시간 전 도착 권장",
      },
      {
        id: "sg-6", teamId: "team-kia", stadiumName: "광주-기아 챔피언스필드",
        address: "광주광역시 북구 서림로 10 (임동)",
        capacity: 20500,
        transportation: [
          "지하철 직접 연결 없음 (2032년 3호선 개통 예정)",
          "버스: 유스퀘어에서 매월26번, 송암47번 / 광주송정역에서 송정98번",
          "수요응답형 버스(DRT): 경기일 광주공항·유스퀘어 등에서 챔필까지 운행",
        ],
        nearbyFood: [
          { name: "야구공빵 (인크커피)", desc: "챔필 한정 메뉴. 야구공 모양 빵, 기념품 겸 간식" },
          { name: "김치말이국수 + 삼겹살 도시락", desc: "3층 내야 푸드존. 시원한 국수 + 삼겹살 조합" },
          { name: "금바다수산", desc: "구장 인근 해산물 맛집. 신선한 회와 해산물" },
        ],
        tips: [
          "지하철 없음 — 버스 환승 계획 미리 세울 것 (광주 버스 앱 활용)",
          "6도 이하 음료만 반입 가능 (1인 최대 1L), 고도수 주류 반입 금지",
          "EV, K5, K8, K9 등 기아 자동차명을 딴 좌석 등급이 특징",
          "주차장 1,658대지만 인기 경기일 조기 만차 — 2시간 전 도착 권장",
        ],
        sections: [
          { name: "EV석 (외야/응원석)", desc: "열정적인 응원 구역", priceRange: "8,000~10,000원" },
          { name: "K5석 (내야 일반)", desc: "메인 관람석", priceRange: "13,000~16,000원" },
          { name: "K9석 (프리미엄 내야)", desc: "최고 시야의 프리미엄석", priceRange: "25,000~35,000원" },
        ],
        parkingInfo: "총 1,658대. 경기장 옆 주차장 + 주변 공영 주차장. 인기 경기 조기 만차 — 조기 도착 또는 대중교통 권장",
      },
      {
        id: "sg-7", teamId: "team-nc", stadiumName: "창원 NC파크",
        address: "경상남도 창원시 마산회원구 삼호로 63",
        capacity: 22000,
        transportation: [
          "마산역 하차 후 택시 또는 버스 이용 (가장 가까운 기차역)",
          "마산고속/시외버스터미널에서 하차 후 이동",
          "자가용: 남해고속도로 서마산IC → 마산종합운동장 방면 약 2.5km",
        ],
        nearbyFood: [
          { name: "스마일회관 냉삼", desc: "산호동 입소문 냉삼 전문점. NC파크 도보 5분" },
          { name: "전재경스시", desc: "불초밥 등 다양한 초밥 메뉴. 야구장 인근 인기 일식" },
          { name: "BHC 치킨 (구장 내)", desc: "닭강정과 맥주 조합이 인기" },
        ],
        tips: [
          "내야/외야 간 자유 이동 가능 — 다양한 구역에서 관람 체험",
          "NC 다이노스 앱 설치하면 실시간 주차 상황 확인 가능",
          "도보 5~10분 내 초밥, 냉삼, 곱창 등 다양한 맛집 분포",
          "경기일 무료 주차 가능 (인기 경기 시 조기 만차)",
        ],
        sections: [
          { name: "4층 내야석", desc: "가성비 좋은 관람석", priceRange: "7,000~10,000원" },
          { name: "내야석", desc: "메인 관람석", priceRange: "14,000~20,000원" },
          { name: "테이블석", desc: "편안한 테이블 관람", priceRange: "35,000~45,000원" },
        ],
        parkingInfo: "경기일 무료 주차. 인기 경기 시 조기 만차 — 2시간 전 도착 권장. 롯데마트 주차(5만원 이상 구매 시 5시간 무료)도 대안",
      },
      {
        id: "sg-8", teamId: "team-lot", stadiumName: "사직야구장",
        address: "부산광역시 동래구 사직로 45",
        capacity: 24500,
        transportation: [
          "부산 지하철 3호선 사직역 하차, 도보 약 5분",
          "버스: 54번, 57번, 83-1번 '사직실내수영장' 정류장 하차 도보 4분",
          "서면/해운대에서 택시 약 20~30분",
        ],
        nearbyFood: [
          { name: "다리집 떡볶이", desc: "부산 3대 떡볶이. 2025년 구장 내 식당가 신규 입점" },
          { name: "가온밀면", desc: "부산 대표 밀면. 쫄깃한 면발과 깊은 육수" },
          { name: "동래라거 생맥주", desc: "구장 내 부산 로컬 크래프트 맥주" },
        ],
        tips: [
          "자이언츠 앱/QR코드로 음식 주문 → 카카오톡 픽업 알림 수령",
          "KBO에서 주차 가장 어려움 — 3호선 사직역 이용 강력 추천",
          "2025년 식당가 대대적 리뉴얼 — 부산 로컬 맛집 대거 입점",
          "외야 응원석이 가장 열정적 — 부산의 뜨거운 응원 문화 체험",
        ],
        sections: [
          { name: "외야석", desc: "가성비 좋은 응원석", priceRange: "8,000~10,000원" },
          { name: "중앙 지정석", desc: "시야 좋은 메인석", priceRange: "약 17,000원" },
          { name: "에비뉴엘석 (프리미엄)", desc: "포수 뒤 최고급 관람석", priceRange: "약 150,000원" },
        ],
        parkingInfo: "약 1,200대(4개 주차장). 소형 1일 최대 5,000원/대형 15,000원. KBO 주차 최난이도 — 3시간 전 도착 또는 대중교통 필수",
      },
      {
        id: "sg-9", teamId: "team-kiw", stadiumName: "고척스카이돔",
        address: "서울특별시 구로구 경인로 430 (고척동)",
        capacity: 16744,
        transportation: [
          "1호선 구일역 2번 출구 도보 3~5분 (접근성 최고)",
          "7호선 신풍역에서도 이동 가능",
          "신도림역 1·5번 출구에서 버스 3정거장 (10개 노선)",
        ],
        nearbyFood: [
          { name: "크림새우 / 마라새우", desc: "구장 내 인기 메뉴. 바삭한 튀김에 크림/마라 소스" },
          { name: "츄러스와 아이스크림", desc: "구장 내 디저트 코너. 달콤한 간식" },
          { name: "신도림 테크노마트 푸드코트", desc: "경기 전후 다양한 식사 가능한 복합몰" },
        ],
        tips: [
          "국내 유일 돔구장 — 비·추위 걱정 없이 관람 가능",
          "여름 에어컨 강하므로 가벼운 긴팔 추천, 겨울은 내부 따뜻",
          "외부 음식 반입 가능 (6도 미만 주류 OK, 유리병 불가)",
          "구장 내 주차 사실상 불가 — 1호선 구일역 도보 3분, 대중교통 필수",
        ],
        sections: [
          { name: "3~4층 지정석", desc: "가성비 좋은 상층석", priceRange: "10,000~16,000원" },
          { name: "버건디석 (내야)", desc: "메인 관람석", priceRange: "18,000~25,000원" },
          { name: "다크버건디석 (프리미엄)", desc: "최고 시야의 프리미엄", priceRange: "20,000~28,000원" },
        ],
        parkingInfo: "공식 484대이나 경기일 내부 주차장 이용 불가. 대중교통만 이용 권장 (구일역 도보 3분)",
      },
    ];
    guides.forEach((g) => addItem(STORE_KEYS.STADIUM_GUIDES, g));
  }

  // ── Photocard Collection Seed ──────────────────────────────────────────────
  if (listItems(STORE_KEYS.PHOTOCARD_COLLECTION).length === 0) {
    const photocards: PhotocardItem[] = [
      { id: "pc-1", ownerId: "fan-1", ownerName: "트윈스드로잉", teamId: "team-lg", teamName: "LG 트윈스", playerName: "오지환", title: "오지환 수비 포토카드", imageUrl: null, frameType: "player-card", rarity: "rare", likes: 234, liked: false, createdAt: "2026-03-25", isForTrade: false },
      { id: "pc-2", ownerId: "fan-1", ownerName: "트윈스드로잉", teamId: "team-lg", teamName: "LG 트윈스", playerName: "박해민", title: "박해민 도루 포토카드", imageUrl: null, frameType: "holographic", rarity: "epic", likes: 456, liked: false, createdAt: "2026-03-24", isForTrade: true },
      { id: "pc-3", ownerId: "fan-2", ownerName: "타이거즈아트", teamId: "team-kia", teamName: "KIA 타이거즈", playerName: "김도영", title: "김도영 풀스윙 포토카드", imageUrl: null, frameType: "holographic", rarity: "legendary", likes: 789, liked: false, createdAt: "2026-03-23", isForTrade: false },
      { id: "pc-4", ownerId: "fan-3", ownerName: "다이노스작가", teamId: "team-nc", teamName: "NC 다이노스", playerName: "양의지", title: "양의지 포수 포토카드", imageUrl: null, frameType: "player-card", rarity: "rare", likes: 198, liked: false, createdAt: "2026-03-22", isForTrade: true },
      { id: "pc-5", ownerId: "fan-6", ownerName: "자이언츠크리", teamId: "team-lot", teamName: "롯데 자이언츠", playerName: "전준우", title: "전준우 사직 포토카드", imageUrl: null, frameType: "vintage", rarity: "rare", likes: 345, liked: false, createdAt: "2026-03-21", isForTrade: false },
      { id: "pc-6", ownerId: "fan-4", ownerName: "랜더스그림", teamId: "team-ssg", teamName: "SSG 랜더스", playerName: "최정", title: "최정 500홈런 기념 포토카드", imageUrl: null, frameType: "holographic", rarity: "legendary", likes: 1023, liked: false, createdAt: "2026-03-20", isForTrade: false },
      { id: "pc-7", ownerId: "fan-5", ownerName: "베어스팬아트", teamId: "team-doo", teamName: "두산 베어스", playerName: "김재환", title: "김재환 홈런 포토카드", imageUrl: null, frameType: "neon", rarity: "epic", likes: 567, liked: false, createdAt: "2026-03-19", isForTrade: true },
      { id: "pc-8", ownerId: "fan-7", ownerName: "라이온즈아트", teamId: "team-sam", teamName: "삼성 라이온즈", playerName: "구자욱", title: "구자욱 안타왕 포토카드", imageUrl: null, frameType: "player-card", rarity: "rare", likes: 234, liked: false, createdAt: "2026-03-18", isForTrade: true },
      { id: "pc-9", ownerId: "fan-8", ownerName: "이글스작가", teamId: "team-han", teamName: "한화 이글스", playerName: "문동주", title: "문동주 투구 포토카드", imageUrl: null, frameType: "basic", rarity: "common", likes: 123, liked: false, createdAt: "2026-03-17", isForTrade: false },
      { id: "pc-10", ownerId: "fan-10", ownerName: "위즈아트", teamId: "team-kt", teamName: "KT 위즈", playerName: "강백호", title: "강백호 4번타자 포토카드", imageUrl: null, frameType: "holographic", rarity: "epic", likes: 678, liked: false, createdAt: "2026-03-16", isForTrade: false },
      { id: "pc-11", ownerId: "fan-11", ownerName: "히어로즈그림", teamId: "team-kiw", teamName: "키움 히어로즈", playerName: "이정후", title: "이정후 안타 포토카드", imageUrl: null, frameType: "polaroid", rarity: "rare", likes: 445, liked: false, createdAt: "2026-03-15", isForTrade: true },
      { id: "pc-12", ownerId: "fan-9", ownerName: "KBO작가", teamId: "team-kia", teamName: "KIA 타이거즈", playerName: "양현종", title: "양현종 에이스 포토카드", imageUrl: null, frameType: "vintage", rarity: "epic", likes: 567, liked: false, createdAt: "2026-03-14", isForTrade: false },
      { id: "pc-13", ownerId: "fan-12", ownerName: "임찬규팬", teamId: "team-lg", teamName: "LG 트윈스", playerName: "임찬규", title: "임찬규 삼진왕 포토카드", imageUrl: null, frameType: "neon", rarity: "legendary", likes: 892, liked: false, createdAt: "2026-03-13", isForTrade: false },
      { id: "pc-14", ownerId: "me", ownerName: "나", teamId: "team-lg", teamName: "LG 트윈스", playerName: "오스틴", title: "오스틴 홈런 포토카드", imageUrl: null, frameType: "player-card", rarity: "rare", likes: 45, liked: false, createdAt: "2026-03-26", isForTrade: false },
      { id: "pc-15", ownerId: "me", ownerName: "나", teamId: "team-lg", teamName: "LG 트윈스", playerName: "박동원", title: "박동원 포수 포토카드", imageUrl: null, frameType: "basic", rarity: "common", likes: 23, liked: false, createdAt: "2026-03-25", isForTrade: true },
    ];
    photocards.forEach((p) => addItem(STORE_KEYS.PHOTOCARD_COLLECTION, p));
  }

  // ── Goods Trades Seed ──────────────────────────────────────────────────────
  if (listItems(STORE_KEYS.GOODS_TRADES).length === 0) {
    const trades: GoodsTrade[] = [
      { id: "gt-1", sellerId: "fan-1", sellerName: "트윈스드로잉", sellerAvatar: "TD", teamId: "team-lg", teamName: "LG 트윈스", itemName: "LG 트윈스 2026 홈 유니폼 (M)", category: "uniform", description: "새 시즌 홈 유니폼입니다. 미개봉 새상품!", condition: "new", tradeType: "sell", price: 85000, imageUrl: null, status: "active", likes: 23, createdAt: "2026-03-26" },
      { id: "gt-2", sellerId: "fan-2", sellerName: "타이거즈아트", sellerAvatar: "TA", teamId: "team-kia", teamName: "KIA 타이거즈", itemName: "김도영 사인볼", category: "other", description: "김도영 선수 직접 사인! 정품 인증서 포함", condition: "new", tradeType: "sell", price: 150000, imageUrl: null, status: "active", likes: 45, createdAt: "2026-03-25" },
      { id: "gt-3", sellerId: "fan-6", sellerName: "자이언츠크리", sellerAvatar: "GC", teamId: "team-lot", teamName: "롯데 자이언츠", itemName: "롯데 응원 타올 (한정판)", category: "towel", description: "2025 시즌 한정판 응원 타올. 상태 좋습니다!", condition: "likeNew", tradeType: "trade", wantedItem: "LG 트윈스 관련 굿즈", imageUrl: null, status: "active", likes: 12, createdAt: "2026-03-24" },
      { id: "gt-4", sellerId: "fan-5", sellerName: "베어스팬아트", sellerAvatar: "BA", teamId: "team-doo", teamName: "두산 베어스", itemName: "두산 베어스 모자", category: "cap", description: "거의 안 쓴 두산 공식 모자입니다", condition: "likeNew", tradeType: "sell", price: 25000, imageUrl: null, status: "active", likes: 8, createdAt: "2026-03-23" },
      { id: "gt-5", sellerId: "fan-4", sellerName: "랜더스그림", sellerAvatar: "RG", teamId: "team-ssg", teamName: "SSG 랜더스", itemName: "SSG 랜더스 키링 세트", category: "keyring", description: "선수 캐릭터 키링 5개 세트! 나눔합니다~", condition: "new", tradeType: "giveaway", imageUrl: null, status: "active", likes: 67, createdAt: "2026-03-22" },
      { id: "gt-6", sellerId: "fan-3", sellerName: "다이노스작가", sellerAvatar: "DJ", teamId: "team-nc", teamName: "NC 다이노스", itemName: "NC 다이노스 포토카드 세트", category: "photocard", description: "2025 시즌 포토카드 풀세트 (10장)", condition: "good", tradeType: "trade", wantedItem: "삼성 라이온즈 포토카드", imageUrl: null, status: "active", likes: 34, createdAt: "2026-03-21" },
      { id: "gt-7", sellerId: "fan-7", sellerName: "라이온즈아트", sellerAvatar: "LA", teamId: "team-sam", teamName: "삼성 라이온즈", itemName: "삼성 라이온즈 응원봉", category: "other", description: "공식 응원봉입니다. 배터리 포함!", condition: "good", tradeType: "sell", price: 15000, imageUrl: null, status: "active", likes: 11, createdAt: "2026-03-20" },
      { id: "gt-8", sellerId: "fan-8", sellerName: "이글스작가", sellerAvatar: "EW", teamId: "team-han", teamName: "한화 이글스", itemName: "한화 이글스 유니폼 (L)", category: "uniform", description: "한화 어웨이 유니폼입니다. 상태 양호!", condition: "good", tradeType: "sell", price: 45000, imageUrl: null, status: "active", likes: 9, createdAt: "2026-03-19" },
      { id: "gt-9", sellerId: "fan-10", sellerName: "위즈아트", sellerAvatar: "WA", teamId: "team-kt", teamName: "KT 위즈", itemName: "강백호 포토카드", category: "photocard", description: "강백호 선수 한정판 포토카드 3장", condition: "new", tradeType: "trade", wantedItem: "KIA 타이거즈 포토카드", imageUrl: null, status: "active", likes: 28, createdAt: "2026-03-18" },
      { id: "gt-10", sellerId: "fan-11", sellerName: "히어로즈그림", sellerAvatar: "HG", teamId: "team-kiw", teamName: "키움 히어로즈", itemName: "키움 히어로즈 응원 타올", category: "towel", description: "고척돔 한정판 응원 타올 나눔!", condition: "likeNew", tradeType: "giveaway", imageUrl: null, status: "active", likes: 43, createdAt: "2026-03-17" },
    ];
    trades.forEach((t) => addItem(STORE_KEYS.GOODS_TRADES, t));
  }

  localStorage.setItem(STORE_KEYS.SEED_VERSION, String(SEED_VERSION));
}
