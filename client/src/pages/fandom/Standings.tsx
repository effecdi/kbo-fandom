import { useState, useEffect } from "react";
import { Trophy, RefreshCw } from "lucide-react";
import {
  listItems,
  STORE_KEYS,
  getFandomProfile,
  type KboStanding,
} from "@/lib/local-store";
import { StudioLayout } from "@/components/StudioLayout";
import { StandingsTable } from "@/components/fandom/standings-table";
import { useKboStandings } from "@/hooks/use-kbo-standings";

export function FandomStandings() {
  const [localStandings, setLocalStandings] = useState<KboStanding[]>([]);
  const { standings: liveStandings, isLoading, error, refetch } = useKboStandings(60000);

  const fandomProfile = getFandomProfile();
  const myTeamId = fandomProfile?.groupId || undefined;

  useEffect(() => {
    // Fallback to local seed data
    setLocalStandings(listItems<KboStanding>(STORE_KEYS.KBO_STANDINGS));
  }, []);

  const hasLive = liveStandings.length > 0;

  return (
    <StudioLayout>
      <div className="space-y-6 max-w-full overflow-x-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              KBO 순위표
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {hasLive ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  실시간 데이터 · 2026 시즌
                </span>
              ) : (
                "2026 시즌"
              )}
            </p>
          </div>

          <button
            onClick={refetch}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-muted text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            새로고침
          </button>
        </div>

        {/* Error fallback notice */}
        {error && !hasLive && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-600">
            실시간 순위를 가져올 수 없습니다. 로컬 데이터를 표시합니다.
          </div>
        )}

        {/* Standings Table */}
        <StandingsTable
          standings={localStandings}
          liveStandings={hasLive ? liveStandings : undefined}
          myTeamId={myTeamId}
        />

        {/* Legend */}
        <p className="text-[13px] text-muted-foreground text-center py-4">
          {hasLive
            ? "네이버 스포츠 데이터 기반 · 1분마다 자동 갱신"
            : "개막일 기준 순위입니다. 경기 결과에 따라 업데이트됩니다."}
        </p>
      </div>
    </StudioLayout>
  );
}
