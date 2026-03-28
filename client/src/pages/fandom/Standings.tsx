import { useState, useEffect } from "react";
import { Trophy } from "lucide-react";
import {
  listItems,
  STORE_KEYS,
  getFandomProfile,
  type KboStanding,
} from "@/lib/local-store";
import { StudioLayout } from "@/components/StudioLayout";
import { StandingsTable } from "@/components/fandom/standings-table";

export function FandomStandings() {
  const [standings, setStandings] = useState<KboStanding[]>([]);

  const fandomProfile = getFandomProfile();
  const myTeamId = fandomProfile?.groupId || undefined;

  useEffect(() => {
    setStandings(listItems<KboStanding>(STORE_KEYS.KBO_STANDINGS));
  }, []);

  return (
    <StudioLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            KBO 순위표
          </h1>
          <p className="text-sm text-muted-foreground mt-1">2026 시즌</p>
        </div>

        {/* Standings Table */}
        <StandingsTable
          standings={standings}
          myTeamId={myTeamId}
        />

        {/* Note */}
        <p className="text-[13px] text-muted-foreground text-center py-4">
          개막일 기준 순위입니다. 경기 결과에 따라 업데이트됩니다.
        </p>
      </div>
    </StudioLayout>
  );
}
