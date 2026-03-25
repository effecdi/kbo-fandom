import { Link } from "react-router";

const themeColor = "var(--fandom-primary, #7B2FF7)";

interface FandomTagBadgeProps {
  groupId: string;
  groupName: string;
  color?: string;
  memberName?: string;
  linkable?: boolean;
}

export function FandomTagBadge({ groupId, groupName, color, memberName, linkable = true }: FandomTagBadgeProps) {
  const content = (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold transition-opacity hover:opacity-80"
      style={{
        backgroundColor: color ? `${color}20` : `color-mix(in srgb, ${themeColor} 15%, transparent)`,
        color: color || themeColor,
      }}
    >
      {groupName}
      {memberName && <span className="opacity-70">· {memberName}</span>}
    </span>
  );

  if (linkable) {
    return <Link to={`/fandom/groups/${groupId}`}>{content}</Link>;
  }
  return content;
}
