import { useState, useEffect, useMemo } from "react";
import { StudioLayout } from "@/components/StudioLayout";
import { FandomFilterBar } from "@/components/fandom/fandom-filter-bar";
import { CheerSongCard } from "@/components/fandom/cheer-song-card";
import { Music } from "lucide-react";
import {
  listItems,
  STORE_KEYS,
  type CheerSong,
  type KboTeam,
} from "@/lib/local-store";

type SongTab = "all" | "team" | "player" | "situation";

const TABS: { id: SongTab; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "team", label: "구단가" },
  { id: "player", label: "선수 응원가" },
  { id: "situation", label: "상황별" },
];

export function FandomCheerSongs() {
  const [songs, setSongs] = useState<CheerSong[]>([]);
  const [teams, setTeams] = useState<KboTeam[]>([]);
  const [tab, setTab] = useState<SongTab>("all");
  const [teamFilter, setTeamFilter] = useState<string | null>(null);

  useEffect(() => {
    setSongs(listItems<CheerSong>(STORE_KEYS.CHEER_SONGS));
    setTeams(listItems<KboTeam>(STORE_KEYS.KBO_TEAMS));
  }, []);

  // Build team color lookup
  const teamColorMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of teams) {
      map.set(t.id, t.coverColor);
    }
    return map;
  }, [teams]);

  // Filtered songs
  const filtered = useMemo(() => {
    return songs
      .filter((s) => {
        if (tab !== "all" && s.type !== tab) return false;
        if (teamFilter && s.teamId !== teamFilter) return false;
        return true;
      })
      .sort((a, b) => a.order - b.order);
  }, [songs, tab, teamFilter]);

  return (
    <StudioLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Music className="w-6 h-6" />
            응원가 / 챈트
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            우리 팀 응원가와 챈트를 확인하고 함께 응원하세요
          </p>
        </div>

        {/* Team Filter */}
        <FandomFilterBar selected={teamFilter} onChange={setTeamFilter} />

        {/* Tab Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                tab === t.id
                  ? "bg-foreground text-background"
                  : "bg-muted/50 border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Song List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Music className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              응원가가 없습니다
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((song) => (
              <CheerSongCard
                key={song.id}
                song={song}
                teamColor={teamColorMap.get(song.teamId) || "#666"}
              />
            ))}
          </div>
        )}
      </div>
    </StudioLayout>
  );
}
