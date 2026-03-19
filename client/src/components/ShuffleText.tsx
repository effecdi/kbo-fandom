import { useEffect, useRef, useState } from "react";

interface ShuffleTextProps {
  children: string;
  className?: string;
  interval?: number;
}

export function ShuffleText({ children, className = "", interval = 50 }: ShuffleTextProps) {
  const [displayText, setDisplayText] = useState(children);
  const [isShuffling, setIsShuffling] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const shuffle = () => {
    setIsShuffling(true);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    const iterations = children.length;
    let iteration = 0;

    const intervalId = setInterval(() => {
      setDisplayText(
        children
          .split("")
          .map((char, index) => {
            if (index < iteration) {
              return children[index];
            }
            if (char === " ") return " ";
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= iterations) {
        clearInterval(intervalId);
        setIsShuffling(false);
      }

      iteration += 1 / 3;
    }, interval);
  };

  return (
    <span
      className={className}
      onMouseEnter={shuffle}
      style={{ fontFamily: "monospace" }}
    >
      {displayText}
    </span>
  );
}
