import { Link } from "react-router";
import { Calendar, Users, Trophy, Sparkles, Clock } from "lucide-react";
import type { FandomEvent } from "@/lib/local-store";

const themeColor = "var(--fandom-primary, #7B2FF7)";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  active: { label: "진행중", color: "text-green-500 bg-green-500/10", icon: Sparkles },
  upcoming: { label: "예정", color: "text-amber-500 bg-amber-500/10", icon: Clock },
  ended: { label: "종료", color: "text-gray-500 bg-gray-500/10", icon: Trophy },
};

const TYPE_LABELS: Record<string, string> = {
  challenge: "챌린지",
  contest: "콘테스트",
  anniversary: "기념일",
  collab: "콜라보",
};

interface FandomEventCardProps {
  event: FandomEvent;
}

export function FandomEventCard({ event }: FandomEventCardProps) {
  const status = STATUS_CONFIG[event.status];

  return (
    <Link
      to={`/fandom/events/${event.id}`}
      className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-foreground/15 transition-all hover:shadow-lg"
    >
      {/* Cover */}
      <div
        className="h-28 relative"
        style={{ background: `linear-gradient(135deg, ${event.coverColor}, ${event.coverColor}66)` }}
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-[13px] font-bold ${status.color}`}>
            {status.label}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 rounded-full text-[13px] font-bold bg-white/20 text-white backdrop-blur-sm">
            {TYPE_LABELS[event.type]}
          </span>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="text-white/80 text-[13px] font-medium">{event.groupName}</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <h3 className="text-sm font-bold text-foreground group-hover:text-[var(--fandom-primary)] transition-colors">
          {event.title}
        </h3>
        <p className="text-[13px] text-muted-foreground line-clamp-2">{event.description}</p>
        <div className="flex items-center gap-3 text-[13px] text-muted-foreground pt-1">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {event.startDate} ~ {event.endDate}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {event.participants}명
          </span>
        </div>
        {event.prize && (
          <div className="flex items-center gap-1.5 text-[13px]">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-muted-foreground">{event.prize}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
