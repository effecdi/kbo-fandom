import { Link } from "react-router";
import { Calendar, Trophy, Clock, MapPin } from "lucide-react";
import type { KboGameSchedule, KboTeam } from "@/lib/local-store";
import type { GameRelayData } from "@/hooks/use-kbo-game-relay";
import { BaseballDiamond } from "./baseball-diamond";

interface LiveGameDetailPanelProps {
  game: KboGameSchedule | null;
  teams: KboTeam[];
  relay: GameRelayData | null;
  relayLoading?: boolean;
  onRefresh?: () => void;
}

function TeamLogo({ team, size = "md" }: { team?: KboTeam; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "w-14 h-14 text-xl" : size === "md" ? "w-10 h-10 text-lg" : "w-8 h-8 text-sm";
  const cdnMap: Record<string, string> = {
    "team-lg": "LG", "team-kt": "KT", "team-ssg": "SK", "team-nc": "NC", "team-doo": "OB",
    "team-kia": "HT", "team-lot": "LT", "team-sam": "SS", "team-han": "HH", "team-kiw": "WO",
  };
  const code = team ? cdnMap[team.id] : null;
  const logoUrl = code ? `https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/emblem/regular/fixed/emblem_${code}.png` : null;

  return logoUrl ? (
    <img src={logoUrl} alt={team?.nameKo || ""} className={`${sizeClass} object-contain`} />
  ) : (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center text-white font-black`}
      style={{ background: team?.coverColor || "#374151" }}
    >
      {team?.name?.charAt(0) || "?"}
    </div>
  );
}

export function LiveGameDetailPanel({
  game,
  teams,
  relay,
  relayLoading,
  onRefresh,
}: LiveGameDetailPanelProps) {
  if (!game) {
    return (
      <div className="rounded-2xl border bg-card border-border p-6 h-full flex items-center justify-center min-h-[280px]">
        <p className="text-sm text-muted-foreground">경기를 선택하세요</p>
      </div>
    );
  }

  const homeTeam = teams.find((t) => t.id === game.homeTeamId);
  const awayTeam = teams.find((t) => t.id === game.awayTeamId);

  // Diamond for live games with relay data
  if (game.status === "live" && relay) {
    return (
      <div key={game.id} className="rounded-2xl overflow-hidden animate-in fade-in duration-300 h-full flex flex-col">
        <BaseballDiamond
          relay={relay}
          homeColor={homeTeam?.coverColor}
          awayColor={awayTeam?.coverColor}
          onRefresh={onRefresh}
          isRefreshing={relayLoading}
        />
      </div>
    );
  }

  if (game.status === "live" && relayLoading) {
    return (
      <div className="rounded-2xl overflow-hidden h-full min-h-[300px] flex items-center justify-center bg-gradient-to-b from-[#2d5a27] to-[#3a7233]">
        <div className="text-white/50 text-[13px] animate-pulse">
          중계 데이터 로딩 중...
        </div>
      </div>
    );
  }

  // Finished game: show score summary
  if (game.status === "finished") {
    const homeWon = (game.homeScore ?? 0) > (game.awayScore ?? 0);
    const awayWon = (game.awayScore ?? 0) > (game.homeScore ?? 0);

    return (
      <div className="rounded-2xl border bg-card border-border p-6 h-full flex flex-col items-center justify-center min-h-[280px] gap-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-bold text-muted-foreground">경기 종료</span>
        </div>

        <div className="flex items-center gap-8">
          {/* Away team */}
          <div className={`flex flex-col items-center gap-2 ${awayWon ? "" : "opacity-60"}`}>
            <TeamLogo team={awayTeam} size="lg" />
            <span className="text-[15px] font-bold text-foreground">{game.awayTeamName}</span>
          </div>

          {/* Score */}
          <div className="flex items-center gap-3">
            <span className={`text-4xl font-black ${awayWon ? "text-foreground" : "text-muted-foreground"}`}>
              {game.awayScore ?? 0}
            </span>
            <span className="text-xl text-muted-foreground">:</span>
            <span className={`text-4xl font-black ${homeWon ? "text-foreground" : "text-muted-foreground"}`}>
              {game.homeScore ?? 0}
            </span>
          </div>

          {/* Home team */}
          <div className={`flex flex-col items-center gap-2 ${homeWon ? "" : "opacity-60"}`}>
            <TeamLogo team={homeTeam} size="lg" />
            <span className="text-[15px] font-bold text-foreground">{game.homeTeamName}</span>
          </div>
        </div>

        {game.stadium && (
          <div className="flex items-center gap-1 text-[13px] text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{game.stadium}</span>
          </div>
        )}

        <Link
          to="/fandom/schedule"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-sm font-medium text-foreground hover:bg-muted/80 transition-all"
        >
          <Calendar className="w-4 h-4" />
          경기 일정 보기
        </Link>
      </div>
    );
  }

  // Scheduled game: show time + stadium info
  return (
    <div className="rounded-2xl border bg-card border-border p-6 h-full flex flex-col items-center justify-center min-h-[280px] gap-6">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-500" />
        <span className="text-sm font-bold text-muted-foreground">경기 예정</span>
      </div>

      <div className="flex items-center gap-8">
        {/* Away team */}
        <div className="flex flex-col items-center gap-2">
          <TeamLogo team={awayTeam} size="lg" />
          <span className="text-[15px] font-bold text-foreground">{game.awayTeamName}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-3xl font-black text-foreground">VS</span>
          <span className="text-lg font-bold text-blue-500">{game.time || "14:00"}</span>
        </div>

        {/* Home team */}
        <div className="flex flex-col items-center gap-2">
          <TeamLogo team={homeTeam} size="lg" />
          <span className="text-[15px] font-bold text-foreground">{game.homeTeamName}</span>
        </div>
      </div>

      {game.stadium && (
        <div className="flex items-center gap-1 text-[13px] text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span>{game.stadium}</span>
        </div>
      )}

      <Link
        to="/fandom/schedule"
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-sm font-medium text-foreground hover:bg-muted/80 transition-all"
      >
        <Calendar className="w-4 h-4" />
        경기 일정 보기
      </Link>
    </div>
  );
}
