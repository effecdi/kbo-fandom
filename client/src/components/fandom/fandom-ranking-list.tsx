import { useState, useEffect } from "react";
import { Trophy, Heart, Image, Bookmark, Share2 } from "lucide-react";
import { getCreatorRanking, type FanCreator } from "@/lib/local-store";

const RANK_COLORS: Record<number, string> = {
  1: "bg-yellow-500 text-black",
  2: "bg-gray-400 text-black",
  3: "bg-amber-700 text-white",
};

interface FandomRankingListProps {
  groupId?: string;
  themeColor?: string;
}

export function FandomRankingList({ groupId, themeColor = "#7B2FF7" }: FandomRankingListProps) {
  const [rankings, setRankings] = useState<FanCreator[]>([]);

  useEffect(() => {
    let ranked = getCreatorRanking(20);
    if (groupId) {
      ranked = ranked.filter((c) => c.groupId === groupId);
    }
    setRankings(ranked.slice(0, 10));
  }, [groupId]);

  if (rankings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        아직 랭킹 데이터가 없습니다
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rankings.map((entry, idx) => {
        const rank = idx + 1;
        return (
          <div
            key={entry.id}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-black ${
                RANK_COLORS[rank] || "bg-muted text-muted-foreground"
              }`}
            >
              {rank}
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold" style={{ background: themeColor }}>
              <span className="text-[13px]">{entry.avatar}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground truncate">{entry.nickname}</p>
                {entry.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full text-white font-bold ${
                    entry.badge === "top" ? "bg-amber-500" :
                    entry.badge === "popular" ? "bg-pink-500" :
                    entry.badge === "rising" ? "bg-emerald-500" :
                    "bg-blue-500"
                  }`}>
                    {entry.badge === "top" ? "TOP" : entry.badge === "popular" ? "인기" : entry.badge === "rising" ? "성장" : "신규"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <Image className="w-3 h-3" />
                  {entry.fanartCount}
                </span>
                <span className="flex items-center gap-0.5">
                  <Heart className="w-3 h-3" />
                  {entry.totalLikes.toLocaleString()}
                </span>
                <span className="flex items-center gap-0.5">
                  <Bookmark className="w-3 h-3" />
                  {(entry.totalSaves || 0).toLocaleString()}
                </span>
                <span className="flex items-center gap-0.5">
                  <Share2 className="w-3 h-3" />
                  {(entry.totalShares || 0).toLocaleString()}
                </span>
              </div>
            </div>
            {rank <= 3 && (
              <Trophy className={`w-4 h-4 shrink-0 ${rank === 1 ? "text-yellow-500" : rank === 2 ? "text-gray-400" : "text-amber-700"}`} />
            )}
            <div className="text-right shrink-0">
              <p className="text-[11px] font-bold text-muted-foreground">
                {(entry.engagementScore || 0).toLocaleString()}
              </p>
              <p className="text-[9px] text-muted-foreground/60">점수</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
