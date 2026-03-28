import type { KboTeam } from "@/lib/local-store";

interface TeamLogoProps {
  team: KboTeam | undefined;
  teamName?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  xs: "w-6 h-6",
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-14 h-14",
};

const TEXT_CLASSES = {
  xs: "text-[13px]",
  sm: "text-[13px]",
  md: "text-[13px]",
  lg: "text-sm",
};

export function TeamLogo({ team, teamName, size = "md", className = "" }: TeamLogoProps) {
  const sizeClass = SIZE_CLASSES[size];
  const textClass = TEXT_CLASSES[size];
  const name = teamName || team?.nameKo || "";
  const color = team?.coverColor || "#666";

  if (team?.logoUrl) {
    return (
      <div
        className={`${sizeClass} rounded-full overflow-hidden flex items-center justify-center bg-white ${className}`}
      >
        <img
          src={team.logoUrl}
          alt={name}
          className="w-full h-full object-contain"
          loading="lazy"
          onError={(e) => {
            // Fallback to text circle on error
            const target = e.currentTarget;
            target.style.display = "none";
            const parent = target.parentElement;
            if (parent) {
              parent.style.backgroundColor = color;
              parent.innerHTML = `<span class="text-white font-black ${textClass}">${name.slice(0, 2)}</span>`;
            }
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center text-white font-black ${textClass} ${className}`}
      style={{ backgroundColor: color }}
    >
      {name.slice(0, 2)}
    </div>
  );
}
