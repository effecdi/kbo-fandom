interface ShinyTextProps {
  children: string;
  className?: string;
  shimmerColor?: string;
}

export function ShinyText({
  children,
  className = "",
  shimmerColor = "#00e5cc",
}: ShinyTextProps) {
  return (
    <span
      className={`inline-block bg-clip-text text-transparent animate-shimmer ${className}`}
      style={{
        backgroundImage: `linear-gradient(90deg, currentColor 0%, ${shimmerColor} 50%, currentColor 100%)`,
        backgroundSize: "200% 100%",
        animation: "shimmer 3s infinite",
      }}
    >
      <style>{`
        @keyframes shimmer {
          0%, 100% { background-position: 200% 0; }
          50% { background-position: -200% 0; }
        }
      `}</style>
      {children}
    </span>
  );
}
