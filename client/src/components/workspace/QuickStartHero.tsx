import { useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router";
import { Sparkles, ArrowRight, Trophy, Camera, Flag, Zap } from "lucide-react";
import { getFandomProfile } from "@/lib/local-store";

const QUICK_TEMPLATES = [
  {
    id: "player-card",
    icon: Trophy,
    label: "선수 응원 카드",
    prompt: "좋아하는 선수의 응원 카드를 만들어줘",
  },
  {
    id: "game-proof",
    icon: Camera,
    label: "직관 인증",
    prompt: "오늘 직관 인증 포토카드를 만들어줘",
  },
  {
    id: "cheer-banner",
    icon: Flag,
    label: "응원 배너",
    prompt: "경기장에서 쓸 응원 배너를 만들어줘",
  },
  {
    id: "game-result",
    icon: Zap,
    label: "경기 결과 카드",
    prompt: "오늘 경기 결과 카드를 만들어줘",
  },
];

export function QuickStartHero() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const profile = getFandomProfile();
  const themeColor = "var(--fandom-primary, #7B2FF7)";

  function handleGenerate(inputPrompt?: string) {
    const p = (inputPrompt ?? prompt).trim();
    if (!p) {
      navigate("/fandom/create");
      return;
    }
    const encoded = encodeURIComponent(p);
    navigate(`/studio/editor/new?prompt=${encoded}`);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  }

  function handleTemplateClick(template: (typeof QUICK_TEMPLATES)[number]) {
    if (template.prompt) {
      handleGenerate(template.prompt);
    } else {
      setIsFocused(true);
      document.getElementById("hero-input")?.focus();
    }
  }

  return (
    <div className="mb-12">
      {/* Hero section */}
      <div className="text-center mb-8">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg"
          style={{ background: themeColor }}
        >
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-black text-foreground mb-2">
          {profile ? `${profile.groupName} 팬아트를 만들어보세요` : "나만의 야구 팬아트를 만들어보세요"}
        </h1>
        <p className="text-muted-foreground">
          응원 카드, 직관 인증, 경기 기록까지 AI가 만들어드려요
        </p>
      </div>

      {/* Input area */}
      <div className="max-w-2xl mx-auto mb-6">
        <div
          className={`relative rounded-2xl border-2 transition-all duration-300 ${
            isFocused
              ? "shadow-lg"
              : "border-border hover:border-foreground/20"
          }`}
          style={isFocused ? { borderColor: themeColor } : {}}
        >
          <div className="flex items-center gap-3 px-5 py-4">
            <Sparkles
              className="w-5 h-5 shrink-0 transition-colors"
              style={{ color: isFocused ? themeColor : undefined }}
            />
            <input
              id="hero-input"
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={profile ? `${profile.groupName} 선수 카드, 응원 배너, 직관 인증 뭐든 가능!` : "예: 우리 팀 에이스 응원 카드 만들어줘"}
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:outline-none text-base"
            />
            <button
              onClick={() => handleGenerate()}
              className="px-5 py-2 rounded-xl text-white font-bold text-sm flex items-center gap-2 transition-colors shrink-0 hover:opacity-90"
              style={{ background: themeColor }}
            >
              <span>시작</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick template buttons */}
      <div className="flex justify-center gap-3 flex-wrap">
        {QUICK_TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => handleTemplateClick(template)}
            className="group flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:border-foreground/20 hover:shadow-md transition-all"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
              style={{ background: themeColor }}
            >
              <template.icon className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-foreground">
              {template.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
