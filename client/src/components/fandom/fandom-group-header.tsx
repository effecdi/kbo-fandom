import { useState } from "react";
import { Users, Heart, Calendar, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { KboTeam } from "@/lib/local-store";

interface FandomGroupHeaderProps {
  group: KboTeam;
}

export function FandomGroupHeader({ group }: FandomGroupHeaderProps) {
  const [following, setFollowing] = useState(false);

  return (
    <div className="rounded-2xl overflow-hidden border border-border bg-card">
      {/* Banner */}
      <div
        className="h-40 relative"
        style={{ background: `linear-gradient(135deg, ${group.coverColor}, ${group.coverColor}66, ${group.coverColor}33)` }}
      >
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Profile */}
      <div className="px-6 pb-6 -mt-10 relative">
        <div className="flex items-end gap-4">
          <div
            className="w-20 h-20 rounded-2xl border-4 border-card flex items-center justify-center text-white font-black text-xl shadow-lg"
            style={{ backgroundColor: group.coverColor }}
          >
            {group.name.slice(0, 2)}
          </div>
          <div className="flex-1 pb-1">
            <h1 className="text-2xl font-black text-foreground">{group.name}</h1>
            <p className="text-sm text-muted-foreground">{group.nameKo} · {group.city}</p>
          </div>
          <Button
            onClick={() => setFollowing(!following)}
            className={following
              ? "bg-muted text-foreground hover:bg-muted/80 gap-2"
              : "text-white font-bold gap-2 hover:opacity-90"
            }
            style={!following ? { backgroundColor: group.coverColor } : {}}
          >
            {following ? <Check className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
            {following ? "팔로잉" : "팔로우"}
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-3">{group.description}</p>

        <div className="flex items-center gap-6 mt-4">
          <span
            className="px-3 py-1 rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: group.coverColor }}
          >
            {group.fandomName}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span className="font-semibold text-foreground">{group.followers.toLocaleString()}</span> 팔로워
          </span>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Heart className="w-4 h-4" />
            <span className="font-semibold text-foreground">{group.fanartCount.toLocaleString()}</span> 팬아트
          </span>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {group.foundedYear}년 창단
          </span>
        </div>
      </div>
    </div>
  );
}
