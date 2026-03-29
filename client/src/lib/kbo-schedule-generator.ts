import type { KboGameSchedule } from "./local-store";

/**
 * 2026 KBO 정규시즌 전체 일정 생성기 (하이브리드 방식)
 * - 개막: 3/28(토) 2연전 (KBO 공식 대진 반영)
 * - Series 1~9 (3/31~4/30): 실제 검증된 대진표 하드코딩 (나무위키/KBO 공식)
 * - 5/1 이후 ~ 10/4: 라운드로빈 폴백 (실제 데이터 확보 시 교체 예정)
 * - 올스타 브레이크: 7/10~15
 * - 주말(토/일) 14:00, 평일 18:30
 * - 월요일 휴식
 * - 팀당 ~144경기, 총 ~720경기
 */
export function generateKbo2026Schedule(): KboGameSchedule[] {
  const TEAMS = [
    { id: "team-lg",  name: "LG 트윈스",      stadium: "잠실야구장" },
    { id: "team-kt",  name: "KT 위즈",        stadium: "수원 KT위즈파크" },
    { id: "team-ssg", name: "SSG 랜더스",      stadium: "인천 SSG랜더스필드" },
    { id: "team-nc",  name: "NC 다이노스",     stadium: "창원 NC파크" },
    { id: "team-doo", name: "두산 베어스",     stadium: "잠실야구장" },
    { id: "team-kia", name: "KIA 타이거즈",    stadium: "광주 기아챔피언스필드" },
    { id: "team-lot", name: "롯데 자이언츠",    stadium: "사직야구장" },
    { id: "team-sam", name: "삼성 라이온즈",    stadium: "대구 삼성라이온즈파크" },
    { id: "team-han", name: "한화 이글스",     stadium: "대전 한화생명볼파크" },
    { id: "team-kiw", name: "키움 히어로즈",    stadium: "고척스카이돔" },
  ];

  const ids = TEAMS.map(t => t.id);
  const nameOf = (id: string) => TEAMS.find(t => t.id === id)!.name;
  const stadiumOf = (id: string) => TEAMS.find(t => t.id === id)!.stadium;

  // ── 실제 KBO 2026 대진표 (나무위키/KBO 공식 검증) ──────────────────
  // 하이브리드 방식: Series 1~9 (3/31~4/30) 실제 대진, 이후는 라운드로빈 폴백
  // 인덱스: 0=LG, 1=KT, 2=SSG, 3=NC, 4=두산, 5=KIA, 6=롯데, 7=삼성, 8=한화, 9=키움
  type SeriesEntry = { start: [number, number, number]; matchups: [number, number][] };
  const REAL_SERIES: SeriesEntry[] = [
    // Series 1 (3/31-4/2)
    { start: [2026, 2, 31], matchups: [[0,5],[8,1],[2,9],[7,4],[3,6]] },
    // Series 2 (4/3-4/5)
    { start: [2026, 3, 3],  matchups: [[9,0],[1,7],[5,3],[6,2],[4,8]] },
    // Series 3 (4/7-4/9)
    { start: [2026, 3, 7],  matchups: [[0,2],[1,3],[8,6],[7,9],[4,5]] },
    // Series 4 (4/10-4/12)
    { start: [2026, 3, 10], matchups: [[2,4],[3,8],[5,0],[6,1],[9,7]] },
    // Series 5 (4/14-4/16)
    { start: [2026, 3, 14], matchups: [[0,6],[1,8],[2,3],[7,5],[4,9]] },
    // Series 6 (4/17-4/19)
    { start: [2026, 3, 17], matchups: [[8,0],[3,4],[5,2],[6,7],[9,1]] },
    // Series 7 (4/21-4/23)
    { start: [2026, 3, 21], matchups: [[0,3],[1,5],[2,7],[8,9],[4,6]] },
    // Series 8 (4/24-4/26)
    { start: [2026, 3, 24], matchups: [[3,2],[5,8],[6,0],[7,1],[9,4]] },
    // Series 9 (4/28-4/30)
    { start: [2026, 3, 28], matchups: [[0,9],[1,4],[2,8],[5,6],[3,7]] },
  ];

  // ── Round-robin 폴백 (5/1 이후): circle method 9 rounds × 5 pairs ──
  const n = ids.length;
  const rrRounds: [number, number][][] = [];
  for (let r = 0; r < n - 1; r++) {
    const arr = [0];
    for (let i = 0; i < n - 1; i++) arr.push(1 + ((i + r) % (n - 1)));
    const round: [number, number][] = [];
    for (let i = 0; i < n / 2; i++) round.push([arr[i], arr[n - 1 - i]]);
    rrRounds.push(round);
  }

  // ── Helpers ───────────────────────────────────────────────────────────
  const games: KboGameSchedule[] = [];
  let gid = 1;

  function fmt(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function addGame(date: string, time: string, homeIdx: number, awayIdx: number) {
    games.push({
      id: `game-${gid++}`,
      homeTeamId: ids[homeIdx],
      awayTeamId: ids[awayIdx],
      homeTeamName: nameOf(ids[homeIdx]),
      awayTeamName: nameOf(ids[awayIdx]),
      date,
      time,
      stadium: stadiumOf(ids[homeIdx]),
      status: "scheduled",
      homeScore: null,
      awayScore: null,
    });
  }

  // ── 1) 개막 2연전: 3/28-29 (토-일) 14:00 ─────────────────────────────
  // KBO 공식 대진: 잠실(KT→LG), 인천(KIA→SSG), 대전(키움→한화), 대구(롯데→삼성), 창원(두산→NC)
  const opening: [number, number][] = [
    [0, 1], // LG(홈) vs KT(원정)
    [2, 5], // SSG(홈) vs KIA(원정)
    [8, 9], // 한화(홈) vs 키움(원정)
    [7, 6], // 삼성(홈) vs 롯데(원정)
    [3, 4], // NC(홈) vs 두산(원정)
  ];
  for (let d = 0; d < 2; d++) {
    const dt = fmt(new Date(2026, 2, 28 + d));
    for (const [h, a] of opening) addGame(dt, "14:00", h, a);
  }

  // ── 2) 실제 대진 시리즈 생성 (3/31 ~ 4/30) ──────────────────────────
  // REAL_SERIES에 정의된 검증된 대진표를 그대로 사용
  for (const series of REAL_SERIES) {
    const [y, m, d] = series.start;
    for (let offset = 0; offset < 3; offset++) {
      const gd = new Date(y, m, d + offset);
      const gdow = gd.getDay();
      // 주말(토/일) 14:00, 평일 18:30
      const time = (gdow === 0 || gdow === 6) ? "14:00" : "18:30";
      const ds = fmt(gd);
      for (const [h, a] of series.matchups) {
        addGame(ds, time, h, a);
      }
    }
  }

  // ── 3) 라운드로빈 폴백: 5/1 이후 ~ 10/4 ───────────────────────────
  // 실제 대진 데이터가 없는 나머지 시즌은 라운드로빈으로 채움
  // 패턴: 화-목 3연전 + 금-일 3연전, 월요일 휴식
  const flipMap: Record<string, boolean> = {};
  function pk(a: number, b: number) { return `${Math.min(a, b)}-${Math.max(a, b)}`; }

  let ri = 0; // round-robin 순환 인덱스
  const cur = new Date(2026, 4, 1); // 5/1 목요일 (실제 대진 이후)
  const end = new Date(2026, 9, 5);  // 10/5

  while (cur < end && ri < 39) {
    const dow = cur.getDay(); // 0=일, 1=월, ..., 6=토

    // 월요일 휴식
    if (dow === 1) { cur.setDate(cur.getDate() + 1); continue; }

    // 올스타 브레이크: 7/10~15
    if (cur.getMonth() === 6 && cur.getDate() >= 10 && cur.getDate() <= 15) {
      cur.setDate(cur.getDate() + 1);
      continue;
    }

    // 화요일 또는 금요일에 3연전 시작
    if (dow === 2 || dow === 5) {
      const round = rrRounds[ri % rrRounds.length];

      for (let d = 0; d < 3; d++) {
        const gd = new Date(cur);
        gd.setDate(gd.getDate() + d);
        if (gd >= end) break;
        const gdow = gd.getDay();
        // 주말(토/일) 14:00, 평일 18:30
        const time = (gdow === 0 || gdow === 6) ? "14:00" : "18:30";
        const ds = fmt(gd);

        for (const [a, b] of round) {
          const key = pk(a, b);
          if (flipMap[key]) {
            addGame(ds, time, b, a);
          } else {
            addGame(ds, time, a, b);
          }
        }
      }

      // 다음 만남 시 홈/원정 교대
      for (const [a, b] of round) flipMap[pk(a, b)] = !flipMap[pk(a, b)];
      ri++;
      cur.setDate(cur.getDate() + 3);
    } else {
      cur.setDate(cur.getDate() + 1);
    }
  }

  return games;
}
