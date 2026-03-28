import { useState, useEffect, useRef, useCallback } from "react";

interface FloatingEmoji {
  id: number;
  emoji: string;
  x: number;
  startTime: number;
}

interface EmojiReactionsProps {
  gameId: string;
}

const EMOJIS = ["🔥", "⚾", "👏", "😍", "💪", "🎉", "😱", "❤️"];
let emojiCounter = 0;

export function EmojiReactions({ gameId }: EmojiReactionsProps) {
  const [floating, setFloating] = useState<FloatingEmoji[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Connect WebSocket with auto-reconnect
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;
    let unmounted = false;

    const connect = () => {
      if (unmounted) return;
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/ws/reactions`;
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => { attempts = 0; };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "reaction" && data.gameId === gameId) {
              addFloatingEmoji(data.emoji);
            }
          } catch { /* ignore */ }
        };

        ws.onerror = () => { /* silent */ };

        ws.onclose = () => {
          wsRef.current = null;
          if (!unmounted && attempts < 5) {
            const delay = Math.min(2000 * Math.pow(2, attempts), 30000);
            attempts++;
            reconnectTimer = setTimeout(connect, delay);
          }
        };
      } catch { /* WebSocket constructor can throw in some environments */ }
    };

    connect();

    return () => {
      unmounted = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) { ws.onclose = null; ws.close(); }
      wsRef.current = null;
    };
  }, [gameId]);

  // Clean up old floating emojis
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setFloating((prev) => prev.filter((e) => now - e.startTime < 2500));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const addFloatingEmoji = useCallback((emoji: string) => {
    const id = emojiCounter++;
    const x = 10 + Math.random() * 80; // random horizontal position %
    setFloating((prev) => [...prev.slice(-20), { id, emoji, x, startTime: Date.now() }]);
  }, []);

  const sendReaction = useCallback(
    (emoji: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "reaction", emoji, gameId }));
      }
      // Also show locally
      addFloatingEmoji(emoji);
    },
    [gameId, addFloatingEmoji],
  );

  return (
    <div ref={containerRef} className="relative">
      {/* Floating emojis */}
      <div className="absolute bottom-full left-0 right-0 h-40 pointer-events-none overflow-hidden">
        {floating.map((e) => {
          const age = (Date.now() - e.startTime) / 2500;
          return (
            <span
              key={e.id}
              className="absolute text-2xl animate-emoji-float"
              style={{
                left: `${e.x}%`,
                bottom: `${age * 100}%`,
                opacity: 1 - age,
                transform: `scale(${1 - age * 0.3})`,
                transition: "all 0.3s ease-out",
              }}
            >
              {e.emoji}
            </span>
          );
        })}
      </div>

      {/* Emoji buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-2 px-1">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => sendReaction(emoji)}
            className="shrink-0 w-10 h-10 rounded-full bg-muted/50 hover:bg-muted hover:scale-110 active:scale-95 flex items-center justify-center text-lg transition-all border border-border"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
