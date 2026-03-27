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
  FANDOM_FEED: "olli-fandom-feed",
  FANDOM_COMMENTS: "olli-fandom-comments",
  FANDOM_EVENTS: "olli-fandom-events",
  // Fan Social
  FAN_CREATORS: "olli-fandom-creators",
  FAN_FOLLOWS: "olli-fandom-follows",
  FAN_DMS: "olli-fandom-dms",
  FAN_TALK_POSTS: "olli-fandom-talk",
  // Fandom Editor Content
  EDITOR_PLAYER_PROFILES: "olli-editor-idol-profiles",
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
      // 3/27 (어제, 종료)
      { id: "game-6", homeTeamId: "team-kia", awayTeamId: "team-lg", homeTeamName: "KIA 타이거즈", awayTeamName: "LG 트윈스", date: "2026-03-27", time: "18:30", stadium: "광주-기아챔피언스필드", status: "finished", homeScore: 5, awayScore: 3 },
      { id: "game-7", homeTeamId: "team-doo", awayTeamId: "team-ssg", homeTeamName: "두산 베어스", awayTeamName: "SSG 랜더스", date: "2026-03-27", time: "18:30", stadium: "잠실야구장", status: "finished", homeScore: 2, awayScore: 7 },
      { id: "game-8", homeTeamId: "team-nc", awayTeamId: "team-han", homeTeamName: "NC 다이노스", awayTeamName: "한화 이글스", date: "2026-03-27", time: "18:30", stadium: "창원NC파크", status: "finished", homeScore: 4, awayScore: 4 },
      { id: "game-9", homeTeamId: "team-sam", awayTeamId: "team-kt", homeTeamName: "삼성 라이온즈", awayTeamName: "KT 위즈", date: "2026-03-27", time: "18:30", stadium: "대구삼성라이온즈파크", status: "finished", homeScore: 6, awayScore: 1 },
      { id: "game-10", homeTeamId: "team-kiw", awayTeamId: "team-lot", homeTeamName: "키움 히어로즈", awayTeamName: "롯데 자이언츠", date: "2026-03-27", time: "18:30", stadium: "고척스카이돔", status: "finished", homeScore: 3, awayScore: 5 },
      // 3/28 (오늘 개막일)
      { id: "game-1", homeTeamId: "team-lg", awayTeamId: "team-doo", homeTeamName: "LG 트윈스", awayTeamName: "두산 베어스", date: "2026-03-28", time: "18:30", stadium: "잠실야구장", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-2", homeTeamId: "team-kt", awayTeamId: "team-nc", homeTeamName: "KT 위즈", awayTeamName: "NC 다이노스", date: "2026-03-28", time: "18:30", stadium: "수원KT위즈파크", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-3", homeTeamId: "team-ssg", awayTeamId: "team-kia", homeTeamName: "SSG 랜더스", awayTeamName: "KIA 타이거즈", date: "2026-03-28", time: "18:30", stadium: "인천SSG랜더스필드", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-4", homeTeamId: "team-lot", awayTeamId: "team-sam", homeTeamName: "롯데 자이언츠", awayTeamName: "삼성 라이온즈", date: "2026-03-28", time: "18:30", stadium: "사직야구장", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-5", homeTeamId: "team-han", awayTeamId: "team-kiw", homeTeamName: "한화 이글스", awayTeamName: "키움 히어로즈", date: "2026-03-28", time: "18:30", stadium: "한화생명이글스파크", status: "scheduled", homeScore: null, awayScore: null },
      // 3/29
      { id: "game-11", homeTeamId: "team-lg", awayTeamId: "team-kia", homeTeamName: "LG 트윈스", awayTeamName: "KIA 타이거즈", date: "2026-03-29", time: "14:00", stadium: "잠실야구장", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-12", homeTeamId: "team-ssg", awayTeamId: "team-doo", homeTeamName: "SSG 랜더스", awayTeamName: "두산 베어스", date: "2026-03-29", time: "14:00", stadium: "인천SSG랜더스필드", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-13", homeTeamId: "team-han", awayTeamId: "team-nc", homeTeamName: "한화 이글스", awayTeamName: "NC 다이노스", date: "2026-03-29", time: "14:00", stadium: "한화생명이글스파크", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-14", homeTeamId: "team-kt", awayTeamId: "team-sam", homeTeamName: "KT 위즈", awayTeamName: "삼성 라이온즈", date: "2026-03-29", time: "14:00", stadium: "수원KT위즈파크", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-15", homeTeamId: "team-lot", awayTeamId: "team-kiw", homeTeamName: "롯데 자이언츠", awayTeamName: "키움 히어로즈", date: "2026-03-29", time: "14:00", stadium: "사직야구장", status: "scheduled", homeScore: null, awayScore: null },
      // 3/30
      { id: "game-16", homeTeamId: "team-doo", awayTeamId: "team-kt", homeTeamName: "두산 베어스", awayTeamName: "KT 위즈", date: "2026-03-30", time: "14:00", stadium: "잠실야구장", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-17", homeTeamId: "team-kia", awayTeamId: "team-lot", homeTeamName: "KIA 타이거즈", awayTeamName: "롯데 자이언츠", date: "2026-03-30", time: "14:00", stadium: "광주-기아챔피언스필드", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-18", homeTeamId: "team-nc", awayTeamId: "team-kiw", homeTeamName: "NC 다이노스", awayTeamName: "키움 히어로즈", date: "2026-03-30", time: "14:00", stadium: "창원NC파크", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-51", homeTeamId: "team-ssg", awayTeamId: "team-lg", homeTeamName: "SSG 랜더스", awayTeamName: "LG 트윈스", date: "2026-03-30", time: "14:00", stadium: "인천SSG랜더스필드", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-52", homeTeamId: "team-sam", awayTeamId: "team-han", homeTeamName: "삼성 라이온즈", awayTeamName: "한화 이글스", date: "2026-03-30", time: "14:00", stadium: "대구삼성라이온즈파크", status: "scheduled", homeScore: null, awayScore: null },
      // 3/31
      { id: "game-19", homeTeamId: "team-sam", awayTeamId: "team-han", homeTeamName: "삼성 라이온즈", awayTeamName: "한화 이글스", date: "2026-03-31", time: "18:30", stadium: "대구삼성라이온즈파크", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-20", homeTeamId: "team-kiw", awayTeamId: "team-ssg", homeTeamName: "키움 히어로즈", awayTeamName: "SSG 랜더스", date: "2026-03-31", time: "18:30", stadium: "고척스카이돔", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-53", homeTeamId: "team-lg", awayTeamId: "team-nc", homeTeamName: "LG 트윈스", awayTeamName: "NC 다이노스", date: "2026-03-31", time: "18:30", stadium: "잠실야구장", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-54", homeTeamId: "team-doo", awayTeamId: "team-kia", homeTeamName: "두산 베어스", awayTeamName: "KIA 타이거즈", date: "2026-03-31", time: "18:30", stadium: "잠실야구장", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-55", homeTeamId: "team-lot", awayTeamId: "team-kt", homeTeamName: "롯데 자이언츠", awayTeamName: "KT 위즈", date: "2026-03-31", time: "18:30", stadium: "사직야구장", status: "scheduled", homeScore: null, awayScore: null },
      // 4/1
      { id: "game-21", homeTeamId: "team-lg", awayTeamId: "team-sam", homeTeamName: "LG 트윈스", awayTeamName: "삼성 라이온즈", date: "2026-04-01", time: "18:30", stadium: "잠실야구장", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-22", homeTeamId: "team-kia", awayTeamId: "team-ssg", homeTeamName: "KIA 타이거즈", awayTeamName: "SSG 랜더스", date: "2026-04-01", time: "18:30", stadium: "광주-기아챔피언스필드", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-23", homeTeamId: "team-doo", awayTeamId: "team-nc", homeTeamName: "두산 베어스", awayTeamName: "NC 다이노스", date: "2026-04-01", time: "18:30", stadium: "잠실야구장", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-24", homeTeamId: "team-han", awayTeamId: "team-lot", homeTeamName: "한화 이글스", awayTeamName: "롯데 자이언츠", date: "2026-04-01", time: "18:30", stadium: "한화생명이글스파크", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-25", homeTeamId: "team-kiw", awayTeamId: "team-kt", homeTeamName: "키움 히어로즈", awayTeamName: "KT 위즈", date: "2026-04-01", time: "18:30", stadium: "고척스카이돔", status: "scheduled", homeScore: null, awayScore: null },
      // 4/2
      { id: "game-26", homeTeamId: "team-sam", awayTeamId: "team-lg", homeTeamName: "삼성 라이온즈", awayTeamName: "LG 트윈스", date: "2026-04-02", time: "18:30", stadium: "대구삼성라이온즈파크", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-27", homeTeamId: "team-ssg", awayTeamId: "team-kia", homeTeamName: "SSG 랜더스", awayTeamName: "KIA 타이거즈", date: "2026-04-02", time: "18:30", stadium: "인천SSG랜더스필드", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-28", homeTeamId: "team-nc", awayTeamId: "team-doo", homeTeamName: "NC 다이노스", awayTeamName: "두산 베어스", date: "2026-04-02", time: "18:30", stadium: "창원NC파크", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-29", homeTeamId: "team-lot", awayTeamId: "team-han", homeTeamName: "롯데 자이언츠", awayTeamName: "한화 이글스", date: "2026-04-02", time: "18:30", stadium: "사직야구장", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-30", homeTeamId: "team-kt", awayTeamId: "team-kiw", homeTeamName: "KT 위즈", awayTeamName: "키움 히어로즈", date: "2026-04-02", time: "18:30", stadium: "수원KT위즈파크", status: "scheduled", homeScore: null, awayScore: null },
      // 4/3
      { id: "game-31", homeTeamId: "team-sam", awayTeamId: "team-lg", homeTeamName: "삼성 라이온즈", awayTeamName: "LG 트윈스", date: "2026-04-03", time: "18:30", stadium: "대구삼성라이온즈파크", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-32", homeTeamId: "team-ssg", awayTeamId: "team-kia", homeTeamName: "SSG 랜더스", awayTeamName: "KIA 타이거즈", date: "2026-04-03", time: "18:30", stadium: "인천SSG랜더스필드", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-33", homeTeamId: "team-nc", awayTeamId: "team-doo", homeTeamName: "NC 다이노스", awayTeamName: "두산 베어스", date: "2026-04-03", time: "18:30", stadium: "창원NC파크", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-34", homeTeamId: "team-lot", awayTeamId: "team-han", homeTeamName: "롯데 자이언츠", awayTeamName: "한화 이글스", date: "2026-04-03", time: "18:30", stadium: "사직야구장", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-35", homeTeamId: "team-kt", awayTeamId: "team-kiw", homeTeamName: "KT 위즈", awayTeamName: "키움 히어로즈", date: "2026-04-03", time: "18:30", stadium: "수원KT위즈파크", status: "scheduled", homeScore: null, awayScore: null },
      // 4/4-4/5 (주말)
      { id: "game-36", homeTeamId: "team-kia", awayTeamId: "team-doo", homeTeamName: "KIA 타이거즈", awayTeamName: "두산 베어스", date: "2026-04-04", time: "14:00", stadium: "광주-기아챔피언스필드", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-37", homeTeamId: "team-lg", awayTeamId: "team-lot", homeTeamName: "LG 트윈스", awayTeamName: "롯데 자이언츠", date: "2026-04-04", time: "14:00", stadium: "잠실야구장", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-38", homeTeamId: "team-han", awayTeamId: "team-kt", homeTeamName: "한화 이글스", awayTeamName: "KT 위즈", date: "2026-04-04", time: "14:00", stadium: "한화생명이글스파크", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-39", homeTeamId: "team-kiw", awayTeamId: "team-nc", homeTeamName: "키움 히어로즈", awayTeamName: "NC 다이노스", date: "2026-04-04", time: "14:00", stadium: "고척스카이돔", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-40", homeTeamId: "team-sam", awayTeamId: "team-ssg", homeTeamName: "삼성 라이온즈", awayTeamName: "SSG 랜더스", date: "2026-04-04", time: "14:00", stadium: "대구삼성라이온즈파크", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-41", homeTeamId: "team-kia", awayTeamId: "team-doo", homeTeamName: "KIA 타이거즈", awayTeamName: "두산 베어스", date: "2026-04-05", time: "14:00", stadium: "광주-기아챔피언스필드", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-42", homeTeamId: "team-lg", awayTeamId: "team-lot", homeTeamName: "LG 트윈스", awayTeamName: "롯데 자이언츠", date: "2026-04-05", time: "14:00", stadium: "잠실야구장", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-43", homeTeamId: "team-han", awayTeamId: "team-kt", homeTeamName: "한화 이글스", awayTeamName: "KT 위즈", date: "2026-04-05", time: "14:00", stadium: "한화생명이글스파크", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-44", homeTeamId: "team-kiw", awayTeamId: "team-nc", homeTeamName: "키움 히어로즈", awayTeamName: "NC 다이노스", date: "2026-04-05", time: "14:00", stadium: "고척스카이돔", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-45", homeTeamId: "team-sam", awayTeamId: "team-ssg", homeTeamName: "삼성 라이온즈", awayTeamName: "SSG 랜더스", date: "2026-04-05", time: "14:00", stadium: "대구삼성라이온즈파크", status: "scheduled", homeScore: null, awayScore: null },
      // 4/7-4/8
      { id: "game-46", homeTeamId: "team-doo", awayTeamId: "team-sam", homeTeamName: "두산 베어스", awayTeamName: "삼성 라이온즈", date: "2026-04-07", time: "18:30", stadium: "잠실야구장", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-47", homeTeamId: "team-lot", awayTeamId: "team-ssg", homeTeamName: "롯데 자이언츠", awayTeamName: "SSG 랜더스", date: "2026-04-07", time: "18:30", stadium: "사직야구장", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-48", homeTeamId: "team-kt", awayTeamId: "team-kia", homeTeamName: "KT 위즈", awayTeamName: "KIA 타이거즈", date: "2026-04-07", time: "18:30", stadium: "수원KT위즈파크", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-49", homeTeamId: "team-nc", awayTeamId: "team-lg", homeTeamName: "NC 다이노스", awayTeamName: "LG 트윈스", date: "2026-04-07", time: "18:30", stadium: "창원NC파크", status: "scheduled", homeScore: null, awayScore: null },
      { id: "game-50", homeTeamId: "team-kiw", awayTeamId: "team-han", homeTeamName: "키움 히어로즈", awayTeamName: "한화 이글스", date: "2026-04-07", time: "18:30", stadium: "고척스카이돔", status: "scheduled", homeScore: null, awayScore: null },
    ];
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

  // ── Cheer Songs Seed ───────────────────────────────────────────────────────
  if (listItems(STORE_KEYS.CHEER_SONGS).length === 0) {
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
      { id: "sg-1", teamId: "team-lg", stadiumName: "잠실야구장", address: "서울특별시 송파구 올림픽로 25", capacity: 25000, transportation: ["2호선 종합운동장역 5번 출구 도보 5분", "9호선 종합운동장역 5번 출구", "버스 302, 3217 종합운동장 하차"], nearbyFood: [{ name: "잠실 먹자골목", desc: "경기장 주변 다양한 음식점 밀집" }, { name: "롯데월드몰", desc: "경기 전후 쇼핑 및 식사 가능" }, { name: "석촌호수 카페거리", desc: "경기 전 여유롭게 카페 이용" }], tips: ["3루석(LG)이 햇빛 덜 받아요 (저녁 경기 기준)", "치킨+맥주 반입 가능 (캔 불가, 컵으로 옮겨야 함)", "잠실 나루역에서 걸어오면 덜 붐벼요", "우천시 지붕 없으니 우비 필수"], sections: [{ name: "1루 내야석", desc: "두산 베어스 응원석", priceRange: "15,000~25,000원" }, { name: "3루 내야석", desc: "LG 트윈스 응원석", priceRange: "15,000~25,000원" }, { name: "외야석", desc: "저렴하고 자유로운 분위기", priceRange: "8,000~12,000원" }, { name: "중앙지정석", desc: "가장 좋은 시야", priceRange: "25,000~40,000원" }], parkingInfo: "잠실종합운동장 주차장 (2,000대 수용, 5,000원)" },
      { id: "sg-2", teamId: "team-kt", stadiumName: "수원KT위즈파크", address: "경기도 수원시 장안구 경수대로 893", capacity: 20000, transportation: ["수원역에서 버스 13, 36 이용 (약 15분)", "수원월드컵경기장역 도보 10분", "경기장 셔틀버스 운행 (경기일)"], nearbyFood: [{ name: "수원 통닭거리", desc: "경기 전 수원 명물 통닭!" }, { name: "행궁동 카페거리", desc: "예쁜 카페가 많은 거리" }], tips: ["신축 구장이라 시설 최고!", "1루석 뒤 '위즈 키친' 푸드코트 추천", "구장 내 편의시설 잘 되어 있음"], sections: [{ name: "1루 내야석", desc: "KT 위즈 응원석", priceRange: "15,000~22,000원" }, { name: "3루 내야석", desc: "원정팀 응원석", priceRange: "15,000~22,000원" }, { name: "테이블석", desc: "단체 관람에 좋은 테이블 좌석", priceRange: "30,000~50,000원" }], parkingInfo: "경기장 주차장 (1,500대 수용, 3,000원)" },
      { id: "sg-3", teamId: "team-ssg", stadiumName: "인천SSG랜더스필드", address: "인천광역시 미추홀구 매소홀로 618", capacity: 23000, transportation: ["1호선 문학경기장역 1번 출구 도보 10분", "인천지하철 문학경기장역", "경기일 셔틀버스 운행"], nearbyFood: [{ name: "랜더스필드 푸드존", desc: "구장 내 다양한 먹거리" }, { name: "문학동 음식점", desc: "경기장 주변 맛집" }], tips: ["인천 바닷바람 때문에 저녁엔 추울 수 있어요", "랜더스필드 내 쇼핑존에서 굿즈 구매 가능", "주차장이 넓어 자차 이용 편리"], sections: [{ name: "1루 내야석", desc: "SSG 랜더스 응원석", priceRange: "15,000~25,000원" }, { name: "프리미엄석", desc: "VIP 좌석", priceRange: "40,000~80,000원" }], parkingInfo: "경기장 전용 주차장 (2,000대, 5,000원)" },
      { id: "sg-4", teamId: "team-nc", stadiumName: "창원NC파크", address: "경상남도 창원시 마산회원구 삼호로 63", capacity: 22000, transportation: ["마산역에서 택시 10분", "창원중앙역에서 버스 이용 가능", "경기일 셔틀버스 운행"], nearbyFood: [{ name: "마산 어시장", desc: "신선한 해산물 맛집 밀집" }, { name: "아구찜 골목", desc: "마산 명물 아구찜!" }], tips: ["NC파크 잔디광장에서 피크닉 가능", "구장 시설이 깨끗하고 쾌적", "바다 바람이 불어 선선함"], sections: [{ name: "1루 내야석", desc: "NC 다이노스 응원석", priceRange: "13,000~20,000원" }, { name: "잔디석", desc: "피크닉 분위기의 좌석", priceRange: "10,000~15,000원" }], parkingInfo: "경기장 주차장 (1,200대, 3,000원)" },
      { id: "sg-5", teamId: "team-kia", stadiumName: "광주-기아챔피언스필드", address: "광주광역시 북구 서림로 10", capacity: 20500, transportation: ["광주송정역에서 버스 또는 택시 20분", "문화전당역에서 버스 이용", "경기일 셔틀버스 운행"], nearbyFood: [{ name: "충장로 먹자골목", desc: "광주 대표 먹자골목" }, { name: "무등산 보리밥", desc: "경기 전 든든한 한끼" }], tips: ["광주의 열정적인 응원 문화가 인상적!", "3루석 응원이 매우 뜨거움", "챔필 먹거리 종류가 다양함"], sections: [{ name: "1루 내야석", desc: "KIA 타이거즈 응원석", priceRange: "13,000~22,000원" }, { name: "외야 그린석", desc: "잔디 위 피크닉 관람", priceRange: "8,000~12,000원" }], parkingInfo: "경기장 주변 주차장 (800대, 3,000원)" },
      { id: "sg-6", teamId: "team-lot", stadiumName: "사직야구장", address: "부산광역시 동래구 사직로 45", capacity: 24000, transportation: ["3호선 사직역 1번 출구 도보 5분", "부산역에서 지하철 환승 약 30분", "경기일 주변 교통 혼잡 주의"], nearbyFood: [{ name: "사직 먹자골목", desc: "치킨, 족발 등 야식 천국" }, { name: "온천장 음식점", desc: "경기 전후 식사 가능" }], tips: ["사직 응원 문화는 KBO 최고!", "비닐봉지 응원은 필수 체험", "부산 특유의 뜨거운 분위기", "여름엔 매우 덥습니다 - 선크림 필수"], sections: [{ name: "1루 내야석", desc: "롯데 자이언츠 응원석", priceRange: "14,000~23,000원" }, { name: "외야석", desc: "가성비 좋은 자유석", priceRange: "7,000~10,000원" }], parkingInfo: "사직야구장 주차장 (1,000대, 3,000원)" },
      { id: "sg-7", teamId: "team-sam", stadiumName: "대구삼성라이온즈파크", address: "대구광역시 수성구 야구전로 1", capacity: 24000, transportation: ["대구지하철 대공원역 3번 출구 도보 10분", "동대구역에서 택시 15분", "경기일 셔틀버스 운행"], nearbyFood: [{ name: "수성못 맛집거리", desc: "경기장 근처 다양한 음식점" }, { name: "대구 막창골목", desc: "대구 명물 막창!" }], tips: ["라이온즈파크 시설이 매우 좋음", "파크 내 아이들 놀이시설 있음", "주말 경기는 일찍 가서 자리 잡기"], sections: [{ name: "1루 내야석", desc: "삼성 라이온즈 응원석", priceRange: "14,000~24,000원" }, { name: "스카이박스", desc: "프리미엄 관람", priceRange: "50,000~100,000원" }], parkingInfo: "경기장 주차장 (2,000대, 4,000원)" },
      { id: "sg-8", teamId: "team-kiw", stadiumName: "고척스카이돔", address: "서울특별시 구로구 경인로 430", capacity: 16744, transportation: ["7호선 신풍역 1번 출구 도보 10분", "구일역에서 도보 15분", "1호선 구로역에서 마을버스"], nearbyFood: [{ name: "구로디지털단지 맛집", desc: "경기장 근처 다양한 음식점" }, { name: "신도림 테크노마트", desc: "식당가 이용 가능" }], tips: ["국내 유일 돔구장! 비와도 관람 가능", "돔 내부라 소리가 웅장함", "에어컨 완비 - 여름에 쾌적", "좌석 간격이 넓어 편안함"], sections: [{ name: "1루 내야석", desc: "키움 히어로즈 응원석", priceRange: "15,000~25,000원" }, { name: "외야석", desc: "경제적인 관람석", priceRange: "8,000~12,000원" }], parkingInfo: "고척돔 주차장 (500대, 5,000원) - 대중교통 권장" },
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
}
