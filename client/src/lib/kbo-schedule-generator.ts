import type { KboGameSchedule } from "./local-store";

/**
 * 2026 KBO 정규시즌 전체 일정 생성기
 * - 개막: 3/28(토) 2연전 (KBO 공식 대진 반영)
 * - 정규시즌: 3/31 ~ 10/4 (화-목, 금-일 3연전, 월요일 휴식)
 * - 올스타 브레이크: 7/10~15
 * - 라운드 로빈 순환 + 홈/원정 교대
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

  // ── Round-robin (circle method): 9 rounds × 5 pairs ──────────────────
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

  // ── Home/away tracker (교대) ──────────────────────────────────────────
  const flipMap: Record<string, boolean> = {};
  function pk(a: number, b: number) { return `${Math.min(a, b)}-${Math.max(a, b)}`; }
  for (const [h, a] of opening) flipMap[pk(h, a)] = true;

  // ── 2) 정규시즌: 3/31(화) ~ 10/4(일) ─────────────────────────────────
  // 패턴: 화-목 3연전 + 금-일 3연전, 월요일 휴식
  // 48 라운드 × 3일 × 5경기 = 720경기 (+ 개막 10경기 = 730)
  let ri = 0;
  const cur = new Date(2026, 2, 31); // 3/31 화요일
  const end = new Date(2026, 9, 5);  // 10/5

  while (cur < end && ri < 48) {
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
