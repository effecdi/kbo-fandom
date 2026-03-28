import type { KboTeam } from "@/lib/local-store";

interface TeamLogoProps {
  team: KboTeam | undefined;
  teamName?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  xs: "w-5 h-5",
  sm: "w-7 h-7",
  md: "w-10 h-10",
  lg: "w-12 h-12",
};

const TEXT_CLASSES = {
  xs: "text-[7px]",
  sm: "text-[9px]",
  md: "text-xs",
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
