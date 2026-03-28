// KBO 2026 시즌 중계 채널 매핑 (홈 구장 기준)

export interface KboBroadcastInfo {
  tv: string[];
  radio: string[];
}

const KBO_BROADCAST_MAP: Record<string, KboBroadcastInfo> = {
  "team-lg":  { tv: ["SPOTV", "MBC Sports+"], radio: ["MBC FM"] },
  "team-kt":  { tv: ["SPOTV", "KBS N Sports"], radio: ["KBS 라디오"] },
  "team-ssg": { tv: ["SPOTV", "SBS Sports"], radio: ["SBS 러브FM"] },
  "team-kia": { tv: ["SPOTV", "KBS N Sports"], radio: ["KBS 라디오"] },
  "team-doo": { tv: ["SPOTV", "MBC Sports+"], radio: ["MBC FM"] },
  "team-nc":  { tv: ["SPOTV", "KBS N Sports"], radio: ["KBS 라디오"] },
  "team-lot": { tv: ["SPOTV", "SBS Sports"], radio: ["부산 MBC"] },
  "team-sam": { tv: ["SPOTV", "SBS Sports"], radio: ["대구 MBC"] },
  "team-han": { tv: ["SPOTV", "MBC Sports+"], radio: ["대전 MBC"] },
  "team-kiw": { tv: ["SPOTV", "SPOTV2"], radio: ["SBS 라디오"] },
};

export function getBroadcastForGame(homeTeamId: string): KboBroadcastInfo {
  return KBO_BROADCAST_MAP[homeTeamId] || { tv: ["SPOTV"], radio: ["KBS 라디오"] };
}
