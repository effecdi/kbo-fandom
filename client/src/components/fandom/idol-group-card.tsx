import { Link } from "react-router";
import { Users, Heart } from "lucide-react";
import type { IdolGroup } from "@/lib/local-store";

interface IdolGroupCardProps {
  group: IdolGroup;
}

export function IdolGroupCard({ group }: IdolGroupCardProps) {
  return (
    <Link
      to={`/fandom/groups/${group.id}`}
      className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-foreground/15 transition-all hover:shadow-lg"
    >
      {/* Cover */}
      <div
        className="h-24 relative"
        style={{ background: `linear-gradient(135deg, ${group.coverColor}, ${group.coverColor}88)` }}
      >
        <div className="absolute -bottom-6 left-4">
          <div
            className="w-12 h-12 rounded-xl border-2 border-card flex items-center justify-center text-white font-black text-sm"
            style={{ backgroundColor: group.coverColor }}
          >
            {group.name.slice(0, 2)}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 pt-8 space-y-2">
        <div>
          <h3 className="text-sm font-bold text-foreground">{group.name}</h3>
          <p className="text-xs text-muted-foreground">{group.nameKo} · {group.company}</p>
        </div>
        <div className="flex items-center gap-1">
          <span
            className="px-2 py-0.5 rounded-full text-[11px] font-bold text-white"
            style={{ backgroundColor: group.coverColor }}
          >
            {group.fandomName}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[12px] text-muted-foreground pt-1">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {group.followers.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" />
            {group.fanartCount.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
