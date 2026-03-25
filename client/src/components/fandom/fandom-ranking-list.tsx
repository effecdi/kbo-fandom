import { Trophy, Heart, Image } from "lucide-react";

const themeColor = "var(--fandom-primary, #7B2FF7)";

interface RankingEntry {
  rank: number;
  name: string;
  avatar: string;
  fanartCount: number;
  totalLikes: number;
}

const MOCK_RANKINGS: RankingEntry[] = [
  { rank: 1, name: "아미드로잉", avatar: "AD", fanartCount: 89, totalLikes: 12450 },
  { rank: 2, name: "블링크아트", avatar: "BA", fanartCount: 72, totalLikes: 9870 },
  { rank: 3, name: "버니작가", avatar: "BJ", fanartCount: 65, totalLikes: 8920 },
  { rank: 4, name: "캐럿크리에이터", avatar: "CC", fanartCount: 58, totalLikes: 7650 },
  { rank: 5, name: "스테이아트", avatar: "SA", fanartCount: 51, totalLikes: 6340 },
  { rank: 6, name: "마이드로우", avatar: "MD", fanartCount: 47, totalLikes: 5890 },
  { rank: 7, name: "다이브아트", avatar: "DA", fanartCount: 42, totalLikes: 4560 },
  { rank: 8, name: "피어낫작가", avatar: "FN", fanartCount: 38, totalLikes: 3920 },
  { rank: 9, name: "올리작가", avatar: "OA", fanartCount: 35, totalLikes: 3450 },
  { rank: 10, name: "드림스케이프", avatar: "DS", fanartCount: 31, totalLikes: 2890 },
];

const RANK_COLORS: Record<number, string> = {
  1: "bg-yellow-500 text-black",
  2: "bg-gray-400 text-black",
  3: "bg-amber-700 text-white",
};

interface FandomRankingListProps {
  groupId?: string;
}

export function FandomRankingList({ groupId }: FandomRankingListProps) {
  return (
    <div className="space-y-2">
      {MOCK_RANKINGS.map((entry) => (
        <div
          key={entry.rank}
          className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors"
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
              RANK_COLORS[entry.rank] || "bg-muted text-muted-foreground"
            }`}
          >
            {entry.rank}
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: themeColor }}>
            <span className="text-xs text-white font-bold">{entry.avatar}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{entry.name}</p>
            <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Image className="w-3 h-3" />
                {entry.fanartCount}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {entry.totalLikes.toLocaleString()}
              </span>
            </div>
          </div>
          {entry.rank <= 3 && (
            <Trophy className={`w-4 h-4 ${entry.rank === 1 ? "text-yellow-500" : entry.rank === 2 ? "text-gray-400" : "text-amber-700"}`} />
          )}
        </div>
      ))}
    </div>
  );
}
