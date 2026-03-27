import { useState, useEffect, useMemo } from "react";
import { StudioLayout } from "@/components/StudioLayout";
import { StadiumInfoCard } from "@/components/fandom/stadium-info-card";
import { MapPin } from "lucide-react";
import {
  listItems,
  STORE_KEYS,
  getFandomProfile,
  type StadiumGuide,
  type KboTeam,
} from "@/lib/local-store";

export function FandomStadiumGuide() {
  const [guides, setGuides] = useState<StadiumGuide[]>([]);
  const [teams, setTeams] = useState<KboTeam[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  useEffect(() => {
    const loadedGuides = listItems<StadiumGuide>(STORE_KEYS.STADIUM_GUIDES);
    const loadedTeams = listItems<KboTeam>(STORE_KEYS.KBO_TEAMS);
    setGuides(loadedGuides);
    setTeams(loadedTeams);

    // Default to user's team from fandom profile
    const profile = getFandomProfile();
    if (profile?.groupId) {
      setSelectedTeamId(profile.groupId);
    } else if (loadedTeams.length > 0) {
      setSelectedTeamId(loadedTeams[0].id);
    }
  }, []);

  // Build team color lookup
  const teamColorMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of teams) {
      map.set(t.id, t.coverColor);
    }
    return map;
  }, [teams]);

  // Find the guide for the selected team
  // LG (team-lg) and Doosan (team-doo) share 잠실야구장 - guide teamId is "team-lg"
  const selectedGuide = useMemo(() => {
    if (!selectedTeamId) return null;

    // Direct match first
    const direct = guides.find((g) => g.teamId === selectedTeamId);
    if (direct) return direct;

    // Doosan shares with LG
    if (selectedTeamId === "team-doo") {
      return guides.find((g) => g.teamId === "team-lg") || null;
    }

    return null;
  }, [guides, selectedTeamId]);

  const selectedTeamColor = selectedTeamId
    ? teamColorMap.get(selectedTeamId) || "#666"
    : "#666";

  return (
    <StudioLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MapPin className="w-6 h-6" />
            직관 가이드
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            구장별 교통, 좌석, 맛집, 꿀팁 정보를 확인하세요
          </p>
        </div>

        {/* Team Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => setSelectedTeamId(team.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedTeamId === team.id
                  ? "text-white"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              style={
                selectedTeamId === team.id
                  ? { backgroundColor: team.coverColor }
                  : undefined
              }
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: team.coverColor }}
              />
              {team.name}
            </button>
          ))}
        </div>

        {/* Stadium Info */}
        {selectedGuide ? (
          <StadiumInfoCard guide={selectedGuide} teamColor={selectedTeamColor} />
        ) : (
          <div className="text-center py-16">
            <MapPin className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {selectedTeamId
                ? "해당 팀의 직관 가이드가 아직 없습니다"
                : "팀을 선택해주세요"}
            </p>
          </div>
        )}
      </div>
    </StudioLayout>
  );
}
